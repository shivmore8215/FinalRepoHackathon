import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Trainset {
  id: string
  number: string
  status: 'ready' | 'standby' | 'maintenance' | 'critical'
  bay_position: number
  mileage: number
  last_cleaning: string
  branding_priority: number
  availability_percentage: number
  created_at: string
  updated_at: string
}

export interface FitnessCertificate {
  id: string
  trainset_id: string
  certificate_type: string
  issue_date: string
  expiry_date: string
  status: 'active' | 'expired' | 'expiring'
}

export interface JobCard {
  id: string
  trainset_id: string
  maximo_work_order: string
  status: 'open' | 'in_progress' | 'closed'
  description: string
  priority: number
  estimated_hours: number
  actual_hours?: number
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface DailySchedule {
  id: string
  schedule_date: string
  trainset_id: string
  planned_status: string
  ai_confidence_score: number
  reasoning: {
    factors: string[]
    risk_factors: string[]
    priority_score: number
  }
  created_at: string
  updated_at: string
}

export interface KPIMetrics {
  id: string
  metric_date: string
  punctuality_percentage: number
  fleet_availability: number
  maintenance_cost: number
  energy_consumption: number
  created_at: string
}

// API functions
export const trainsetAPI = {
  async getAll(): Promise<Trainset[]> {
    const { data, error } = await supabase
      .from('trainsets')
      .select('*')
      .order('number')
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Trainset | null> {
    const { data, error } = await supabase
      .from('trainsets')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('trainsets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }
}

export const fitnessAPI = {
  async getByTrainsetId(trainsetId: string): Promise<FitnessCertificate[]> {
    const { data, error } = await supabase
      .from('fitness_certificates')
      .select('*')
      .eq('trainset_id', trainsetId)
      .order('expiry_date')
    
    if (error) throw error
    return data || []
  }
}

export const jobCardAPI = {
  async getByTrainsetId(trainsetId: string): Promise<JobCard[]> {
    const { data, error } = await supabase
      .from('job_cards')
      .select('*')
      .eq('trainset_id', trainsetId)
      .order('priority', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async updateStatus(id: string, status: string, actualHours?: number): Promise<void> {
    const updates: any = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    
    if (status === 'closed') {
      updates.completed_at = new Date().toISOString()
      if (actualHours) updates.actual_hours = actualHours
    }

    const { error } = await supabase
      .from('job_cards')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
  }
}

export const scheduleAPI = {
  async getByDate(date: string): Promise<DailySchedule[]> {
    const { data, error } = await supabase
      .from('daily_schedules')
      .select(`
        *,
        trainsets(number, status)
      `)
      .eq('schedule_date', date)
      .order('ai_confidence_score', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async generateAISchedule(date: string): Promise<any> {
    const { data, error } = await supabase.functions.invoke('ai-schedule-optimizer', {
      body: { scheduleDate: date }
    })
    
    if (error) throw error
    return data
  }
}

export const metricsAPI = {
  async getRealtimeMetrics(): Promise<any> {
    const { data, error } = await supabase.functions.invoke('realtime-metrics')
    
    if (error) throw error
    return data
  },

  async getKPIs(): Promise<KPIMetrics[]> {
    const { data, error } = await supabase
      .from('kpi_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(30)
    
    if (error) throw error
    return data || []
  }
}