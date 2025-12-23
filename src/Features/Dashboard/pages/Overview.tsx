import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Document } from "@solar-icons/react";
import { getApiKeyStatsEndpoint, listApiKeysEndpoint, type OverviewStatsResponseData, type ApiKeyStatsItem, type ApiKeyListItem } from "@/lib/api/endpoints";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface OverviewProps {
  onToggleSidebar?: () => void;
}

export function Overview({ onToggleSidebar }: OverviewProps) {
  const [overviewData, setOverviewData] = useState<OverviewStatsResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [apiKeys, setApiKeys] = useState<ApiKeyListItem[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);

  // Fetch API keys on mount
  useEffect(() => {
    const fetchApiKeys = async () => {
      setIsLoadingKeys(true);
      try {
        const response = await listApiKeysEndpoint();
        if (response.data && response.data.keys && response.data.keys.length > 0) {
          setApiKeys(response.data.keys);
        }
      } catch (err) {
        console.error("Error fetching API keys:", err);
      } finally {
        setIsLoadingKeys(false);
      }
    };
    fetchApiKeys();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [dateFrom, dateTo, selectedKeyId]);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getApiKeyStatsEndpoint({
        key_id: selectedKeyId, // null means all data, otherwise filter by selected key
        date_from: dateFrom ? new Date(dateFrom).toISOString() : null,
        date_to: dateTo ? new Date(dateTo + "T23:59:59").toISOString() : null,
        consumed_by: null, // null means all consumed_by types
        granularity: "daily",
        include_chart_data: true,
        charts_only: false,
      });

      if (response.data) {
        // Handle both old format (single object) and new format (keys array)
        if ('keys' in response.data) {
          setOverviewData(response.data as OverviewStatsResponseData);
        } else {
          // When a single key is selected, wrap it in keys array for consistency
          const singleKeyData = response.data as any;
          setOverviewData({ keys: [singleKeyData] });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch stats";
      setError(errorMessage);
      console.error("Error fetching stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Aggregate data from all keys
  const aggregateStats = () => {
    if (!overviewData?.keys || overviewData.keys.length === 0) {
      return {
        totalCredits: 0,
        totalRecords: 0,
        averageCreditsPerRecord: 0,
        creditsByType: {} as { [key: string]: number },
        recordsByType: {} as { [key: string]: number },
        chartData: [] as Array<{ date: string; credits: number; records: number }>,
      };
    }

    let totalCredits = 0;
    let totalRecords = 0;
    const creditsByType: { [key: string]: number } = {};
    const recordsByType: { [key: string]: number } = {};
    const chartDataMap: { [date: string]: { credits: number; records: number } } = {};

    // Aggregate data from all keys
    overviewData.keys.forEach((key: ApiKeyStatsItem) => {
      totalCredits += key.total_credits_used;
      totalRecords += key.total_records;

      // Merge credits_by_consumed_by
      Object.entries(key.credits_by_consumed_by).forEach(([type, credits]) => {
        creditsByType[type] = (creditsByType[type] || 0) + credits;
      });

      // Merge records_by_consumed_by
      Object.entries(key.records_by_consumed_by).forEach(([type, records]) => {
        recordsByType[type] = (recordsByType[type] || 0) + records;
      });

      // Merge chart data by date
      key.chart_data?.time_series?.forEach((point) => {
        if (!chartDataMap[point.date]) {
          chartDataMap[point.date] = { credits: 0, records: 0 };
        }
        chartDataMap[point.date].credits += point.credits;
        chartDataMap[point.date].records += point.records;
      });
    });

    // Convert chart data map to array and sort by date
    const chartData = Object.entries(chartDataMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const averageCreditsPerRecord = totalRecords > 0 ? totalCredits / totalRecords : 0;

    return {
      totalCredits,
      totalRecords,
      averageCreditsPerRecord,
      creditsByType,
      recordsByType,
      chartData,
    };
  };

  const aggregated = aggregateStats();

  // Prepare chart data for Recharts
  const rechartsData = aggregated.chartData.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fullDate: point.date,
    records: point.records,
    credits: Number(point.credits.toFixed(2)),
  }));

  // Calculate usage distribution
  const creditsByType = aggregated.creditsByType;
  const totalCredits = aggregated.totalCredits;
  const getPercentage = (value: number) => totalCredits > 0 ? (value / totalCredits) * 100 : 0;

  // Prepare data for usage distribution chart
  const distributionData = Object.entries(creditsByType).map(([key, value]) => {
    const label =
      key === "media_simulation"
        ? "Media"
        : key === "concept_simulation"
        ? "Concept Test"
        : key === "persona_generation_clustering"
        ? "Persona"
        : key === "product_ocr"
        ? "Product"
        : key;
    return {
      name: label,
      credits: Number(value.toFixed(2)),
      percentage: getPercentage(value),
    };
  });

  return (
    <div className="space-y-6">
      <div className="dashboard-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e5e5e5] dark:border-[#1f1f1f]">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-1">Overview</h1>
          <p className="text-sm text-[#666666] dark:text-[#999999]">
            Monitor your API usage and performance metrics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="date-from" className="text-sm text-[#666666] dark:text-[#999999] whitespace-nowrap font-medium">From:</Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px] border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] text-black dark:text-white focus:border-[#00c950] focus:ring-[#00c950]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="date-to" className="text-sm text-[#666666] dark:text-[#999999] whitespace-nowrap font-medium">To:</Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px] border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] text-black dark:text-white focus:border-[#00c950] focus:ring-[#00c950]/20"
              min={dateFrom || undefined}
            />
          </div>
          {(dateFrom || dateTo) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="border-[#e5e5e5] dark:border-[#1f1f1f] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] text-black dark:text-white"
            >
              Clear
            </Button>
          )}
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#666666] dark:text-[#999999] whitespace-nowrap font-medium">API Key:</label>
            <Select
              value={selectedKeyId?.toString() || "all"}
              onValueChange={(value) => setSelectedKeyId(value === "all" ? null : Number(value))}
              disabled={isLoadingKeys || apiKeys.length === 0}
            >
              <SelectTrigger className="w-[200px] border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] text-black dark:text-white focus:border-[#00c950] focus:ring-[#00c950]/20">
                <SelectValue placeholder={isLoadingKeys ? "Loading..." : "All API keys"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#111111] border-[#e5e5e5] dark:border-[#1f1f1f]">
                <SelectItem value="all" className="text-black dark:text-white">All API keys</SelectItem>
                {apiKeys.map((key) => (
                  <SelectItem key={key.id} value={key.id.toString()} className="text-black dark:text-white">
                    ........{key.masked_suffix}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {error && (
        <Card size="sm" className="animate-fade-in-up border-[#ef4444] bg-[#ef4444]/5 dark:bg-[#ef4444]/10">
          <CardContent className="pt-4">
            <div className="text-[#ef4444] text-xs font-medium">{error}</div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-[#666666] dark:text-[#999999] animate-fade-in">Loading stats...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total API Requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00c950]">{aggregated.totalRecords.toLocaleString()}</div>
                <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">All time API requests</p>
              </CardContent>
            </Card>
            <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total Credits Used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00c950]">{aggregated.totalCredits.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Credits consumed</p>
              </CardContent>
            </Card>
            <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Average Credits/API Request</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00c950]">{aggregated.averageCreditsPerRecord.toFixed(2)}</div>
                <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Per API request average</p>
              </CardContent>
            </Card>
          </div>
      
      {/* Usage Graphs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm" className="dashboard-chart border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm">
          <CardHeader className="border-b border-[#e5e5e5] dark:border-[#1f1f1f] pb-3">
            <CardTitle className="text-base font-semibold text-black dark:text-white">API Calls Trend</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests and credits over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {rechartsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={rechartsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" dark:stroke="#1f1f1f" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "#666666" }}
                    stroke="#e5e5e5"
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "#666666" }}
                    stroke="#e5e5e5"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      color: "#000000",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="records"
                    stroke="#00c950"
                    strokeWidth={3}
                    dot={{ fill: "#00c950", r: 5 }}
                    name="API Requests"
                  />
                  <Line
                    type="monotone"
                    dataKey="credits"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 5 }}
                    name="Credits"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-[#666666] dark:text-[#999999] text-center py-12">No chart data available</div>
            )}
          </CardContent>
        </Card>

        <Card size="sm" className="dashboard-chart border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm">
          <CardHeader className="border-b border-[#e5e5e5] dark:border-[#1f1f1f] pb-3">
            <CardTitle className="text-base font-semibold text-black dark:text-white">Usage Distribution</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">By service type</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: "#666666" }}
                    stroke="#e5e5e5"
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "#666666" }}
                    stroke="#e5e5e5"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      color: "#000000",
                    }}
                    formatter={(value: number) => [
                      `${value.toFixed(2)} credits (${distributionData.find((d) => d.credits === value)?.percentage.toFixed(1)}%)`,
                      "Credits",
                    ]}
                  />
                  <Bar dataKey="credits" fill="#00c950" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-[#666666] dark:text-[#999999] text-center py-12">No usage data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card size="sm" className="dashboard-chart border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm">
        <CardHeader className="border-b border-[#e5e5e5] dark:border-[#1f1f1f] pb-3">
          <CardTitle className="text-base font-semibold text-black dark:text-white">Daily API Usage</CardTitle>
          <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests per day</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {rechartsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rechartsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "#666666" }}
                  stroke="#e5e5e5"
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "#666666" }}
                  stroke="#e5e5e5"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    color: "#000000",
                  }}
                />
                <Bar dataKey="records" fill="#00c950" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-[#666666] dark:text-[#999999] text-center py-12">No chart data available</div>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}

