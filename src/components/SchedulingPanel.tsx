import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Users, MapPin, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useTranslation } from 'react-i18next'

interface SchedulingPanelProps {
  trainsets: any[]
}

export function SchedulingPanel({ trainsets }: SchedulingPanelProps) {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [schedule, setSchedule] = useState<Record<string, string>>({})

  const handleStatusChange = (trainsetId: string, status: string) => {
    setSchedule(prev => ({ ...prev, [trainsetId]: status }))
  }

  const generateSchedule = () => {
    // Simple scheduling logic - can be enhanced
    const newSchedule: Record<string, string> = {}
    trainsets.forEach((trainset, index) => {
      if (trainset.availability_percentage >= 95) {
        newSchedule[trainset.id] = 'ready'
      } else if (trainset.availability_percentage >= 85) {
        newSchedule[trainset.id] = 'standby'
      } else if (trainset.availability_percentage >= 70) {
        newSchedule[trainset.id] = 'maintenance'
      } else {
        newSchedule[trainset.id] = 'critical'
      }
    })
    setSchedule(newSchedule)
  }

  const statusCounts = Object.values(schedule).reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Schedule Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>{t('scheduling.manualScheduling')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              />
              <Button onClick={generateSchedule} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('common.refresh')}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.ready || 0}
              </div>
              <div className="text-sm text-green-700">{t('status.ready')}</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {statusCounts.standby || 0}
              </div>
              <div className="text-sm text-yellow-700">{t('status.standby')}</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {statusCounts.maintenance || 0}
              </div>
              <div className="text-sm text-orange-700">{t('status.maintenance')}</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {statusCounts.critical || 0}
              </div>
              <div className="text-sm text-red-700">{t('status.critical')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trainset List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Fleet Assignment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {trainsets.map((trainset) => {
                const assignedStatus = schedule[trainset.id] || trainset.status
                return (
                  <div key={trainset.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{trainset.number}</div>
                        <div className="text-sm text-gray-500">
                          Bay {trainset.bay_position} • {trainset.availability_percentage}% available
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={assignedStatus as any} className="text-xs">
                        {assignedStatus}
                      </Badge>
                      <div className="flex space-x-1">
                        {['ready', 'standby', 'maintenance', 'critical'].map((status) => (
                          <Button
                            key={status}
                            variant={assignedStatus === status ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => handleStatusChange(trainset.id, status)}
                          >
                            {status.charAt(0).toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Schedule Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Service Readiness</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={((statusCounts.ready || 0) / trainsets.length) * 100} 
                  className="w-32 h-2" 
                />
                <span className="text-sm font-medium">
                  {Math.round(((statusCounts.ready || 0) / trainsets.length) * 100)}%
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Total Fleet</div>
                <div className="text-2xl font-bold">{trainsets.length}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Scheduled</div>
                <div className="text-2xl font-bold">{Object.keys(schedule).length}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}