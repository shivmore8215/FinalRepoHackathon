import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Target,
  Zap,
  Activity
} from "lucide-react"
import { generateSimplePDFReport } from "@/lib/simplePdfGenerator"
import { saveAs } from 'file-saver'
import { useTranslation } from 'react-i18next'

interface ReportsPanelProps {
  trainsets: any[]
  scheduleData: any[]
  kpiData: any[]
}

interface ReportData {
  period: string
  totalTrainsets: number
  ready?: number
  standby?: number
  maintenance?: number
  critical?: number
  avgReady?: number
  avgStandby?: number
  avgMaintenance?: number
  avgCritical?: number
  punctuality?: number
  avgPunctuality?: number
  fleetAvailability?: number
  avgFleetAvailability?: number
  energyConsumption?: number
  totalEnergyConsumption?: number
  maintenanceCost?: number
  totalMaintenanceCost?: number
  ridership?: number
  totalRidership?: number
  peakHourEfficiency?: number
  avgPeakEfficiency?: number
  aiRecommendations?: number
  totalAiRecommendations?: number
  completedJobs?: number
  totalCompletedJobs?: number
  workingDays?: number
}

export function ReportsPanel({ trainsets, scheduleData: _, kpiData: __ }: ReportsPanelProps) {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('daily')
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'excel' | null>(null)

  // Generate mock report data based on trainsets
  const generateReportData = (type: 'daily' | 'monthly' | 'yearly'): ReportData => {
    const baseData = {
      daily: {
        period: selectedDate.toDateString(),
        totalTrainsets: trainsets.length,
        ready: trainsets.filter(t => t.status === 'ready').length,
        standby: trainsets.filter(t => t.status === 'standby').length,
        maintenance: trainsets.filter(t => t.status === 'maintenance').length,
        critical: trainsets.filter(t => t.status === 'critical').length,
        punctuality: 99.2,
        fleetAvailability: Math.round((trainsets.filter(t => ['ready', 'standby'].includes(t.status)).length / trainsets.length) * 100),
        energyConsumption: 8750,
        maintenanceCost: 125000,
        ridership: 45000,
        peakHourEfficiency: 96.8,
        aiRecommendations: 8,
        completedJobs: 12
      },
      monthly: {
        period: selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        totalTrainsets: trainsets.length,
        avgReady: Math.round(trainsets.filter(t => t.status === 'ready').length * 0.85),
        avgStandby: Math.round(trainsets.filter(t => t.status === 'standby').length * 1.2),
        avgMaintenance: Math.round(trainsets.filter(t => t.status === 'maintenance').length * 0.9),
        avgCritical: Math.round(trainsets.filter(t => t.status === 'critical').length * 0.7),
        avgPunctuality: 99.1,
        avgFleetAvailability: 92.5,
        totalEnergyConsumption: 262500,
        totalMaintenanceCost: 3750000,
        totalRidership: 1350000,
        avgPeakEfficiency: 95.2,
        totalAiRecommendations: 240,
        totalCompletedJobs: 360,
        workingDays: 30
      },
      yearly: {
        period: selectedDate.getFullYear().toString(),
        totalTrainsets: trainsets.length,
        avgReady: Math.round(trainsets.filter(t => t.status === 'ready').length * 0.88),
        avgStandby: Math.round(trainsets.filter(t => t.status === 'standby').length * 1.1),
        avgMaintenance: Math.round(trainsets.filter(t => t.status === 'maintenance').length * 0.85),
        avgCritical: Math.round(trainsets.filter(t => t.status === 'critical').length * 0.6),
        avgPunctuality: 99.3,
        avgFleetAvailability: 93.8,
        totalEnergyConsumption: 3150000,
        totalMaintenanceCost: 45000000,
        totalRidership: 16200000,
        avgPeakEfficiency: 96.5,
        totalAiRecommendations: 2920,
        totalCompletedJobs: 4380,
        workingDays: 365
      }
    }
    return baseData[type]
  }

  const handleGenerateReport = async (type: 'daily' | 'monthly' | 'yearly') => {
    setIsGenerating(true)
    setReportType(type)
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
  }

  const downloadReport = async (format: 'pdf' | 'excel') => {
    setDownloadingFormat(format)
    
    try {
      const metrics = {
        current_kpis: {
          fleet_availability: Math.round((trainsets.filter(t => ['ready', 'standby'].includes(t.status)).length / trainsets.length) * 100),
          punctuality: 99.2,
          energy_consumption: 8750
        },
        alerts: [
          { trainset: 'KMRL-001', message: 'Scheduled maintenance due', priority: 'Medium' },
          { trainset: 'KMRL-008', message: 'High mileage alert', priority: 'High' },
          { trainset: 'KMRL-015', message: 'Performance monitoring required', priority: 'Low' }
        ]
      }
      
      const filename = `KMRL_${reportType}_report_${new Date().toISOString().split('T')[0]}`
      
      if (format === 'pdf') {
        // Generate PDF using the simple PDF generator
        const pdfDoc = generateSimplePDFReport(trainsets, metrics)
        pdfDoc.save(`${filename}.pdf`)
      } else if (format === 'excel') {
        // Generate Excel using backend API
        const response = await fetch('/api/reports/generate-excel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trainsets,
            metrics,
            reportType
          })
        })
        
        if (response.ok) {
          const blob = await response.blob()
          saveAs(blob, `${filename}.xlsx`)
        } else {
          console.error('Failed to generate Excel report')
          // Fallback: create a simple Excel-like file
          const reportData = generateReportData(reportType)
          const csvContent = Object.entries(reportData)
            .map(([key, value]) => `${key},${value}`)
            .join('\n')
          
          const blob = new Blob([csvContent], { type: 'text/csv' })
          saveAs(blob, `${filename}.csv`)
        }
      }
    } catch (error) {
      console.error(`Error generating ${format} report:`, error)
      
      // Fallback to basic download
      const data = generateReportData(reportType)
      const baseFilename = `KMRL_${reportType}_report_${new Date().toISOString().split('T')[0]}`
      const element = document.createElement('a')
      const file = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `${baseFilename}.json`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } finally {
      setDownloadingFormat(null)
    }
  }

  const reportData = generateReportData(reportType)

  // Chart data
  const fleetDistributionData = [
    { name: 'Ready', value: reportData.ready || reportData.avgReady, color: '#10b981' },
    { name: 'Standby', value: reportData.standby || reportData.avgStandby, color: '#f59e0b' },
    { name: 'Maintenance', value: reportData.maintenance || reportData.avgMaintenance, color: '#f97316' },
    { name: 'Critical', value: reportData.critical || reportData.avgCritical, color: '#ef4444' }
  ]

  const performanceTrendData = reportType === 'daily' ? [
    { time: '06:00', punctuality: 99.5, availability: 95.2 },
    { time: '09:00', punctuality: 98.8, availability: 94.8 },
    { time: '12:00', punctuality: 99.2, availability: 96.1 },
    { time: '15:00', punctuality: 99.1, availability: 95.9 },
    { time: '18:00', punctuality: 98.5, availability: 94.2 },
    { time: '21:00', punctuality: 99.4, availability: 96.8 }
  ] : [
    { period: 'Week 1', punctuality: 99.1, availability: 94.2 },
    { period: 'Week 2', punctuality: 99.3, availability: 95.1 },
    { period: 'Week 3', punctuality: 98.9, availability: 93.8 },
    { period: 'Week 4', punctuality: 99.2, availability: 94.9 }
  ]

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-slate-800/50 border-b border-gray-200/50 dark:border-gray-700/50">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-semibold">{t('reports.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.reportPeriod')}</label>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">{t('reports.reportType')}</label>
                <div className="space-y-2">
                  <Button
                    variant={reportType === 'daily' ? 'default' : 'outline'}
                    onClick={() => handleGenerateReport('daily')}
                    disabled={isGenerating}
                    className={`w-full transition-all duration-300 transform hover:scale-105 ${
                      reportType === 'daily' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-600 text-white shadow-lg hover:shadow-xl' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isGenerating && reportType === 'daily' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    {t('reports.dailyReport')}
                  </Button>
                  <Button
                    variant={reportType === 'monthly' ? 'default' : 'outline'}
                    onClick={() => handleGenerateReport('monthly')}
                    disabled={isGenerating}
                    className={`w-full transition-all duration-300 transform hover:scale-105 ${
                      reportType === 'monthly' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-600 text-white shadow-lg hover:shadow-xl' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isGenerating && reportType === 'monthly' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <CalendarIcon className="h-4 w-4 mr-2" />
                    )}
                    {t('reports.monthlyReport')}
                  </Button>
                  <Button
                    variant={reportType === 'yearly' ? 'default' : 'outline'}
                    onClick={() => handleGenerateReport('yearly')}
                    disabled={isGenerating}
                    className={`w-full transition-all duration-300 transform hover:scale-105 ${
                      reportType === 'yearly' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 dark:from-blue-600 dark:to-purple-600 text-white shadow-lg hover:shadow-xl' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isGenerating && reportType === 'yearly' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <TrendingUp className="h-4 w-4 mr-2" />
                    )}
                    {t('reports.yearlyReport')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.exportReport')}</label>
              <div className="space-y-2">
                <Button
                  onClick={() => downloadReport('pdf')}
                  disabled={downloadingFormat === 'pdf'}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 dark:from-red-600 dark:to-pink-600 dark:hover:from-red-700 dark:hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {downloadingFormat === 'pdf' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {t('reports.downloadPDF')}
                </Button>
                <Button
                  onClick={() => downloadReport('excel')}
                  disabled={downloadingFormat === 'excel'}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 dark:from-green-600 dark:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {downloadingFormat === 'excel' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {t('reports.downloadExcel')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300">{t('reports.overview')}</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300">{t('reports.performance')}</TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300">{t('reports.maintenance')}</TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300">{t('reports.analysis')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Fleet</p>
                    <p className="text-2xl font-bold dark:text-white">{reportData.totalTrainsets}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Punctuality</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {reportData.punctuality || reportData.avgPunctuality}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fleet Availability</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {reportData.fleetAvailability || reportData.avgFleetAvailability}%
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Recommendations</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {reportData.aiRecommendations || reportData.totalAiRecommendations}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Distribution Chart */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
                <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-semibold">Fleet Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={fleetDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fleetDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
                <CardTitle className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent font-semibold">Key Metrics - {reportData.period}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm">
                    <span className="font-medium dark:text-gray-300">Ridership</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                      {(reportData.ridership || reportData.totalRidership)?.toLocaleString()}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                    <span className="font-medium dark:text-gray-300">Energy Consumption</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                      {(reportData.energyConsumption || reportData.totalEnergyConsumption)?.toLocaleString()} kWh
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg border border-orange-200/50 dark:border-orange-700/50 backdrop-blur-sm">
                    <span className="font-medium dark:text-gray-300">Maintenance Cost</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                      ₹{(reportData.maintenanceCost || reportData.totalMaintenanceCost)?.toLocaleString()}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Peak Hour Efficiency</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {reportData.peakHourEfficiency || reportData.avgPeakEfficiency}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
              <CardTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent font-semibold">Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={reportType === 'daily' ? 'time' : 'period'} />
                  <YAxis domain={[90, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="punctuality" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Punctuality (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="availability" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Fleet Availability (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg dark:text-white">Service Performance</h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 my-2">
                  {reportData.punctuality || reportData.avgPunctuality}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Target: 99.5% | Status: {((reportData.punctuality || reportData.avgPunctuality) || 0) >= 99.5 ? '✅ Achieved' : '⚠️ Needs Improvement'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg dark:text-white">Fleet Utilization</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 my-2">
                  {reportData.fleetAvailability || reportData.avgFleetAvailability}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Target: 90% | Status: {((reportData.fleetAvailability || reportData.avgFleetAvailability) || 0) >= 90 ? '✅ Achieved' : '⚠️ Below Target'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg dark:text-white">AI Optimization</h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 my-2">
                  {Math.round((((reportData.aiRecommendations || reportData.totalAiRecommendations) || 0) / (reportData.totalTrainsets * (reportData.workingDays || 1))) * 100)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recommendations per trainset per day
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <div className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
                <CardTitle className="bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent font-semibold">Maintenance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg text-center border border-orange-200/50 dark:border-orange-700/50 backdrop-blur-sm">
                    <h4 className="font-semibold dark:text-white">In Maintenance</h4>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {reportData.maintenance || reportData.avgMaintenance}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Trainsets</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 rounded-lg text-center border border-red-200/50 dark:border-red-700/50 backdrop-blur-sm">
                    <h4 className="font-semibold dark:text-white">Critical Issues</h4>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {reportData.critical || reportData.avgCritical}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Trainsets</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg text-center border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm">
                    <h4 className="font-semibold dark:text-white">Jobs Completed</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {reportData.completedJobs || reportData.totalCompletedJobs}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Work Orders</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg text-center border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                    <h4 className="font-semibold">Maintenance Cost</h4>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{(((reportData.maintenanceCost || reportData.totalMaintenanceCost) || 0) / 100000).toFixed(1)}L
                    </p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
                <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-semibold">Maintenance Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">Planned Maintenance Compliance</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">92%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">Average Repair Time</span>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">4.2 hours</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">Emergency Repairs</span>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">8</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">Cost per Trainset</span>
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                      ₹{Math.round(((reportData.maintenanceCost || reportData.totalMaintenanceCost) || 0) / reportData.totalTrainsets).toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <h4 className="font-semibold">AI Recommendations</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {reportData.aiRecommendations || reportData.totalAiRecommendations}
                    </p>
                    <p className="text-sm text-gray-600">Generated</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <h4 className="font-semibold">Implementation Rate</h4>
                    <p className="text-2xl font-bold text-green-600">87%</p>
                    <p className="text-sm text-gray-600">Accepted</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <h4 className="font-semibold">Accuracy Score</h4>
                    <p className="text-2xl font-bold text-blue-600">94%</p>
                    <p className="text-sm text-gray-600">Prediction Success</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Optimal Fleet Distribution</p>
                      <p className="text-sm text-blue-700">
                        Current distribution maintains 94% service availability while optimizing maintenance windows.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Performance Improvement</p>
                      <p className="text-sm text-green-700">
                        AI scheduling has improved punctuality by 2.3% compared to manual scheduling.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">Maintenance Optimization</p>
                      <p className="text-sm text-orange-700">
                        Predictive maintenance scheduling has reduced emergency repairs by 15%.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900">Energy Efficiency</p>
                      <p className="text-sm text-purple-700">
                        Smart scheduling algorithms have reduced energy consumption by 8% during off-peak hours.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}