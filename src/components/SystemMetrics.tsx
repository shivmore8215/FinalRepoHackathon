import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, Wrench, Zap, TrendingUp, AlertTriangle } from "lucide-react"

interface SystemMetricsProps {
  metrics?: any
  isLoading: boolean
}

export function SystemMetrics({ metrics, isLoading }: SystemMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
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
      title: "Fleet Availability",
      value: `${fleetStatus.serviceability || 0}%`,
      progress: fleetStatus.serviceability || 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: `${fleetStatus.ready || 0} ready, ${fleetStatus.standby || 0} standby`
    },
    {
      title: "Punctuality",
      value: `${currentKPIs.punctuality || 99.2}%`,
      progress: currentKPIs.punctuality || 99.2,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "On-time performance"
    },
    {
      title: "Maintenance Cost",
      value: `₹${currentKPIs.maintenance_cost || 0}`,
      progress: 75,
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "This month"
    },
    {
      title: "Energy Efficiency",
      value: `${currentKPIs.energy_consumption || 0} kWh`,
      progress: 85,
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Average consumption"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <Card key={index} className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {metric.description}
              </div>
              <Progress value={metric.progress} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fleet Status Summary */}
      <Card>
        <CardHeader>
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