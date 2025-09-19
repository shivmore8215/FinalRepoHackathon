import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Calendar, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { useTrainData, AIRecommendation } from "@/hooks/useTrainData";

interface AISchedulingPanelProps {
  trainSets: any[];
}

export const AISchedulingPanel = ({ trainSets }: AISchedulingPanelProps) => {
  const { recommendations, generateAISchedule, loading } = useTrainData();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      await generateAISchedule(selectedDate);
    } finally {
      setIsGenerating(false);
    }
  };

  const getRecommendationForTrainset = (trainsetId: string): AIRecommendation | undefined => {
    return recommendations.find(rec => rec.trainsetId === trainsetId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-status-ready" />;
      case 'standby': return <Clock className="w-4 h-4 text-status-standby" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4 text-status-maintenance" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-status-critical" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const avgConfidence = recommendations.length > 0 
    ? Math.round(recommendations.reduce((sum, rec) => sum + rec.confidenceScore, 0) / recommendations.length * 100)
    : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Schedule Optimizer
          </CardTitle>
          {recommendations.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {avgConfidence}% Confidence
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Schedule Generation Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <Button 
            onClick={handleGenerateSchedule}
            disabled={isGenerating || loading}
            className="w-full"
            size="sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate AI Schedule
              </>
            )}
          </Button>
        </div>

        {recommendations.length > 0 && (
          <Tabs defaultValue="recommendations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommendations" className="space-y-3">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {recommendations
                    .sort((a, b) => b.priorityScore - a.priorityScore)
                    .map((rec) => {
                      const trainset = trainSets.find(ts => ts.id === rec.trainsetId);
                      if (!trainset) return null;

                      return (
                        <Card key={rec.trainsetId} className="p-3 border-l-4 border-l-primary/30">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{trainset.number}</span>
                                {getStatusIcon(rec.recommendedStatus)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={rec.confidenceScore >= 0.8 ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {Math.round(rec.confidenceScore * 100)}%
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  P{rec.priorityScore}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-xs font-medium text-primary">
                                Recommended: {rec.recommendedStatus.toUpperCase()}
                              </div>
                              
                              {rec.reasoning.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Lightbulb className="w-3 h-3" />
                                    <span>Key factors:</span>
                                  </div>
                                  <ul className="space-y-1 ml-4">
                                    {rec.reasoning.slice(0, 2).map((reason, idx) => (
                                      <li key={idx} className="text-xs">• {reason}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {rec.riskFactors.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-destructive">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{rec.riskFactors.length} risk factor(s)</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="insights" className="space-y-3">
              <div className="grid gap-3">
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Fleet Optimization</span>
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <Progress value={avgConfidence} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    AI confidence: {avgConfidence}% average across all recommendations
                  </p>
                </Card>

                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Risk Assessment</span>
                    <AlertTriangle className="w-4 h-4 text-status-maintenance" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {recommendations.filter(r => r.riskFactors.length > 0).length} trainsets have identified risks
                  </div>
                </Card>

                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Expected Performance</span>
                    <TrendingUp className="w-4 h-4 text-status-ready" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Projected punctuality: 99.3%<br />
                    Fleet availability: {Math.round(recommendations.filter(r => 
                      r.recommendedStatus === 'ready' || r.recommendedStatus === 'standby'
                    ).length / recommendations.length * 100)}%
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {recommendations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm">Generate AI-powered scheduling recommendations</p>
            <p className="text-xs mt-1">Click "Generate AI Schedule" to optimize tomorrow's operations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};