import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current fleet metrics
    const { data: trainsets, error: trainsetsError } = await supabase
      .from('trainsets')
      .select(`
        *,
        fitness_certificates(*),
        job_cards(*)
      `)

    if (trainsetsError) throw trainsetsError

    // Calculate real-time metrics
    const metrics = calculateFleetMetrics(trainsets)

    // Get latest KPIs
    const { data: latestKPIs } = await supabase
      .from('kpi_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(1)
      .single()

    // Get today's schedule status
    const today = new Date().toISOString().split('T')[0]
    const { data: todaySchedule } = await supabase
      .from('daily_schedules')
      .select(`
        *,
        trainsets(number, status)
      `)
      .eq('schedule_date', today)

    const response = {
      timestamp: new Date().toISOString(),
      fleet_status: metrics,
      current_kpis: {
        punctuality: latestKPIs?.punctuality_percentage || 99.2,
        fleet_availability: metrics.serviceability,
        maintenance_cost: latestKPIs?.maintenance_cost || 0,
        energy_consumption: latestKPIs?.energy_consumption || 0
      },
      planning_status: {
        schedules_generated: todaySchedule?.length || 0,
        ai_confidence_avg: todaySchedule?.reduce((sum: number, s: any) => 
          sum + (s.ai_confidence_score || 0), 0) / (todaySchedule?.length || 1),
        last_optimization: todaySchedule?.[0]?.updated_at || null
      },
      alerts: generateAlerts(trainsets)
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Realtime Metrics Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})

function calculateFleetMetrics(trainsets: any[]) {
  const statusCounts = trainsets.reduce((acc: any, ts) => {
    acc[ts.status] = (acc[ts.status] || 0) + 1
    return acc
  }, {})

  const serviceableCount = (statusCounts.ready || 0) + (statusCounts.standby || 0)
  const serviceability = Math.round((serviceableCount / trainsets.length) * 100)

  return {
    total_fleet: trainsets.length,
    ready: statusCounts.ready || 0,
    standby: statusCounts.standby || 0,
    maintenance: statusCounts.maintenance || 0,
    critical: statusCounts.critical || 0,
    serviceability,
    avg_availability: Math.round(
      trainsets.reduce((sum, ts) => sum + ts.availability_percentage, 0) / trainsets.length
    )
  }
}

function generateAlerts(trainsets: any[]) {
  const alerts = []
  const now = new Date()

  for (const trainset of trainsets) {
    // Fitness certificate expiry alerts
    for (const cert of trainset.fitness_certificates || []) {
      const expiryDate = new Date(cert.expiry_date)
      const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysToExpiry <= 7 && daysToExpiry > 0) {
        alerts.push({
          type: 'warning',
          trainset: trainset.number,
          message: `${cert.certificate_type} certificate expires in ${daysToExpiry} days`,
          priority: daysToExpiry <= 3 ? 'high' : 'medium'
        })
      } else if (daysToExpiry <= 0) {
        alerts.push({
          type: 'critical',
          trainset: trainset.number,
          message: `${cert.certificate_type} certificate expired`,
          priority: 'critical'
        })
      }
    }

    // Open job cards alerts
    const openJobs = trainset.job_cards?.filter((jc: any) => jc.status === 'open') || []
    if (openJobs.length > 0) {
      const highPriorityJobs = openJobs.filter((jc: any) => jc.priority >= 4)
      if (highPriorityJobs.length > 0) {
        alerts.push({
          type: 'warning',
          trainset: trainset.number,
          message: `${highPriorityJobs.length} high priority job card(s) open`,
          priority: 'high'
        })
      }
    }

    // Availability alerts
    if (trainset.availability_percentage < 85) {
      alerts.push({
        type: trainset.availability_percentage < 75 ? 'critical' : 'warning',
        trainset: trainset.number,
        message: `Low availability: ${trainset.availability_percentage}%`,
        priority: trainset.availability_percentage < 75 ? 'critical' : 'medium'
      })
    }

    // Cleaning due alerts
    const lastCleaning = new Date(trainset.last_cleaning)
    const daysSinceCleaning = Math.ceil((now.getTime() - lastCleaning.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceCleaning >= 5) {
      alerts.push({
        type: daysSinceCleaning >= 7 ? 'warning' : 'info',
        trainset: trainset.number,
        message: `Cleaning due (${daysSinceCleaning} days since last cleaning)`,
        priority: daysSinceCleaning >= 7 ? 'medium' : 'low'
      })
    }
  }

  return alerts.sort((a, b) => {
    const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 }
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
           (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
  })
}