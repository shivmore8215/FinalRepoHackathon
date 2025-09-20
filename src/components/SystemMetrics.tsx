import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, Wrench, Zap, TrendingUp, AlertTriangle } from "lucide-react"
import { useTranslation } from 'react-i18next'

interface SystemMetricsProps {
  metrics?: any
  isLoading: boolean
}

export function SystemMetrics({ metrics, isLoading }: SystemMetricsProps) {
  const { t } = useTranslation()
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const fleetStatus = metrics?.fleet_status || {}
  const currentKPIs = metrics?.current_kpis || {}
  const planningStatus = metrics?.planning_status || {}

  const metricsData = [
    {
      title: t('dashboard.fleetAvailability'),
      value: `${fleetStatus.serviceability || 0}%`,
      progress: fleetStatus.serviceability || 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: `${fleetStatus.ready || 0} ${t('status.ready').toLowerCase()}, ${fleetStatus.standby || 0} ${t('status.standby').toLowerCase()}`
    },
    {
      title: t('dashboard.punctuality'),
      value: `${currentKPIs.punctuality || 99.2}%`,
      progress: currentKPIs.punctuality || 99.2,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: t('reports.servicePerformance')
    },
    {
      title: t('reports.maintenanceCost'),
      value: `₹${currentKPIs.maintenance_cost || 0}`,
      progress: 75,
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: t('reports.monthlyReport')
    },
    {
      title: t('dashboard.energyEfficiency'),
      value: `${currentKPIs.energy_consumption || 0} kWh`,
      progress: 85,
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: t('reports.energyConsumption')
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <Card key={index} className="metric-card bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/10 transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color} dark:opacity-80`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {metric.description}
              </div>
              <Progress value={metric.progress} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fleet Status Summary */}
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-xl dark:shadow-black/10">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-600">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Fleet Status Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {fleetStatus.ready || 0}
              </div>
              <div className="text-sm text-gray-600">Ready for Service</div>
              <Badge variant="ready" className="mt-1">Operational</Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {fleetStatus.standby || 0}
              </div>
              <div className="text-sm text-gray-600">On Standby</div>
              <Badge variant="standby" className="mt-1">Backup</Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {fleetStatus.maintenance || 0}
              </div>
              <div className="text-sm text-gray-600">Under Maintenance</div>
              <Badge variant="maintenance" className="mt-1">Service</Badge>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {fleetStatus.critical || 0}
              </div>
              <div className="text-sm text-gray-600">Critical Status</div>
              <Badge variant="critical" className="mt-1">Attention</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {metrics?.alerts && metrics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>System Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.alerts.slice(0, 5).map((alert: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'critical' 
                      ? 'bg-red-50 border-red-500' 
                      : alert.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">
                        {alert.trainset} - {alert.message}
                      </div>
                    </div>
                    <Badge 
                      variant={alert.priority === 'critical' ? 'critical' : 'default'}
                      className="text-xs"
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}