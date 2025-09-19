import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trainsetAPI, fitnessAPI, jobCardAPI, scheduleAPI, metricsAPI } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { mockTrainsets, mockMetrics, generateMockAIRecommendations } from '@/lib/mockData'

export function useTrainsets() {
  return useQuery({
    queryKey: ['trainsets'],
    queryFn: async () => {
      try {
        return await trainsetAPI.getAll()
      } catch (error) {
        // Fallback to mock data if Supabase is not available
        console.log('Using mock data for trainsets')
        return mockTrainsets
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useTrainset(id: string) {
  return useQuery({
    queryKey: ['trainsets', id],
    queryFn: () => trainsetAPI.getById(id),
    enabled: !!id,
  })
}

export function useFitnessCertificates(trainsetId: string) {
  return useQuery({
    queryKey: ['fitness-certificates', trainsetId],
    queryFn: () => fitnessAPI.getByTrainsetId(trainsetId),
    enabled: !!trainsetId,
  })
}

export function useJobCards(trainsetId: string) {
  return useQuery({
    queryKey: ['job-cards', trainsetId],
    queryFn: () => jobCardAPI.getByTrainsetId(trainsetId),
    enabled: !!trainsetId,
  })
}

export function useDailySchedule(date: string) {
  return useQuery({
    queryKey: ['daily-schedule', date],
    queryFn: () => scheduleAPI.getByDate(date),
    enabled: !!date,
  })
}

export function useRealtimeMetrics() {
  return useQuery({
    queryKey: ['realtime-metrics'],
    queryFn: async () => {
      try {
        return await metricsAPI.getRealtimeMetrics()
      } catch (error) {
        // Fallback to mock data if Supabase is not available
        console.log('Using mock data for metrics')
        return mockMetrics
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

export function useKPIs() {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: metricsAPI.getKPIs,
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useUpdateTrainsetStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      trainsetAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainsets'] })
      queryClient.invalidateQueries({ queryKey: ['realtime-metrics'] })
      toast({
        title: "Status Updated",
        description: "Trainset status has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update trainset status.",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateJobCardStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, status, actualHours }: { id: string; status: string; actualHours?: number }) =>
      jobCardAPI.updateStatus(id, status, actualHours),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-cards', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['realtime-metrics'] })
      toast({
        title: "Job Card Updated",
        description: "Job card status has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update job card status.",
        variant: "destructive",
      })
    },
  })
}

export function useGenerateAISchedule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (date: string) => {
      try {
        return await scheduleAPI.generateAISchedule(date)
      } catch (error) {
        // Fallback to mock AI recommendations
        console.log('Using mock AI recommendations')
        const trainsets = mockTrainsets
        const recommendations = generateMockAIRecommendations(trainsets)
        return {
          success: true,
          recommendations,
          summary: {
            total_trainsets: trainsets.length,
            recommendations: recommendations.reduce((acc: any, rec) => {
              acc[rec.recommended_status] = (acc[rec.recommended_status] || 0) + 1
              return acc
            }, {}),
            average_confidence: Math.round(recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) / recommendations.length * 100) / 100,
            high_risk_count: recommendations.filter(r => r.risk_factors.length > 0).length,
            optimization_timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        }
      }
    },
    onSuccess: (_, date) => {
      queryClient.invalidateQueries({ queryKey: ['daily-schedule', date] })
      queryClient.invalidateQueries({ queryKey: ['realtime-metrics'] })
      toast({
        title: "AI Schedule Generated",
        description: "AI has generated an optimized schedule for the selected date.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate AI schedule. Please try again.",
        variant: "destructive",
      })
    },
  })
}