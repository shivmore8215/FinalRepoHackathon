import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useGenerateAISchedule } from "@/hooks/useTrainData"
import { useState } from "react"
import { Brain, Calendar, Zap, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

interface AISchedulingPanelProps {
  trainsets: any[]
}

export function AISchedulingPanel({ trainsets }: AISchedulingPanelProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  const generateSchedule = useGenerateAISchedule()

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    try {
      const result = await generateSchedule.mutateAsync(selectedDate)
      setAiRecommendations(result.recommendations || [])
    } catch (error) {
      console.error('Failed to generate AI schedule:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600 bg-red-50'
    if (priority >= 6) return 'text-orange-600 bg-orange-50'
    if (priority >= 4) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <div className="space-y-6">
      {/* AI Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI-Powered Scheduling</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Schedule Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <Button 
                onClick={handleGenerateAI} 
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate AI Schedule
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {aiRecommendations.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {aiRecommendations.filter(r => r.recommended_status === 'ready').length}
                </div>
                <div className="text-sm text-green-700">AI Recommended Ready</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {aiRecommendations.filter(r => r.recommended_status === 'standby').length}
                </div>
                <div className="text-sm text-yellow-700">AI Recommended Standby</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {aiRecommendations.filter(r => r.recommended_status === 'maintenance').length}
                </div>
                <div className="text-sm text-orange-700">AI Recommended Maintenance</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {aiRecommendations.filter(r => r.recommended_status === 'critical').length}
                </div>
                <div className="text-sm text-red-700">AI Recommended Critical</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <Tabs defaultValue="recommendations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>AI Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {aiRecommendations.map((rec, index) => {
                      const trainset = trainsets.find(t => t.id === rec.trainset_id)
                      return (
                        <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{trainset?.number || 'Unknown'}</div>
                                <div className="text-sm text-gray-500">
                                  Current: {trainset?.status} → Recommended: {rec.recommended_status}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={rec.recommended_status as any}
                                className="text-xs"
                              >
                                {rec.recommended_status}
                              </Badge>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(rec.confidence_score)}`}>
                                {Math.round(rec.confidence_score * 100)}% confidence
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm">
                              <strong>Reasoning:</strong>
                              <ul className="list-disc list-inside ml-4 text-gray-600">
                                {rec.reasoning?.map((reason: string, i: number) => (
                                  <li key={i}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                            
                            {rec.risk_factors && rec.risk_factors.length > 0 && (
                              <div className="text-sm">
                                <strong className="text-red-600">Risk Factors:</strong>
                                <ul className="list-disc list-inside ml-4 text-red-600">
                                  {rec.risk_factors.map((risk: string, i: number) => (
                                    <li key={i}>{risk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Priority Score:</span>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(rec.priority_score)}`}>
                                {rec.priority_score}/10
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span>AI Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Optimization Factors</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Fleet availability maximization</li>
                        <li>• Maintenance scheduling efficiency</li>
                        <li>• Energy consumption optimization</li>
                        <li>• Passenger experience enhancement</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Performance Metrics</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Average confidence: {Math.round(aiRecommendations.reduce((sum, r) => sum + r.confidence_score, 0) / aiRecommendations.length * 100)}%</li>
                        <li>• High priority items: {aiRecommendations.filter(r => r.priority_score >= 7).length}</li>
                        <li>• Risk factors identified: {aiRecommendations.filter(r => r.risk_factors?.length > 0).length}</li>
                        <li>• Status changes: {aiRecommendations.filter(r => r.recommended_status !== trainsets.find(t => t.id === r.trainset_id)?.status).length}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Key Insights</h4>
                    <div className="text-sm text-purple-700 space-y-2">
                      <p>• AI has analyzed {aiRecommendations.length} trainsets with an average confidence of {Math.round(aiRecommendations.reduce((sum, r) => sum + r.confidence_score, 0) / aiRecommendations.length * 100)}%</p>
                      <p>• Recommended status changes for {aiRecommendations.filter(r => r.recommended_status !== trainsets.find(t => t.id === r.trainset_id)?.status).length} trainsets to optimize operations</p>
                      <p>• Identified {aiRecommendations.filter(r => r.risk_factors?.length > 0).length} trainsets with potential risk factors requiring attention</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}