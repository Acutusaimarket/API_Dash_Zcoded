import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gallery, TestTube, Calculator, Document, Box, User } from "@solar-icons/react";
import { getApiKeyStatsEndpoint, listApiKeysEndpoint, type ApiKeyStatsResponseData, type ApiKeyListItem } from "@/lib/api/endpoints";
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

type UsageSubTab = "media" | "concept-test" | "price-simulator" | "product" | "persona";

interface UsageProps {
  activeSubTab: UsageSubTab;
  onSubTabChange: (subTab: UsageSubTab) => void;
  onToggleSidebar?: () => void;
}

export function Usage({ activeSubTab, onSubTabChange, onToggleSidebar }: UsageProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeyListItem[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Fetch API keys on mount
  useEffect(() => {
    const fetchApiKeys = async () => {
      setIsLoadingKeys(true);
      try {
        const response = await listApiKeysEndpoint();
        if (response.data && response.data.keys && response.data.keys.length > 0) {
          setApiKeys(response.data.keys);
          // Set first key as default selection
          setSelectedKeyId(response.data.keys[0].id);
        }
      } catch (err) {
        console.error("Error fetching API keys:", err);
      } finally {
        setIsLoadingKeys(false);
      }
    };
    fetchApiKeys();
  }, []);

  return (
    <div className="space-y-6">
      <div className="dashboard-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e5e5e5] dark:border-[#1f1f1f]">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-1">Usage</h1>
          <p className="text-sm text-[#666666] dark:text-[#999999]">
            Track usage statistics by service type
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
              value={selectedKeyId?.toString() || ""}
              onValueChange={(value) => setSelectedKeyId(value ? Number(value) : null)}
              disabled={isLoadingKeys || apiKeys.length === 0}
            >
              <SelectTrigger className="w-[200px] border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] text-black dark:text-white focus:border-[#00c950] focus:ring-[#00c950]/20">
                <SelectValue placeholder={isLoadingKeys ? "Loading..." : "Select API key"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#111111] border-[#e5e5e5] dark:border-[#1f1f1f]">
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
      <div className="animate-fade-in-up animate-delay-200 border-b border-[#e5e5e5] dark:border-[#1f1f1f]">
        <nav className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => onSubTabChange("media")}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
              border-b-2 relative whitespace-nowrap
              ${activeSubTab === "media" 
                ? "text-[#00c950] border-[#00c950] bg-[#00c950]/5" 
                : "text-[#666666] dark:text-[#999999] border-transparent hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a]"
              }
            `}
          >
            <Gallery size={18} />
            <span>Media</span>
          </button>
          <button
            onClick={() => onSubTabChange("concept-test")}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
              border-b-2 relative whitespace-nowrap
              ${activeSubTab === "concept-test" 
                ? "text-[#00c950] border-[#00c950] bg-[#00c950]/5" 
                : "text-[#666666] dark:text-[#999999] border-transparent hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a]"
              }
            `}
          >
            <TestTube size={18} />
            <span>Concept Test</span>
          </button>
          <button
            onClick={() => onSubTabChange("price-simulator")}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
              border-b-2 relative whitespace-nowrap
              ${activeSubTab === "price-simulator" 
                ? "text-[#00c950] border-[#00c950] bg-[#00c950]/5" 
                : "text-[#666666] dark:text-[#999999] border-transparent hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a]"
              }
            `}
          >
            <Calculator size={18} />
            <span>Price Simulator</span>
          </button>
          <button
            onClick={() => onSubTabChange("product")}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
              border-b-2 relative whitespace-nowrap
              ${activeSubTab === "product" 
                ? "text-[#00c950] border-[#00c950] bg-[#00c950]/5" 
                : "text-[#666666] dark:text-[#999999] border-transparent hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a]"
              }
            `}
          >
            <Box size={18} />
            <span>Product</span>
          </button>
          <button
            onClick={() => onSubTabChange("persona")}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
              border-b-2 relative whitespace-nowrap
              ${activeSubTab === "persona" 
                ? "text-[#00c950] border-[#00c950] bg-[#00c950]/5" 
                : "text-[#666666] dark:text-[#999999] border-transparent hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a]"
              }
            `}
          >
            <User size={18} />
            <span>Persona</span>
          </button>
        </nav>
      </div>
      <div className="animate-fade-in animate-delay-300">
        {activeSubTab === "media" && <MediaUsage keyId={selectedKeyId} dateFrom={dateFrom} dateTo={dateTo} />}
        {activeSubTab === "concept-test" && <ConceptTestUsage keyId={selectedKeyId} dateFrom={dateFrom} dateTo={dateTo} />}
        {activeSubTab === "price-simulator" && <PriceSimulatorUsage keyId={selectedKeyId} dateFrom={dateFrom} dateTo={dateTo} />}
        {activeSubTab === "product" && <ProductUsage keyId={selectedKeyId} dateFrom={dateFrom} dateTo={dateTo} />}
        {activeSubTab === "persona" && <PersonaUsage keyId={selectedKeyId} dateFrom={dateFrom} dateTo={dateTo} />}
      </div>
    </div>
  );
}

// Helper hook to fetch stats for a specific consumed_by type
function useUsageStats(
  consumedBy: "media_simulation" | "concept_simulation" | "persona_generation_clustering" | "product_ocr",
  keyId: number | null,
  dateFrom: string,
  dateTo: string
) {
  const [statsData, setStatsData] = useState<ApiKeyStatsResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (keyId === null) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Use provided dates or default to last 30 days
        let dateFromObj: Date;
        let dateToObj: Date;

        if (dateFrom && dateTo) {
          dateFromObj = new Date(dateFrom);
          dateToObj = new Date(dateTo + "T23:59:59");
        } else {
          // Default to last 30 days
          dateToObj = new Date();
          dateFromObj = new Date();
          dateFromObj.setDate(dateFromObj.getDate() - 30);
        }

        const response = await getApiKeyStatsEndpoint({
          key_id: keyId,
          date_from: dateFromObj.toISOString(),
          date_to: dateToObj.toISOString(),
          consumed_by: consumedBy,
          granularity: "daily",
          include_chart_data: true,
          charts_only: false,
        });

        if (response.data) {
          setStatsData(response.data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch stats";
        setError(errorMessage);
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [keyId, consumedBy, dateFrom, dateTo]);

  return { statsData, isLoading, error };
}

function MediaUsage({ keyId, dateFrom, dateTo }: { keyId: number | null; dateFrom: string; dateTo: string }) {
  const { statsData, isLoading, error } = useUsageStats("media_simulation", keyId, dateFrom, dateTo);

  // Prepare chart data
  const chartData = statsData?.chart_data?.time_series?.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fullDate: point.date,
    records: point.records,
    credits: Number(point.credits.toFixed(2)),
  })) || [];

  if (isLoading) {
    return (
      <Card size="sm" className="animate-fade-in border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a]">
        <CardContent className="pt-4">
          <div className="text-center py-8 text-[#666666] dark:text-[#999999] text-sm">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm" className="animate-fade-in-up border-[#ef4444] bg-[#ef4444]/5 dark:bg-[#ef4444]/10">
        <CardContent className="pt-4">
          <div className="text-[#ef4444] text-xs font-medium">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total API Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.total_records?.toLocaleString() || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">All API requests</p>
          </CardContent>
        </Card>
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total Credits Used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.total_credits_used?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Credits consumed</p>
          </CardContent>
        </Card>
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Average Credits/API Request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.average_credits_per_record?.toFixed(2) || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Per API request average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm" className="dashboard-chart border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm">
          <CardHeader className="border-b border-[#e5e5e5] dark:border-[#1f1f1f] pb-3">
            <CardTitle className="text-base font-semibold text-black dark:text-white">Usage Trend</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests and credits over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
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
                    stroke="#00c950"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: "#00c950", r: 5 }}
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
            <CardTitle className="text-base font-semibold text-black dark:text-white">Daily Usage</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests per day</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
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
      </div>
    </div>
  );
}

function ConceptTestUsage({ keyId, dateFrom, dateTo }: { keyId: number | null; dateFrom: string; dateTo: string }) {
  const { statsData, isLoading, error } = useUsageStats("concept_simulation", keyId, dateFrom, dateTo);

  const chartData = statsData?.chart_data?.time_series?.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fullDate: point.date,
    records: point.records,
    credits: Number(point.credits.toFixed(2)),
  })) || [];

  if (isLoading) {
    return (
      <Card size="sm" className="animate-fade-in border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a]">
        <CardContent className="pt-4">
          <div className="text-center py-8 text-[#666666] dark:text-[#999999] text-sm">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm" className="animate-fade-in-up border-[#ef4444] bg-[#ef4444]/5 dark:bg-[#ef4444]/10">
        <CardContent className="pt-4">
          <div className="text-[#ef4444] text-xs font-medium">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total API Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.total_records?.toLocaleString() || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">All API requests</p>
          </CardContent>
        </Card>
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total Credits Used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.total_credits_used?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Credits consumed</p>
          </CardContent>
        </Card>
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Average Credits/API Request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.average_credits_per_record?.toFixed(2) || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Per API request average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm" className="dashboard-chart border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm">
          <CardHeader className="border-b border-[#e5e5e5] dark:border-[#1f1f1f] pb-3">
            <CardTitle className="text-base font-semibold text-black dark:text-white">Usage Trend</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests and credits over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
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
                    stroke="#00c950"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: "#00c950", r: 5 }}
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
            <CardTitle className="text-base font-semibold text-black dark:text-white">Daily Usage</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests per day</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
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
      </div>
    </div>
  );
}

function PriceSimulatorUsage({ keyId, dateFrom, dateTo }: { keyId: number | null; dateFrom: string; dateTo: string }) {
  const { statsData, isLoading, error } = useUsageStats("persona_generation_clustering", keyId, dateFrom, dateTo);

  const chartData = statsData?.chart_data?.time_series?.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fullDate: point.date,
    records: point.records,
    credits: Number(point.credits.toFixed(2)),
  })) || [];

  if (isLoading) {
    return (
      <Card size="sm" className="animate-fade-in border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a]">
        <CardContent className="pt-4">
          <div className="text-center py-8 text-[#666666] dark:text-[#999999] text-sm">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm" className="animate-fade-in-up border-[#ef4444] bg-[#ef4444]/5 dark:bg-[#ef4444]/10">
        <CardContent className="pt-4">
          <div className="text-[#ef4444] text-xs font-medium">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total API Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.total_records?.toLocaleString() || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">All API requests</p>
          </CardContent>
        </Card>
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total Credits Used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.total_credits_used?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Credits consumed</p>
          </CardContent>
        </Card>
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Average Credits/API Request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.average_credits_per_record?.toFixed(2) || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Per API request average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm" className="dashboard-chart border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm">
          <CardHeader className="border-b border-[#e5e5e5] dark:border-[#1f1f1f] pb-3">
            <CardTitle className="text-base font-semibold text-black dark:text-white">Usage Trend</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests and credits over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
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
                    stroke="#00c950"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: "#00c950", r: 5 }}
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
            <CardTitle className="text-base font-semibold text-black dark:text-white">Daily Usage</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests per day</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
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
      </div>
    </div>
  );
}

function ProductUsage({ keyId, dateFrom, dateTo }: { keyId: number | null; dateFrom: string; dateTo: string }) {
  const { statsData, isLoading, error } = useUsageStats("product_ocr", keyId, dateFrom, dateTo);

  const chartData = statsData?.chart_data?.time_series?.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fullDate: point.date,
    records: point.records,
    credits: Number(point.credits.toFixed(2)),
  })) || [];

  if (isLoading) {
    return (
      <Card size="sm" className="animate-fade-in border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a]">
        <CardContent className="pt-4">
          <div className="text-center py-8 text-[#666666] dark:text-[#999999] text-sm">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm" className="animate-fade-in-up border-[#ef4444] bg-[#ef4444]/5 dark:bg-[#ef4444]/10">
        <CardContent className="pt-4">
          <div className="text-[#ef4444] text-xs font-medium">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total API Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.total_records?.toLocaleString() || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">All API requests</p>
          </CardContent>
        </Card>
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total Credits Used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.total_credits_used?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Credits consumed</p>
          </CardContent>
        </Card>
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Average Credits/API Request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.average_credits_per_record?.toFixed(2) || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Per API request average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm" className="dashboard-chart border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm">
          <CardHeader className="border-b border-[#e5e5e5] dark:border-[#1f1f1f] pb-3">
            <CardTitle className="text-base font-semibold text-black dark:text-white">Usage Trend</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests and credits over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
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
                    stroke="#00c950"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: "#00c950", r: 5 }}
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
            <CardTitle className="text-base font-semibold text-black dark:text-white">Daily Usage</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests per day</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
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
      </div>
    </div>
  );
}

function PersonaUsage({ keyId, dateFrom, dateTo }: { keyId: number | null; dateFrom: string; dateTo: string }) {
  const { statsData, isLoading, error } = useUsageStats("persona_generation_clustering", keyId, dateFrom, dateTo);

  const chartData = statsData?.chart_data?.time_series?.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fullDate: point.date,
    records: point.records,
    credits: Number(point.credits.toFixed(2)),
  })) || [];

  if (isLoading) {
    return (
      <Card size="sm" className="animate-fade-in border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a]">
        <CardContent className="pt-4">
          <div className="text-center py-8 text-[#666666] dark:text-[#999999] text-sm">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size="sm" className="animate-fade-in-up border-[#ef4444] bg-[#ef4444]/5 dark:bg-[#ef4444]/10">
        <CardContent className="pt-4">
          <div className="text-[#ef4444] text-xs font-medium">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total API Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.total_records?.toLocaleString() || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">All API requests</p>
          </CardContent>
        </Card>
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Total Credits Used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.total_credits_used?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Credits consumed</p>
          </CardContent>
        </Card>
        <Card size="sm" className="dashboard-card border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-[#666666] dark:text-[#999999] uppercase tracking-wide">Average Credits/API Request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00c950]">{statsData?.average_credits_per_record?.toFixed(2) || 0}</div>
            <p className="text-xs text-[#999999] dark:text-[#666666] mt-1">Per API request average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm" className="dashboard-chart border border-[#e5e5e5] dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] shadow-sm">
          <CardHeader className="border-b border-[#e5e5e5] dark:border-[#1f1f1f] pb-3">
            <CardTitle className="text-base font-semibold text-black dark:text-white">Usage Trend</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests and credits over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
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
                    stroke="#00c950"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: "#00c950", r: 5 }}
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
            <CardTitle className="text-base font-semibold text-black dark:text-white">Daily Usage</CardTitle>
            <CardDescription className="text-xs text-[#666666] dark:text-[#999999]">API Requests per day</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
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
      </div>
    </div>
  );
}
