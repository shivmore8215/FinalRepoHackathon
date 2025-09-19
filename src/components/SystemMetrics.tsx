import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  Wrench, 
  AlertTriangle,
  Target,
  TrendingUp,
  Activity
} from "lucide-react";

interface SystemMetricsProps {
  ready: number;
  standby: number;
  maintenance: number;
  critical: number;
  totalFleet: number;
}

export const SystemMetrics = ({
  ready,
  standby,
  maintenance,
  critical,
  totalFleet
}: SystemMetricsProps) => {
  const serviceableCount = ready + standby;
  const serviceability = Math.round((serviceableCount / totalFleet) * 100);
  const currentPunctuality = 99.2; // Mock data
  const targetPunctuality = 99.5;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {/* Fleet Status Cards */}
      <Card className="border-l-4 border-l-status-ready">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ready for Service</p>
              <p className="text-2xl font-bold text-status-ready">{ready}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-status-ready" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-status-standby">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">On Standby</p>
              <p className="text-2xl font-bold text-status-standby">{standby}</p>
            </div>
            <Clock className="w-8 h-8 text-status-standby" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-status-maintenance">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Maintenance</p>
              <p className="text-2xl font-bold text-status-maintenance">{maintenance}</p>
            </div>
            <Wrench className="w-8 h-8 text-status-maintenance" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-status-critical">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
              <p className="text-2xl font-bold text-status-critical">{critical}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-status-critical" />
          </div>
        </CardContent>
      </Card>

      {/* Serviceability */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Fleet Serviceability</p>
              <p className="text-2xl font-bold text-primary">{serviceability}%</p>
            </div>
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <Progress value={serviceability} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {serviceableCount} of {totalFleet} trainsets
          </p>
        </CardContent>
      </Card>

      {/* Punctuality KPI */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Punctuality KPI</p>
              <p className="text-2xl font-bold text-primary">{currentPunctuality}%</p>
            </div>
            <Target className="w-8 h-8 text-primary" />
          </div>
          <Progress value={(currentPunctuality / targetPunctuality) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Target: {targetPunctuality}%</span>
            <Badge variant={currentPunctuality >= targetPunctuality ? "default" : "destructive"} className="text-xs">
              {currentPunctuality >= targetPunctuality ? (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  On Target
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Below Target
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};