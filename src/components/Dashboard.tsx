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
import { LanguageSelector } from './LanguageSelector'
import { useTrainsets, useRealtimeMetrics, useDailySchedule, useKPIs } from "@/hooks/useTrainData"
import { Train, RefreshCw, Settings, BarChart3, LogOut, UserCheck } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'

export function Dashboard() {
  const { t } = useTranslation()
  const { data: trainsets = [], refetch: refetchTrainsets } = useTrainsets()
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useRealtimeMetrics()
  const { data: scheduleData = [], refetch: refetchSchedule } = useDailySchedule(new Date().toISOString().split('T')[0])
  const { data: kpiData = [], refetch: refetchKPIs } = useKPIs()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  
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

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900`}>
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm dark:shadow-xl dark:shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg shadow-lg dark:shadow-blue-500/25">
                <Train className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">{t('app.title')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('app.subtitle')}</p>
              </div>
              {user && (
                <div className="ml-4 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 dark:border dark:border-blue-500/30 rounded-full">
                  <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">Welcome, {user.fullName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-gray-600 dark:text-gray-300 dark:hover:text-green-400 transition-all duration-200"
                title={isRefreshing ? t('common.loading') : t('common.refresh')}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:border-gray-600 dark:text-gray-300 dark:hover:text-blue-400 transition-all duration-200" title={t('settings.title')}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('settings.title')}</DialogTitle>
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
                {t('reports.title')}
              </Button>
              
              {user?.role === 'super_admin' && (
                <Link to="/admin/approvals">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:border-gray-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-all duration-200"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    User Approvals
                  </Button>
                </Link>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-gray-600 dark:text-gray-300 dark:hover:text-red-400 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
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
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-xl dark:shadow-black/10">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-600">
              <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                {t('dashboard.overview')}
                <div className="flex space-x-2">
                  <Badge variant="ready" className="shadow-sm">{readyTrainsets.length} {t('status.ready')}</Badge>
                  <Badge variant="standby" className="shadow-sm">{standbyTrainsets.length} {t('status.standby')}</Badge>
                  <Badge variant="maintenance" className="shadow-sm">{maintenanceTrainsets.length} {t('status.maintenance')}</Badge>
                  <Badge variant="critical" className="shadow-sm">{criticalTrainsets.length} {t('status.critical')}</Badge>
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
            <TabsTrigger value="manual">{t('scheduling.manualScheduling')}</TabsTrigger>
            <TabsTrigger value="ai">{t('scheduling.aiScheduling')}</TabsTrigger>
            <TabsTrigger value="reports">{t('reports.title')}</TabsTrigger>
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
              kpiData={Array.isArray(kpiData) ? kpiData : [kpiData]}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}