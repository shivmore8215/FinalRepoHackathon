import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface TrainsetData {
  id: string;
  number: string;
  status: string;
  bay_position: number;
  mileage: number;
  last_cleaning: string;
  branding_priority: number;
  availability_percentage: number;
  fitness_certificates: any[];
  job_cards: any[];
}

interface SchedulingConstraints {
  target_punctuality: number;
  max_service_hours: number;
  min_maintenance_interval: number;
  branding_weights: any;
}

interface AIRecommendation {
  trainset_id: string;
  recommended_status: string;
  confidence_score: number;
  reasoning: string[];
  priority_score: number;
  risk_factors: string[];
}

serve(async (req) => {
  try {
    const { scheduleDate, constraints, forceRecompute = false } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get DeepSeek API key from secrets
    const { data: secrets } = await supabase
      .from('vault')
      .select('decrypted_secret')
      .eq('name', 'DEEPSEEK_API_KEY')
      .single()

    if (!secrets?.decrypted_secret) {
      throw new Error('DeepSeek API key not found. Please add it to Supabase secrets.')
    }

    // Fetch trainset data with related information
    const { data: trainsets, error: trainsetsError } = await supabase
      .from('trainsets')
      .select(`
        *,
        fitness_certificates(*),
        job_cards(*)
      `)

    if (trainsetsError) throw trainsetsError

    // Fetch system constraints
    const { data: configData } = await supabase
      .from('system_config')
      .select('config_key, config_value')
      .in('config_key', ['fleet_constraints', 'branding_weights', 'ai_model_settings'])

    const config = configData?.reduce((acc: any, item) => {
      acc[item.config_key] = item.config_value
      return acc
    }, {}) || {}

    // Prepare AI input data
    const aiInput = {
      trainsets: trainsets.map((ts: any) => ({
        id: ts.id,
        number: ts.number,
        current_status: ts.status,
        bay_position: ts.bay_position,
        mileage: ts.mileage,
        last_cleaning_days: Math.ceil((Date.now() - new Date(ts.last_cleaning).getTime()) / (1000 * 60 * 60 * 24)),
        branding_priority: ts.branding_priority,
        availability: ts.availability_percentage,
        fitness_expiry_days: ts.fitness_certificates.map((cert: any) => 
          Math.ceil((new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        ),
        open_job_cards: ts.job_cards.filter((jc: any) => jc.status === 'open').length,
        maintenance_priority: ts.job_cards.reduce((sum: number, jc: any) => sum + (jc.priority || 3), 0)
      })),
      constraints: config.fleet_constraints || constraints,
      schedule_date: scheduleDate,
      historical_kpis: await getHistoricalKPIs(supabase),
      weather_forecast: await getWeatherData(), // Placeholder for weather API
    }

    // Call DeepSeek API for AI optimization
    const aiRecommendations = await callDeepSeekAPI(secrets.decrypted_secret, aiInput)

    // Process and validate AI recommendations
    const processedRecommendations = await processAIRecommendations(
      aiRecommendations, 
      trainsets, 
      config.fleet_constraints
    )

    // Store AI training data for continuous learning
    await storeTrainingData(supabase, {
      schedule_date: scheduleDate,
      input_features: aiInput,
      ai_recommendation: processedRecommendations,
      model_version: config.ai_model_settings?.model || 'deepseek-v1'
    })

    // Save recommendations to daily_schedules table
    for (const rec of processedRecommendations) {
      await supabase
        .from('daily_schedules')
        .upsert({
          schedule_date: scheduleDate,
          trainset_id: rec.trainset_id,
          planned_status: rec.recommended_status,
          ai_confidence_score: rec.confidence_score,
          reasoning: { 
            factors: rec.reasoning,
            risk_factors: rec.risk_factors,
            priority_score: rec.priority_score
          }
        })
    }

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: processedRecommendations,
        summary: generateSchedulingSummary(processedRecommendations, trainsets),
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      }
    )

  } catch (error) {
    console.error('AI Scheduling Error:', error)
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

async function callDeepSeekAPI(apiKey: string, input: any): Promise<any> {
  const systemPrompt = `You are an AI optimization expert for Kochi Metro Rail Limited (KMRL) train induction planning. 

Your task is to recommend which trainsets should be:
1. Ready for service (maximum revenue generation)
2. On standby (backup for service disruptions) 
3. In maintenance (preventive/corrective maintenance)
4. Critical status (immediate attention required)

Consider these factors:
- Fitness certificate expiry (safety critical)
- Open job cards (maintenance requirements)
- Mileage balancing (equipment wear distribution)
- Branding priority (advertiser commitments)
- Cleaning schedule (passenger experience)
- Bay position efficiency (minimize shunting)
- Target punctuality of 99.5%
- Fleet availability optimization

Respond with a JSON array of recommendations, each containing:
- trainset_id: string
- recommended_status: "ready" | "standby" | "maintenance" | "critical"  
- confidence_score: number (0-1)
- reasoning: string[] (key decision factors)
- priority_score: number (1-10, higher = more critical)
- risk_factors: string[] (potential issues)`

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Optimize train scheduling for ${input.schedule_date}: ${JSON.stringify(input)}` }
      ],
      temperature: 0.2,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    })
  })

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.statusText}`)
  }

  const result = await response.json()
  return JSON.parse(result.choices[0].message.content)
}

async function processAIRecommendations(
  recommendations: any, 
  trainsets: TrainsetData[], 
  constraints: any
): Promise<AIRecommendation[]> {
  const processed: AIRecommendation[] = []
  
  for (const rec of recommendations.recommendations || []) {
    const trainset = trainsets.find(ts => ts.id === rec.trainset_id)
    if (!trainset) continue

    // Validation and safety checks
    const validatedRec: AIRecommendation = {
      trainset_id: rec.trainset_id,
      recommended_status: validateStatus(rec.recommended_status, trainset),
      confidence_score: Math.min(Math.max(rec.confidence_score || 0.5, 0), 1),
      reasoning: Array.isArray(rec.reasoning) ? rec.reasoning : ['AI recommendation'],
      priority_score: Math.min(Math.max(rec.priority_score || 5, 1), 10),
      risk_factors: Array.isArray(rec.risk_factors) ? rec.risk_factors : []
    }

    processed.push(validatedRec)
  }

  return processed
}

function validateStatus(recommendedStatus: string, trainset: TrainsetData): string {
  // Safety validation rules
  const hasExpiredCerts = trainset.fitness_certificates?.some(cert => 
    new Date(cert.expiry_date) <= new Date()
  )
  
  const hasCriticalJobs = trainset.job_cards?.some(job => 
    job.status === 'open' && job.priority >= 4
  )

  if (hasExpiredCerts || hasCriticalJobs || trainset.availability_percentage < 75) {
    return 'critical'
  }

  if (trainset.availability_percentage < 90) {
    return 'maintenance'
  }

  return recommendedStatus
}

async function getHistoricalKPIs(supabase: any) {
  const { data } = await supabase
    .from('kpi_metrics')
    .select('*')
    .order('metric_date', { ascending: false })
    .limit(30)

  return data || []
}

async function getWeatherData() {
  // Placeholder for weather API integration
  return { condition: 'clear', temperature: 28, humidity: 65 }
}

async function storeTrainingData(supabase: any, data: any) {
  await supabase
    .from('ai_training_data')
    .insert(data)
}

function generateSchedulingSummary(recommendations: AIRecommendation[], trainsets: TrainsetData[]) {
  const statusCounts = recommendations.reduce((acc: any, rec) => {
    acc[rec.recommended_status] = (acc[rec.recommended_status] || 0) + 1
    return acc
  }, {})

  const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) / recommendations.length

  return {
    total_trainsets: trainsets.length,
    recommendations: statusCounts,
    average_confidence: Math.round(avgConfidence * 100) / 100,
    high_risk_count: recommendations.filter(r => r.risk_factors.length > 0).length,
    optimization_timestamp: new Date().toISOString()
  }
}