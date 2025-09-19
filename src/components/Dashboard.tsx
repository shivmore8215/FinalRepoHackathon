import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrainCard } from "./TrainCard";
import { SchedulingPanel } from "./SchedulingPanel";
import { SystemMetrics } from "./SystemMetrics";
import { Clock, Train, AlertTriangle, CheckCircle } from "lucide-react";

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

const mockTrainSets: TrainSet[] = Array.from({ length: 25 }, (_, i) => ({
  id: `ts-${i + 1}`,
  number: `KMRL-${String(i + 1).padStart(3, '0')}`,
  status: ["ready", "standby", "maintenance", "critical"][Math.floor(Math.random() * 4)] as TrainSet["status"],
  fitnessExpiry: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
  jobCardStatus: Math.random() > 0.3 ? "closed" : "open",
  brandingPriority: Math.floor(Math.random() * 10) + 1,
  mileage: Math.floor(Math.random() * 50000) + 10000,
  lastCleaning: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  bayPosition: i + 1,
  availability: Math.floor(Math.random() * 30) + 85,
}));

export const Dashboard = () => {
  const [trainSets, setTrainSets] = useState<TrainSet[]>(mockTrainSets);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const readyCount = trainSets.filter(t => t.status === "ready").length;
  const standbyCount = trainSets.filter(t => t.status === "standby").length;
  const maintenanceCount = trainSets.filter(t => t.status === "maintenance").length;
  const criticalCount = trainSets.filter(t => t.status === "critical").length;

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
        totalFleet={25}
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

        {/* Scheduling Panel */}
        <div className="xl:col-span-1">
          <SchedulingPanel trainSets={trainSets} />
        </div>
      </div>
    </div>
  );
};