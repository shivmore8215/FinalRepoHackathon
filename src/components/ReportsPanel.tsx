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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>KMRL Metro Scheduling Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Period</label>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Report Type</label>
                <div className="space-y-2">
                  <Button
                    variant={reportType === 'daily' ? 'default' : 'outline'}
                    onClick={() => handleGenerateReport('daily')}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating && reportType === 'daily' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Daily Report
                  </Button>
                  <Button
                    variant={reportType === 'monthly' ? 'default' : 'outline'}
                    onClick={() => handleGenerateReport('monthly')}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating && reportType === 'monthly' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <CalendarIcon className="h-4 w-4 mr-2" />
                    )}
                    Monthly Report
                  </Button>
                  <Button
                    variant={reportType === 'yearly' ? 'default' : 'outline'}
                    onClick={() => handleGenerateReport('yearly')}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating && reportType === 'yearly' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <TrendingUp className="h-4 w-4 mr-2" />
                    )}
                    Yearly Report
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Report</label>
              <div className="space-y-2">
                <Button
                  onClick={() => downloadReport('pdf')}
                  disabled={downloadingFormat === 'pdf'}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {downloadingFormat === 'pdf' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download PDF
                </Button>
                <Button
                  onClick={() => downloadReport('excel')}
                  disabled={downloadingFormat === 'excel'}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {downloadingFormat === 'excel' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Fleet</p>
                    <p className="text-2xl font-bold">{reportData.totalTrainsets}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Punctuality</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reportData.punctuality || reportData.avgPunctuality}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fleet Availability</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reportData.fleetAvailability || reportData.avgFleetAvailability}%
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Recommendations</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {reportData.aiRecommendations || reportData.totalAiRecommendations}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Fleet Distribution</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics - {reportData.period}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Ridership</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {(reportData.ridership || reportData.totalRidership)?.toLocaleString()}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Energy Consumption</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {(reportData.energyConsumption || reportData.totalEnergyConsumption)?.toLocaleString()} kWh
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">Maintenance Cost</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
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
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
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
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg">Service Performance</h3>
                <p className="text-3xl font-bold text-green-600 my-2">
                  {reportData.punctuality || reportData.avgPunctuality}%
                </p>
                <p className="text-sm text-gray-600">
                  Target: 99.5% | Status: {((reportData.punctuality || reportData.avgPunctuality) || 0) >= 99.5 ? '✅ Achieved' : '⚠️ Needs Improvement'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg">Fleet Utilization</h3>
                <p className="text-3xl font-bold text-blue-600 my-2">
                  {reportData.fleetAvailability || reportData.avgFleetAvailability}%
                </p>
                <p className="text-sm text-gray-600">
                  Target: 90% | Status: {((reportData.fleetAvailability || reportData.avgFleetAvailability) || 0) >= 90 ? '✅ Achieved' : '⚠️ Below Target'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg">AI Optimization</h3>
                <p className="text-3xl font-bold text-purple-600 my-2">
                  {Math.round((((reportData.aiRecommendations || reportData.totalAiRecommendations) || 0) / (reportData.totalTrainsets * (reportData.workingDays || 1))) * 100)}%
                </p>
                <p className="text-sm text-gray-600">
                  Recommendations per trainset per day
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <h4 className="font-semibold">In Maintenance</h4>
                    <p className="text-2xl font-bold text-orange-600">
                      {reportData.maintenance || reportData.avgMaintenance}
                    </p>
                    <p className="text-sm text-gray-600">Trainsets</p>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <h4 className="font-semibold">Critical Issues</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {reportData.critical || reportData.avgCritical}
                    </p>
                    <p className="text-sm text-gray-600">Trainsets</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <h4 className="font-semibold">Jobs Completed</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {reportData.completedJobs || reportData.totalCompletedJobs}
                    </p>
                    <p className="text-sm text-gray-600">Work Orders</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <h4 className="font-semibold">Maintenance Cost</h4>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{(((reportData.maintenanceCost || reportData.totalMaintenanceCost) || 0) / 100000).toFixed(1)}L
                    </p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Planned Maintenance Compliance</span>
                    <Badge className="bg-green-100 text-green-800">92%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Repair Time</span>
                    <Badge className="bg-blue-100 text-blue-800">4.2 hours</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Emergency Repairs</span>
                    <Badge className="bg-orange-100 text-orange-800">8</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cost per Trainset</span>
                    <Badge className="bg-purple-100 text-purple-800">
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