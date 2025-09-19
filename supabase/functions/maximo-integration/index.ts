import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { action, data } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    switch (action) {
      case 'import_job_cards':
        return await importJobCards(supabase, data)
      case 'update_job_status':
        return await updateJobStatus(supabase, data)
      case 'sync_maintenance_data':
        return await syncMaintenanceData(supabase)
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Maximo Integration Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    )
  }
})

async function importJobCards(supabase: any, jobCardData: any[]) {
  const results = []
  
  for (const job of jobCardData) {
    // Find trainset by number
    const { data: trainset } = await supabase
      .from('trainsets')
      .select('id')
      .eq('number', job.trainset_number)
      .single()

    if (!trainset) {
      results.push({ error: `Trainset ${job.trainset_number} not found` })
      continue
    }

    // Upsert job card
    const { data, error } = await supabase
      .from('job_cards')
      .upsert({
        trainset_id: trainset.id,
        maximo_work_order: job.work_order,
        status: job.status,
        description: job.description,
        priority: job.priority || 3,
        estimated_hours: job.estimated_hours,
        actual_hours: job.actual_hours,
        completed_at: job.completed_at
      })

    results.push({ work_order: job.work_order, success: !error, error })
  }

  return new Response(
    JSON.stringify({ success: true, results }),
    { headers: { "Content-Type": "application/json" } }
  )
}

async function updateJobStatus(supabase: any, { work_order, status, actual_hours }: any) {
  const updates: any = { status, updated_at: new Date().toISOString() }
  
  if (status === 'closed') {
    updates.completed_at = new Date().toISOString()
    if (actual_hours) updates.actual_hours = actual_hours
  }

  const { data, error } = await supabase
    .from('job_cards')
    .update(updates)
    .eq('maximo_work_order', work_order)

  return new Response(
    JSON.stringify({ success: !error, data, error }),
    { headers: { "Content-Type": "application/json" } }
  )
}

async function syncMaintenanceData(supabase: any) {
  // Mock Maximo API integration
  const mockJobCards = [
    { trainset_number: 'KMRL-003', work_order: 'WO-2024-001', status: 'open', description: 'Brake pad replacement', priority: 4 },
    { trainset_number: 'KMRL-005', work_order: 'WO-2024-002', status: 'open', description: 'HVAC system repair', priority: 5 },
    { trainset_number: 'KMRL-009', work_order: 'WO-2024-003', status: 'open', description: 'Door mechanism service', priority: 3 },
    { trainset_number: 'KMRL-013', work_order: 'WO-2024-004', status: 'open', description: 'Traction motor inspection', priority: 4 },
    { trainset_number: 'KMRL-017', work_order: 'WO-2024-005', status: 'open', description: 'Emergency brake system failure', priority: 5 },
    { trainset_number: 'KMRL-021', work_order: 'WO-2024-006', status: 'open', description: 'Interior lighting replacement', priority: 2 }
  ]

  return await importJobCards(supabase, mockJobCards)
}