import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrainCard } from "./TrainCard";
import { AISchedulingPanel } from "./AISchedulingPanel";
import { SystemMetrics } from "./SystemMetrics";
import { Clock, Train, AlertTriangle, CheckCircle } from "lucide-react";
import { useTrainData } from "@/hooks/useTrainData";


export const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { trainSets, metrics, loading, error } = useTrainData();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const readyCount = metrics?.ready || 0;
  const standbyCount = metrics?.standby || 0;
  const maintenanceCount = metrics?.maintenance || 0;
  const criticalCount = metrics?.critical || 0;

  const isPlanningWindow = currentTime.getHours() >= 21 || currentTime.getHours() <= 23;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KMRL Train Induction Planning</h1>
          <p className="text-muted-foreground">AI-Driven Scheduling & Fleet Management System</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Current Time (IST)</div>
            <div className="text-lg font-mono font-semibold">
              {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </div>
          </div>
          {isPlanningWindow && (
            <Badge variant="destructive" className="animate-pulse">
              <Clock className="w-4 h-4 mr-1" />
              Planning Window Active
            </Badge>
          )}
        </div>
      </div>

      {/* System Metrics */}
      <SystemMetrics 
        ready={readyCount}
        standby={standbyCount}
        maintenance={maintenanceCount}
        critical={criticalCount}
        totalFleet={metrics?.totalFleet || 25}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Fleet Overview */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Train className="w-5 h-5" />
                Fleet Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {trainSets.map((trainSet) => (
                  <TrainCard key={trainSet.id} trainSet={trainSet} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Scheduling Panel */}
        <div className="xl:col-span-1">
          <AISchedulingPanel trainSets={trainSets} />
        </div>
      </div>
    </div>
  );
};