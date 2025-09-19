import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      trainsets: {
        Row: {
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
        Insert: {
          id?: string
          number: string
          status?: 'ready' | 'standby' | 'maintenance' | 'critical'
          bay_position: number
          mileage?: number
          last_cleaning?: string
          branding_priority?: number
          availability_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          number?: string
          status?: 'ready' | 'standby' | 'maintenance' | 'critical'
          bay_position?: number
          mileage?: number
          last_cleaning?: string
          branding_priority?: number
          availability_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      fitness_certificates: {
        Row: {
          id: string
          trainset_id: string
          certificate_type: 'rolling_stock' | 'signalling' | 'telecom'
          issue_date: string
          expiry_date: string
          certificate_number: string
          issued_by: string
          is_valid: boolean
          created_at: string
        }
      }
      job_cards: {
        Row: {
          id: string
          trainset_id: string
          maximo_work_order: string
          status: 'open' | 'closed'
          description: string | null
          priority: number
          estimated_hours: number | null
          actual_hours: number | null
          created_at: string
          completed_at: string | null
          updated_at: string
        }
      }
      daily_schedules: {
        Row: {
          id: string
          schedule_date: string
          trainset_id: string
          planned_status: 'ready' | 'standby' | 'maintenance' | 'critical'
          actual_status: 'ready' | 'standby' | 'maintenance' | 'critical' | null
          service_hours: number | null
          mileage_assigned: number | null
          branding_exposure_hours: number | null
          ai_confidence_score: number | null
          reasoning: any | null
          created_at: string
          updated_at: string
        }
      }
      kpi_metrics: {
        Row: {
          id: string
          metric_date: string
          punctuality_percentage: number | null
          fleet_availability: number | null
          maintenance_cost: number | null
          energy_consumption: number | null
          passenger_satisfaction: number | null
          created_at: string
        }
      }
    }
  }
}