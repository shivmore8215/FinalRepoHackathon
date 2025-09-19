import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ReportRequest {
  reportType: 'daily' | 'monthly' | 'yearly'
  date: string
  format: 'json' | 'pdf' | 'excel'
  includeCharts: boolean
}

interface ReportData {
  meta: {
    reportType: string
    period: string
    generatedAt: string
    dataPoints: number
  }
  fleet: {
    totalTrainsets: number
    statusDistribution: Record<string, number>
    availability: number
  }
  performance: {
    punctuality: number
    fleetAvailability: number
    peakHourEfficiency: number
    energyConsumption: number
  }
  maintenance: {
    inMaintenance: number
    criticalIssues: number
    completedJobs: number
    totalCost: number
    avgRepairTime: number
  }
  ai: {
    recommendationsGenerated: number
    implementationRate: number
    accuracyScore: number
    costSavings: number
  }
  financial: {
    operationalCost: number
    maintenanceCost: number
    energyCost: number
    ridership: number
    revenue: number
  }
}

serve(async (req) => {
  try {
    const { reportType, date, format, includeCharts = false }: ReportRequest = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`Generating ${reportType} report for ${date} in ${format} format`)

    // Fetch data from database
    const reportData = await generateReportData(supabase, reportType, date)

    // Generate report based on format
    switch (format) {
      case 'json':
        return new Response(JSON.stringify(reportData, null, 2), {
          headers: { 
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="KMRL_${reportType}_report_${date}.json"`
          }
        })
      
      case 'pdf':
        const pdfBuffer = await generatePDFReport(reportData, includeCharts)
        return new Response(pdfBuffer, {
          headers: { 
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="KMRL_${reportType}_report_${date}.pdf"`
          }
        })
      
      case 'excel':
        const excelBuffer = await generateExcelReport(reportData)
        return new Response(excelBuffer, {
          headers: { 
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="KMRL_${reportType}_report_${date}.xlsx"`
          }
        })
      
      default:
        throw new Error('Invalid format requested')
    }

  } catch (error) {
    console.error('Report Generation Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function generateReportData(
  supabase: any, 
  reportType: 'daily' | 'monthly' | 'yearly', 
  date: string
): Promise<ReportData> {
  
  const startDate = getStartDate(reportType, date)
  const endDate = getEndDate(reportType, date)
  
  // Fetch trainsets data
  const { data: trainsets, error: trainsetsError } = await supabase
    .from('trainsets')
    .select(`
      *,
      fitness_certificates(*),
      job_cards(*)
    `)
  
  if (trainsetsError) throw trainsetsError

  // Fetch KPI metrics for the period
  const { data: kpiMetrics, error: kpiError } = await supabase
    .from('kpi_metrics')
    .select('*')
    .gte('metric_date', startDate)
    .lte('metric_date', endDate)
    .order('metric_date')
  
  if (kpiError) throw kpiError

  // Fetch daily schedules for AI analysis
  const { data: schedules, error: schedulesError } = await supabase
    .from('daily_schedules')
    .select('*')
    .gte('schedule_date', startDate)
    .lte('schedule_date', endDate)
  
  if (schedulesError) throw schedulesError

  // Calculate report data
  const statusDistribution = trainsets.reduce((acc: Record<string, number>, trainset: any) => {
    acc[trainset.status] = (acc[trainset.status] || 0) + 1
    return acc
  }, {})

  const avgKPIs = calculateAverageKPIs(kpiMetrics)
  const maintenanceData = calculateMaintenanceData(trainsets)
  const aiData = calculateAIData(schedules)
  const financialData = calculateFinancialData(reportType, avgKPIs, maintenanceData)

  return {
    meta: {
      reportType,
      period: formatPeriod(reportType, date),
      generatedAt: new Date().toISOString(),
      dataPoints: kpiMetrics?.length || 0
    },
    fleet: {
      totalTrainsets: trainsets.length,
      statusDistribution,
      availability: Math.round(
        ((statusDistribution.ready || 0) + (statusDistribution.standby || 0)) / trainsets.length * 100
      )
    },
    performance: {
      punctuality: avgKPIs.punctuality || 99.2,
      fleetAvailability: avgKPIs.fleetAvailability || 92.5,
      peakHourEfficiency: avgKPIs.peakHourEfficiency || 96.8,
      energyConsumption: avgKPIs.energyConsumption || calculateEnergyConsumption(reportType)
    },
    maintenance: maintenanceData,
    ai: aiData,
    financial: financialData
  }
}

function calculateAverageKPIs(kpiMetrics: any[]) {
  if (!kpiMetrics || kpiMetrics.length === 0) {
    return {
      punctuality: 99.2,
      fleetAvailability: 92.5,
      peakHourEfficiency: 96.8,
      energyConsumption: 8750
    }
  }

  return {
    punctuality: kpiMetrics.reduce((sum, kpi) => sum + kpi.punctuality_percentage, 0) / kpiMetrics.length,
    fleetAvailability: kpiMetrics.reduce((sum, kpi) => sum + kpi.fleet_availability, 0) / kpiMetrics.length,
    peakHourEfficiency: 96.8, // Mock data
    energyConsumption: kpiMetrics.reduce((sum, kpi) => sum + kpi.energy_consumption, 0)
  }
}

function calculateMaintenanceData(trainsets: any[]) {
  const inMaintenance = trainsets.filter(t => t.status === 'maintenance').length
  const criticalIssues = trainsets.filter(t => t.status === 'critical').length
  const totalJobs = trainsets.reduce((sum, t) => sum + (t.job_cards?.length || 0), 0)
  const completedJobs = trainsets.reduce((sum, t) => 
    sum + (t.job_cards?.filter((jc: any) => jc.status === 'closed').length || 0), 0
  )

  return {
    inMaintenance,
    criticalIssues,
    completedJobs,
    totalCost: completedJobs * 12500, // Average cost per job
    avgRepairTime: 4.2 // Hours
  }
}

function calculateAIData(schedules: any[]) {
  const totalRecommendations = schedules.length
  const highConfidenceRecs = schedules.filter(s => s.ai_confidence_score > 0.8).length
  
  return {
    recommendationsGenerated: totalRecommendations,
    implementationRate: totalRecommendations > 0 ? Math.round((highConfidenceRecs / totalRecommendations) * 100) : 87,
    accuracyScore: 94,
    costSavings: Math.round(totalRecommendations * 2500) // Estimated savings per recommendation
  }
}

function calculateFinancialData(reportType: string, avgKPIs: any, maintenanceData: any) {
  const multiplier = reportType === 'daily' ? 1 : reportType === 'monthly' ? 30 : 365
  
  return {
    operationalCost: 45000 * multiplier,
    maintenanceCost: maintenanceData.totalCost,
    energyCost: Math.round(avgKPIs.energyConsumption * 8.5), // ₹8.5 per kWh
    ridership: 45000 * multiplier,
    revenue: Math.round(45000 * multiplier * 35) // ₹35 average fare
  }
}

function calculateEnergyConsumption(reportType: string): number {
  const baseDaily = 8750
  return reportType === 'daily' ? baseDaily : 
         reportType === 'monthly' ? baseDaily * 30 : 
         baseDaily * 365
}

function getStartDate(reportType: string, date: string): string {
  const targetDate = new Date(date)
  
  switch (reportType) {
    case 'daily':
      return date
    case 'monthly':
      return new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString().split('T')[0]
    case 'yearly':
      return new Date(targetDate.getFullYear(), 0, 1).toISOString().split('T')[0]
    default:
      return date
  }
}

function getEndDate(reportType: string, date: string): string {
  const targetDate = new Date(date)
  
  switch (reportType) {
    case 'daily':
      return date
    case 'monthly':
      return new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).toISOString().split('T')[0]
    case 'yearly':
      return new Date(targetDate.getFullYear(), 11, 31).toISOString().split('T')[0]
    default:
      return date
  }
}

function formatPeriod(reportType: string, date: string): string {
  const targetDate = new Date(date)
  
  switch (reportType) {
    case 'daily':
      return targetDate.toDateString()
    case 'monthly':
      return targetDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    case 'yearly':
      return targetDate.getFullYear().toString()
    default:
      return date
  }
}

async function generatePDFReport(data: ReportData, includeCharts: boolean): Promise<Uint8Array> {
  // Mock PDF generation - in real implementation, use libraries like jsPDF or Puppeteer
  const pdfContent = `
KMRL Metro Scheduling Report - ${data.meta.reportType.toUpperCase()}
${'='.repeat(60)}

Report Period: ${data.meta.period}
Generated: ${new Date(data.meta.generatedAt).toLocaleString()}

FLEET OVERVIEW
--------------
Total Trainsets: ${data.fleet.totalTrainsets}
Service Availability: ${data.fleet.availability}%

Fleet Distribution:
${Object.entries(data.fleet.statusDistribution)
  .map(([status, count]) => `  ${status}: ${count} trainsets`)
  .join('\n')}

PERFORMANCE METRICS
-------------------
Punctuality: ${data.performance.punctuality.toFixed(1)}%
Fleet Availability: ${data.performance.fleetAvailability.toFixed(1)}%
Peak Hour Efficiency: ${data.performance.peakHourEfficiency}%
Energy Consumption: ${data.performance.energyConsumption.toLocaleString()} kWh

MAINTENANCE DATA
----------------
In Maintenance: ${data.maintenance.inMaintenance} trainsets
Critical Issues: ${data.maintenance.criticalIssues} trainsets
Completed Jobs: ${data.maintenance.completedJobs}
Total Cost: ₹${data.maintenance.totalCost.toLocaleString()}
Average Repair Time: ${data.maintenance.avgRepairTime} hours

AI ANALYSIS
-----------
Recommendations Generated: ${data.ai.recommendationsGenerated}
Implementation Rate: ${data.ai.implementationRate}%
Accuracy Score: ${data.ai.accuracyScore}%
Estimated Cost Savings: ₹${data.ai.costSavings.toLocaleString()}

FINANCIAL SUMMARY
-----------------
Operational Cost: ₹${data.financial.operationalCost.toLocaleString()}
Maintenance Cost: ₹${data.financial.maintenanceCost.toLocaleString()}
Energy Cost: ₹${data.financial.energyCost.toLocaleString()}
Ridership: ${data.financial.ridership.toLocaleString()} passengers
Revenue: ₹${data.financial.revenue.toLocaleString()}

${'='.repeat(60)}
Report generated by KMRL AI Scheduling System
  `
  
  return new TextEncoder().encode(pdfContent)
}

async function generateExcelReport(data: ReportData): Promise<Uint8Array> {
  // Mock Excel generation - in real implementation, use libraries like ExcelJS
  const csvContent = `KMRL Metro Scheduling Report - ${data.meta.reportType.toUpperCase()}
Report Period,${data.meta.period}
Generated,${new Date(data.meta.generatedAt).toLocaleString()}

FLEET OVERVIEW
Metric,Value
Total Trainsets,${data.fleet.totalTrainsets}
Service Availability,${data.fleet.availability}%
Ready,${data.fleet.statusDistribution.ready || 0}
Standby,${data.fleet.statusDistribution.standby || 0}
Maintenance,${data.fleet.statusDistribution.maintenance || 0}
Critical,${data.fleet.statusDistribution.critical || 0}

PERFORMANCE METRICS
Metric,Value
Punctuality,${data.performance.punctuality.toFixed(1)}%
Fleet Availability,${data.performance.fleetAvailability.toFixed(1)}%
Peak Hour Efficiency,${data.performance.peakHourEfficiency}%
Energy Consumption,${data.performance.energyConsumption.toLocaleString()} kWh

MAINTENANCE DATA
Metric,Value
In Maintenance,${data.maintenance.inMaintenance}
Critical Issues,${data.maintenance.criticalIssues}
Completed Jobs,${data.maintenance.completedJobs}
Total Cost,₹${data.maintenance.totalCost.toLocaleString()}
Average Repair Time,${data.maintenance.avgRepairTime} hours

AI ANALYSIS
Metric,Value
Recommendations Generated,${data.ai.recommendationsGenerated}
Implementation Rate,${data.ai.implementationRate}%
Accuracy Score,${data.ai.accuracyScore}%
Cost Savings,₹${data.ai.costSavings.toLocaleString()}

FINANCIAL SUMMARY
Metric,Value
Operational Cost,₹${data.financial.operationalCost.toLocaleString()}
Maintenance Cost,₹${data.financial.maintenanceCost.toLocaleString()}
Energy Cost,₹${data.financial.energyCost.toLocaleString()}
Ridership,${data.financial.ridership.toLocaleString()}
Revenue,₹${data.financial.revenue.toLocaleString()}
`
  
  return new TextEncoder().encode(csvContent)
}