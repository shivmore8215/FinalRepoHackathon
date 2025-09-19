import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Play, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainSet {
  id: string;
  number: string;
  status: "ready" | "standby" | "maintenance" | "critical";
  fitnessExpiry: Date;
  jobCardStatus: "open" | "closed";
  brandingPriority: number;
  mileage: number;
  lastCleaning: Date;
  bayPosition: number;
  availability: number;
}

interface SchedulingPanelProps {
  trainSets: TrainSet[];
}

interface AIRecommendation {
  trainId: string;
  trainNumber: string;
  recommendation: "service" | "standby" | "maintenance";
  confidence: number;
  reasoning: string[];
  priority: number;
}

export const SchedulingPanel = ({ trainSets }: SchedulingPanelProps) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  // Mock AI optimization
  const runOptimization = async () => {
    setIsOptimizing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate mock recommendations
    const mockRecommendations: AIRecommendation[] = trainSets
      .filter(t => t.status !== "critical")
      .map((train, index) => ({
        trainId: train.id,
        trainNumber: train.number,
        recommendation: train.status === "maintenance" ? "maintenance" as const : 
                      train.availability > 95 && train.jobCardStatus === "closed" ? "service" as const : "standby" as const,
        confidence: Math.floor(Math.random() * 20) + 80,
        reasoning: generateReasoning(train),
        priority: index + 1
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20); // Top 20 recommendations
    
    setRecommendations(mockRecommendations);
    setIsOptimizing(false);
  };

  const generateReasoning = (train: TrainSet): string[] => {
    const reasons = [];
    
    if (train.availability > 95) reasons.push("High availability score");
    if (train.jobCardStatus === "closed") reasons.push("No pending maintenance");
    if (train.brandingPriority >= 8) reasons.push("High branding priority");
    if (train.mileage < 30000) reasons.push("Low mileage accumulation");
    
    const daysToExpiry = Math.ceil((train.fitnessExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysToExpiry > 14) reasons.push("Valid fitness certificate");
    
    if (reasons.length === 0) reasons.push("Standard operational parameters");
    
    return reasons;
  };

  const readyForService = recommendations.filter(r => r.recommendation === "service").length;
  const onStandby = recommendations.filter(r => r.recommendation === "standby").length;
  const inMaintenance = recommendations.filter(r => r.recommendation === "maintenance").length;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="w-5 h-5 text-primary" />
          AI Scheduling Engine
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Control Panel */}
        <div className="space-y-3">
          <Button 
            onClick={runOptimization} 
            disabled={isOptimizing}
            className="w-full"
            size="sm"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Schedule
              </>
            )}
          </Button>

          {isOptimizing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Analyzing constraints...</span>
                <span>67%</span>
              </div>
              <Progress value={67} className="h-1" />
            </div>
          )}
        </div>

        {recommendations.length > 0 && (
          <>
            <Separator />
            
            {/* Summary */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Optimization Results</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-status-ready/10 rounded">
                  <div className="font-semibold text-status-ready">{readyForService}</div>
                  <div className="text-muted-foreground">Service</div>
                </div>
                <div className="text-center p-2 bg-status-standby/10 rounded">
                  <div className="font-semibold text-status-standby">{onStandby}</div>
                  <div className="text-muted-foreground">Standby</div>
                </div>
                <div className="text-center p-2 bg-status-maintenance/10 rounded">
                  <div className="font-semibold text-status-maintenance">{inMaintenance}</div>
                  <div className="text-muted-foreground">Maintenance</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Recommendations List */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Priority Recommendations</h4>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-2">
                  {recommendations.map((rec, index) => (
                    <div
                      key={rec.trainId}
                      className={cn(
                        "p-3 rounded-lg border text-xs space-y-2",
                        rec.recommendation === "service" && "bg-status-ready/5 border-status-ready/20",
                        rec.recommendation === "standby" && "bg-status-standby/5 border-status-standby/20",
                        rec.recommendation === "maintenance" && "bg-status-maintenance/5 border-status-maintenance/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{rec.trainNumber}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{rec.priority}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {rec.recommendation === "service" && <CheckCircle className="w-3 h-3 text-status-ready" />}
                            {rec.recommendation === "standby" && <Clock className="w-3 h-3 text-status-standby" />}
                            {rec.recommendation === "maintenance" && <AlertTriangle className="w-3 h-3 text-status-maintenance" />}
                            <span className={cn(
                              "text-xs font-medium",
                              rec.recommendation === "service" && "text-status-ready",
                              rec.recommendation === "standby" && "text-status-standby",
                              rec.recommendation === "maintenance" && "text-status-maintenance"
                            )}>
                              {rec.recommendation.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Confidence</span>
                        <div className="flex items-center gap-2">
                          <Progress value={rec.confidence} className="w-12 h-1" />
                          <span className="text-muted-foreground">{rec.confidence}%</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-muted-foreground block">Reasoning:</span>
                        {rec.reasoning.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-muted-foreground">
                            <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            <Button size="sm" className="w-full" variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Apply Recommendations
            </Button>
          </>
        )}

        {recommendations.length === 0 && !isOptimizing && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click "Generate Schedule" to run AI optimization</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};