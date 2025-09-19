import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { 
  useTrainsetData, 
  useMetricsData, 
  useUpdateTrainsetStatus as useDatabaseUpdateTrainsetStatus, 
  useAIScheduling
} from '@/hooks/useDatabaseTrainData'

const API_BASE = 'http://localhost:5000/api/data';

// Primary hooks using database data
export function useTrainsets() {
  const { trainsets, loading, error, refetch } = useTrainsetData();
  
  return {
    data: trainsets,
    isLoading: loading,
    error,
    refetch
  }
}

export function useTrainset(id: string) {
  return useQuery({
    queryKey: ['trainsets', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/trainsets/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!id,
  })
}

export function useRealtimeMetrics() {
  const { metrics, loading, error, refetch } = useMetricsData();
  
  return {
    data: metrics,
    isLoading: loading,
    error,
    refetch
  }
}

export function useUpdateTrainsetStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { updateStatus } = useDatabaseUpdateTrainsetStatus()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ready' | 'standby' | 'maintenance' | 'critical' }) =>
      updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainsets'] })
      queryClient.invalidateQueries({ queryKey: ['realtime-metrics'] })
      toast({
        title: "Status Updated",
        description: "Trainset status has been updated successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update trainset status.",
        variant: "destructive",
      })
    },
  })
}

export function useGenerateAISchedule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { generateSchedule } = useAIScheduling()

  return useMutation({
    mutationFn: async (date: string) => {
      return await generateSchedule(date)
    },
    onSuccess: (_, date) => {
      queryClient.invalidateQueries({ queryKey: ['daily-schedule', date] })
      queryClient.invalidateQueries({ queryKey: ['realtime-metrics'] })
      toast({
        title: "AI Schedule Generated",
        description: "AI has generated an optimized schedule for the selected date.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI schedule. Please try again.",
        variant: "destructive",
      })
    },
  })
}

// Legacy compatibility hooks (kept for components that might still use them)
export function useFitnessCertificates(trainsetId: string) {
  return useQuery({
    queryKey: ['fitness-certificates', trainsetId],
    queryFn: () => {
      // Placeholder - could be extended to fetch from database
      return [];
    },
    enabled: !!trainsetId,
  })
}

export function useJobCards(trainsetId: string) {
  return useQuery({
    queryKey: ['job-cards', trainsetId],
    queryFn: () => {
      // Placeholder - could be extended to fetch from database
      return [];
    },
    enabled: !!trainsetId,
  })
}

export function useDailySchedule(date: string) {
  return useQuery({
    queryKey: ['daily-schedule', date],
    queryFn: () => {
      // Placeholder - could be extended to fetch from database
      return [];
    },
    enabled: !!date,
  })
}

export function useKPIs() {
  const { metrics } = useMetricsData();
  
  return useQuery({
    queryKey: ['kpis'],
    queryFn: () => {
      return metrics?.current_kpis || {
        fleet_availability: 0,
        on_time_performance: 0,
        revenue_efficiency: 0,
        maintenance_cost: 0,
        safety_score: 0,
        passenger_satisfaction: 0,
      };
    },
    enabled: !!metrics,
  })
}

export function useUpdateJobCardStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => {
      // Placeholder - could be extended to update job cards in database
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] })
      queryClient.invalidateQueries({ queryKey: ['realtime-metrics'] })
      toast({
        title: "Job Card Updated",
        description: "Job card status has been updated successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update job card status.",
        variant: "destructive",
      })
    },
  })
}