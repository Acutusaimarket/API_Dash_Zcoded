import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document } from "@solar-icons/react";

interface OverviewProps {
  onToggleSidebar?: () => void;
}

export function Overview({ onToggleSidebar }: OverviewProps) {
  // Sample data for charts
  const apiCallsData = [120, 180, 150, 200, 250, 180, 220, 190, 210, 240, 200, 234];
  const maxValue = Math.max(...apiCallsData);
  const chartHeight = 200;
  const chartWidth = 1000;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-9 w-9 rounded-md hover:bg-muted -ml-1"
        >
          <div className="flex items-center gap-1">
            <Document size={18} className="text-foreground" />
            <div className="w-px h-4 bg-border/60" />
          </div>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          {/* <p className="text-muted-foreground mt-2">
            Welcome to your dashboard. Here's an overview of your account.
          </p> */}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total API Calls</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Currently running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage Limit</CardTitle>
            <CardDescription>Remaining this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76%</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Usage Graphs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Calls Trend</CardTitle>
            <CardDescription>Last 12 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <svg
                width={chartWidth}
                height={chartHeight}
                className="w-full h-auto"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              >
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                  <line
                    key={y}
                    x1="40"
                    y1={y * (chartHeight - 40) + 20}
                    x2={chartWidth - 20}
                    y2={y * (chartHeight - 40) + 20}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-border opacity-20"
                  />
                ))}
                
                {/* Line chart */}
                <polyline
                  points={apiCallsData
                    .map((value, index) => {
                      const x = 40 + (index * (chartWidth - 60)) / (apiCallsData.length - 1);
                      const y = chartHeight - 20 - (value / maxValue) * (chartHeight - 40);
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />
                
                {/* Data points */}
                {apiCallsData.map((value, index) => {
                  const x = 40 + (index * (chartWidth - 60)) / (apiCallsData.length - 1);
                  const y = chartHeight - 20 - (value / maxValue) * (chartHeight - 40);
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="hsl(142, 76%, 36%)"
                      className="drop-shadow-sm"
                    />
                  );
                })}
                
                {/* X-axis labels */}
                {apiCallsData.map((_, index) => {
                  const x = 40 + (index * (chartWidth - 60)) / (apiCallsData.length - 1);
                  return (
                    <text
                      key={index}
                      x={x}
                      y={chartHeight - 5}
                      textAnchor="middle"
                      className="text-xs fill-muted-foreground"
                    >
                      {index + 1}
                    </text>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Distribution</CardTitle>
            <CardDescription>By service type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Media</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "45%" }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Concept Test</span>
                  <span className="font-medium">30%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "30%" }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price Simulator</span>
                  <span className="font-medium">25%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "25%" }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily API Usage</CardTitle>
          <CardDescription>Requests per day this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <div className="flex items-end gap-2 h-64 min-w-[600px]">
              {apiCallsData.map((value, index) => {
                const height = (value / maxValue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all hover:opacity-80"
                      style={{ height: `${height}%` }}
                      title={`Day ${index + 1}: ${value} calls`}
                    />
                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

