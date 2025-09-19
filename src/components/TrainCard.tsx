import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Train, 
  Calendar,
  Wrench,
  Star,
  Gauge,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock
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

interface TrainCardProps {
  trainSet: TrainSet;
}

const statusConfig = {
  ready: {
    color: "bg-status-ready text-status-ready-foreground",
    icon: CheckCircle,
    label: "Ready for Service"
  },
  standby: {
    color: "bg-status-standby text-status-standby-foreground",
    icon: Clock,
    label: "On Standby"
  },
  maintenance: {
    color: "bg-status-maintenance text-status-maintenance-foreground",
    icon: Wrench,
    label: "In Maintenance"
  },
  critical: {
    color: "bg-status-critical text-status-critical-foreground",
    icon: AlertTriangle,
    label: "Critical Issues"
  }
};

export const TrainCard = ({ trainSet }: TrainCardProps) => {
  const statusInfo = statusConfig[trainSet.status];
  const StatusIcon = statusInfo.icon;
  
  const daysToExpiry = Math.ceil((trainSet.fitnessExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const daysSinceCleaning = Math.ceil((Date.now() - trainSet.lastCleaning.getTime()) / (1000 * 60 * 60 * 24));
  
  const isExpiryWarning = daysToExpiry <= 7;
  const isCleaningDue = daysSinceCleaning >= 3;

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg cursor-pointer border-l-4",
      trainSet.status === "ready" && "border-l-status-ready",
      trainSet.status === "standby" && "border-l-status-standby", 
      trainSet.status === "maintenance" && "border-l-status-maintenance",
      trainSet.status === "critical" && "border-l-status-critical"
    )}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{trainSet.number}</span>
          </div>
          <Badge className={cn("text-xs px-2 py-1", statusInfo.color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {trainSet.status.toUpperCase()}
          </Badge>
        </div>

        {/* Availability Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Availability</span>
            <span className="font-medium">{trainSet.availability}%</span>
          </div>
          <Progress value={trainSet.availability} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={cn(
            "flex items-center gap-1 p-1 rounded",
            isExpiryWarning ? "bg-destructive/10 text-destructive" : "text-muted-foreground"
          )}>
            <Calendar className="w-3 h-3" />
            <span>{daysToExpiry}d cert</span>
          </div>
          
          <div className={cn(
            "flex items-center gap-1 p-1 rounded",
            trainSet.jobCardStatus === "open" ? "bg-status-standby/20 text-status-standby-foreground" : "text-muted-foreground"
          )}>
            <Wrench className="w-3 h-3" />
            <span>{trainSet.jobCardStatus}</span>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="w-3 h-3" />
            <span>P{trainSet.brandingPriority}</span>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <Gauge className="w-3 h-3" />
            <span>{(trainSet.mileage / 1000).toFixed(0)}k km</span>
          </div>

          <div className={cn(
            "flex items-center gap-1 p-1 rounded",
            isCleaningDue ? "bg-status-standby/20 text-status-standby-foreground" : "text-muted-foreground"
          )}>
            <Sparkles className="w-3 h-3" />
            <span>{daysSinceCleaning}d ago</span>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>Bay {trainSet.bayPosition}</span>
          </div>
        </div>

        {/* Warnings */}
        {(isExpiryWarning || isCleaningDue || trainSet.jobCardStatus === "open") && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertTriangle className="w-3 h-3" />
              <span>
                {isExpiryWarning && "Cert expiring soon"}
                {isCleaningDue && " • Cleaning due"}
                {trainSet.jobCardStatus === "open" && " • Open job card"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};