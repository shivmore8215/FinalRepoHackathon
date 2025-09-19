import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api/data';

export interface TrainsetData {
  id: string;
  number: string;
  status: 'ready' | 'standby' | 'maintenance' | 'critical';
  bay_position: number;
  mileage: number;
  last_cleaning: string;
  branding_priority: number;
  availability_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface MetricsData {
  timestamp: string;
  fleet_status: {
    total_fleet: number;
    ready: number;
    standby: number;
    maintenance: number;
    critical: number;
    serviceability: number;
    avg_availability: number;
  };
  current_kpis: {
    fleet_availability: number;
    on_time_performance: number;
    revenue_efficiency: number;
    maintenance_cost: number;
    safety_score: number;
    passenger_satisfaction: number;
  };
  planning_status: {
    schedules_generated: number;
    ai_confidence_avg: number;
    last_optimization: string;
  };
  alerts: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
  }>;
}

export interface AIScheduleResponse {
  success: boolean;
  recommendations: Array<{
    trainset_id: string;
    recommended_status: string;
    confidence_score: number;
    reasoning: string[];
    priority_score: number;
    risk_factors: string[];
  }>;
  summary: {
    total_trainsets: number;
    recommendations: Record<string, number>;
    average_confidence: number;
    high_risk_count: number;
    optimization_timestamp: string;
  };
  timestamp: string;
}

// Hook for fetching trainsets from MongoDB
export const useTrainsetData = () => {
  const [trainsets, setTrainsets] = useState<TrainsetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainsets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/trainsets`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTrainsets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trainsets');
      console.error('Error fetching trainsets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainsets();
  }, []);

  return {
    trainsets,
    loading,
    error,
    refetch: fetchTrainsets
  };
};

// Hook for fetching metrics from MongoDB
export const useMetricsData = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/metrics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};

// Hook for updating trainset status
export const useUpdateTrainsetStatus = () => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (trainsetId: string, status: 'ready' | 'standby' | 'maintenance' | 'critical') => {
    try {
      setUpdating(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/trainsets/${trainsetId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update trainset status';
      setError(errorMessage);
      console.error('Error updating trainset status:', err);
      throw new Error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateStatus,
    updating,
    error
  };
};

// Hook for AI scheduling
export const useAIScheduling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSchedule = async (date: string): Promise<AIScheduleResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/ai-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI schedule';
      setError(errorMessage);
      console.error('Error generating AI schedule:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    generateSchedule,
    loading,
    error
  };
};

// Combined hook for all train-related data (replacement for the old useTrainData)
export const useTrainData = () => {
  const { trainsets, loading: trainsetsLoading, error: trainsetsError, refetch: refetchTrainsets } = useTrainsetData();
  const { metrics, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useMetricsData();
  const { updateStatus, updating, error: updateError } = useUpdateTrainsetStatus();

  // Compute derived data for backward compatibility
  const totalTrains = trainsets.length;
  const readyTrains = trainsets.filter(t => t.status === 'ready').length;
  const standbyTrains = trainsets.filter(t => t.status === 'standby').length;
  const maintenanceTrains = trainsets.filter(t => t.status === 'maintenance').length;
  const criticalTrains = trainsets.filter(t => t.status === 'critical').length;

  const updateTrainStatus = async (trainId: string, newStatus: 'ready' | 'standby' | 'maintenance' | 'critical') => {
    try {
      await updateStatus(trainId, newStatus);
      // Refetch data after successful update
      await Promise.all([refetchTrainsets(), refetchMetrics()]);
    } catch (error) {
      throw error;
    }
  };

  return {
    // Core data
    trainsets,
    metrics,
    
    // Loading states
    loading: trainsetsLoading || metricsLoading,
    updating,
    
    // Error states
    error: trainsetsError || metricsError || updateError,
    
    // Functions
    updateTrainStatus,
    refetch: () => Promise.all([refetchTrainsets(), refetchMetrics()]),
    
    // Backward compatibility - computed stats
    totalTrains,
    readyTrains,
    standbyTrains,
    maintenanceTrains,
    criticalTrains
  };
};