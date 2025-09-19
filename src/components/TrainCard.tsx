import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useUpdateTrainsetStatus } from "@/hooks/useTrainData"
import { formatDate, getStatusColor } from "@/lib/utils"
import { Train, Wrench, Calendar, Gauge, Settings } from "lucide-react"

interface TrainCardProps {
  trainset: {
    id: string
    number: string
    status: 'ready' | 'standby' | 'maintenance' | 'critical'
    bay_position: number
    mileage: number
    last_cleaning: string
    branding_priority: number
    availability_percentage: number
  }
}

export function TrainCard({ trainset }: TrainCardProps) {
  const updateStatus = useUpdateTrainsetStatus()

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({ id: trainset.id, status: newStatus })
  }

  const statusConfig = {
    ready: { label: 'Ready', color: 'ready', icon: '✓' },
    standby: { label: 'Standby', color: 'standby', icon: '⏸' },
    maintenance: { label: 'Maintenance', color: 'maintenance', icon: '🔧' },
    critical: { label: 'Critical', color: 'critical', icon: '⚠' }
  }

  const currentStatus = statusConfig[trainset.status]

  return (
    <Card className="train-card hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Train className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{trainset.number}</h3>
              <p className="text-xs text-gray-500">Bay {trainset.bay_position}</p>
            </div>
          </div>
          <Badge variant={currentStatus.color as any} className="text-xs">
            {currentStatus.icon} {currentStatus.label}
          </Badge>
        </div>

        {/* Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Availability</span>
            <span className="font-medium">{trainset.availability_percentage}%</span>
          </div>
          <Progress value={trainset.availability_percentage} className="h-2" />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-1">
              <Gauge className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">{trainset.mileage.toLocaleString()} km</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">{formatDate(trainset.last_cleaning)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Branding Priority</span>
            <span className="font-medium">{trainset.branding_priority}/10</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex space-x-1">
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={trainset.status === status ? "default" : "outline"}
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => handleStatusChange(status)}
                disabled={updateStatus.isPending}
              >
                {config.icon}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Indicator */}
        <div className={`mt-3 h-1 rounded-full ${getStatusColor(trainset.status).split(' ')[0]}`} />
      </CardContent>
    </Card>
  )
}