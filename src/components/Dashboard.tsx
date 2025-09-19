import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemMetrics } from "./SystemMetrics"
import { TrainCard } from "./TrainCard"
import { SchedulingPanel } from "./SchedulingPanel"
import { AISchedulingPanel } from "./AISchedulingPanel"
import { ReportsPanel } from "./ReportsPanel"
import { SettingsPanel } from './SettingsPanel-simple'
import { useTrainsets, useRealtimeMetrics, useDailySchedule, useKPIs } from "@/hooks/useTrainData"
import { Train, RefreshCw, Settings, BarChart3 } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export function Dashboard() {
  const { data: trainsets = [], isLoading: trainsetsLoading, refetch: refetchTrainsets } = useTrainsets()
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useRealtimeMetrics()
  const { data: scheduleData = [], refetch: refetchSchedule } = useDailySchedule(new Date().toISOString().split('T')[0])
  const { data: kpiData = [], refetch: refetchKPIs } = useKPIs()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('manual')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const readyTrainsets = trainsets.filter(t => t.status === 'ready')
  const standbyTrainsets = trainsets.filter(t => t.status === 'standby')
  const maintenanceTrainsets = trainsets.filter(t => t.status === 'maintenance')
  const criticalTrainsets = trainsets.filter(t => t.status === 'critical')

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchTrainsets(),
        refetchMetrics(),
        refetchSchedule(),
        refetchKPIs()
      ])
      toast({
        title: "Data Refreshed",
        description: "All system data has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleReportsClick = () => {
    setActiveTab('reports')
    toast({
      title: "Reports Opened",
      description: "Accessing comprehensive analytics and reporting.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Train className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Train Plan Wise</h1>
                <p className="text-sm text-gray-600">Kochi Metro Rail Limited</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hover:bg-green-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hover:bg-blue-50">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>System Settings</DialogTitle>
                  </DialogHeader>
                  <SettingsPanel />
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReportsClick}
                className="hover:bg-purple-50"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Metrics */}
        <div className="mb-8">
          <SystemMetrics metrics={metrics} isLoading={metricsLoading} />
        </div>

        {/* Fleet Status Overview */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Fleet Status Overview
                <div className="flex space-x-2">
                  <Badge variant="ready">{readyTrainsets.length} Ready</Badge>
                  <Badge variant="standby">{standbyTrainsets.length} Standby</Badge>
                  <Badge variant="maintenance">{maintenanceTrainsets.length} Maintenance</Badge>
                  <Badge variant="critical">{criticalTrainsets.length} Critical</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trainsets.map((trainset) => (
                  <TrainCard key={trainset.id} trainset={trainset} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Panels */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Scheduling</TabsTrigger>
            <TabsTrigger value="ai">AI-Powered Scheduling</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <SchedulingPanel trainsets={trainsets} />
          </TabsContent>
          
          <TabsContent value="ai">
            <AISchedulingPanel trainsets={trainsets} />
          </TabsContent>
          
          <TabsContent value="reports">
            <ReportsPanel 
              trainsets={trainsets}
              scheduleData={scheduleData}
              kpiData={kpiData}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}