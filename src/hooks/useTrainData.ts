import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export interface TrainSet {
  id: string;
  number: string;
  status: "ready" | "standby" | "maintenance" | "critical";
  fitnessExpiry: Date;
  jobCardStatus: "open" | "closed";
  brandingPriority: number;
  mileage: number;
  lastCleaning: Date;
  bayPosition: number;
  availability: number;
  fitnessReasons?: string[];
  jobCards?: any[];
  maintenanceAlerts?: string[];
}

export interface SystemMetrics {
  ready: number;
  standby: number;
  maintenance: number;
  critical: number;
  totalFleet: number;
  serviceability: number;
  punctuality: number;
  lastUpdated: Date;
}

export interface AIRecommendation {
  trainsetId: string;
  recommendedStatus: string;
  confidenceScore: number;
  reasoning: string[];
  priorityScore: number;
  riskFactors: string[];
}

export const useTrainData = () => {
  const [trainSets, setTrainSets] = useState<TrainSet[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTrainSets = async () => {
    try {
      const { data, error } = await supabase
        .from('trainsets')
        .select(`
          *,
          fitness_certificates(*),
          job_cards(*)
        `)
        .order('bay_position');

      if (error) throw error;

      const formattedData: TrainSet[] = data.map((trainset: any) => {
        const nearestFitnessExpiry = trainset.fitness_certificates
          ?.sort((a: any, b: any) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())[0];

        const openJobCards = trainset.job_cards?.filter((jc: any) => jc.status === 'open') || [];
        
        return {
          id: trainset.id,
          number: trainset.number,
          status: trainset.status,
          fitnessExpiry: nearestFitnessExpiry ? new Date(nearestFitnessExpiry.expiry_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          jobCardStatus: openJobCards.length > 0 ? 'open' : 'closed',
          brandingPriority: trainset.branding_priority,
          mileage: trainset.mileage,
          lastCleaning: new Date(trainset.last_cleaning),
          bayPosition: trainset.bay_position,
          availability: trainset.availability_percentage,
          jobCards: trainset.job_cards,
          fitnessReasons: trainset.fitness_certificates?.map((cert: any) => 
            `${cert.certificate_type}: expires ${new Date(cert.expiry_date).toLocaleDateString()}`
          ) || [],
          maintenanceAlerts: openJobCards.map((jc: any) => 
            `${jc.description} (Priority: ${jc.priority})`
          )
        };
      });

      setTrainSets(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch train data');
      toast({
        title: "Error",
        description: "Failed to load train data",
        variant: "destructive"
      });
    }
  };

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('realtime-metrics');
      
      if (error) throw error;

      setMetrics({
        ready: data.fleet_status.ready,
        standby: data.fleet_status.standby,
        maintenance: data.fleet_status.maintenance,
        critical: data.fleet_status.critical,
        totalFleet: data.fleet_status.total_fleet,
        serviceability: data.fleet_status.serviceability,
        punctuality: data.current_kpis.punctuality,
        lastUpdated: new Date(data.timestamp)
      });
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const generateAISchedule = async (scheduleDate: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('ai-schedule-optimizer', {
        body: {
          scheduleDate,
          forceRecompute: true,
          constraints: {
            target_punctuality: 99.5,
            max_service_hours: 18,
            min_maintenance_interval: 7
          }
        }
      });

      if (error) throw error;

      const aiRecs: AIRecommendation[] = data.recommendations.map((rec: any) => ({
        trainsetId: rec.trainset_id,
        recommendedStatus: rec.recommended_status,
        confidenceScore: rec.confidence_score,
        reasoning: rec.reasoning,
        priorityScore: rec.priority_score,
        riskFactors: rec.risk_factors
      }));

      setRecommendations(aiRecs);
      
      toast({
        title: "AI Schedule Generated",
        description: `Generated recommendations for ${aiRecs.length} trainsets with ${Math.round(data.summary.average_confidence * 100)}% avg confidence`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI schedule';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTrainsetStatus = async (trainsetId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('trainsets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', trainsetId);

      if (error) throw error;

      // Update local state
      setTrainSets(prev => prev.map(ts => 
        ts.id === trainsetId ? { ...ts, status: newStatus as any } : ts
      ));

      toast({
        title: "Status Updated",
        description: "Trainset status updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update trainset status",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTrainSets(), fetchMetrics()]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscriptions
    const trainsetSubscription = supabase
      .channel('trainsets_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trainsets' },
        () => fetchTrainSets()
      )
      .subscribe();

    const scheduleSubscription = supabase
      .channel('schedule_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'daily_schedules' },
        () => fetchMetrics()
      )
      .subscribe();

    // Refresh metrics every 30 seconds
    const metricsInterval = setInterval(fetchMetrics, 30000);

    return () => {
      trainsetSubscription.unsubscribe();
      scheduleSubscription.unsubscribe();
      clearInterval(metricsInterval);
    };
  }, []);

  return {
    trainSets,
    metrics,
    recommendations,
    loading,
    error,
    generateAISchedule,
    updateTrainsetStatus,
    refreshData: () => Promise.all([fetchTrainSets(), fetchMetrics()])
  };
};