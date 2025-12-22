import { useMemo, useEffect, useState } from "react";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarGroup,
  SidebarSubItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logout, Chart, Gallery, TestTube, Calculator, Home, Key } from "@solar-icons/react";
import { Overview } from "./pages/Overview";
import { Usage } from "./pages/Usage";
import { ApiKey } from "./pages/ApiKey";

type ActiveTab = "overview" | "usage" | "api-key";
type UsageSubTab = "media" | "concept-test" | "price-simulator";

interface DashboardProps {
  onLogout?: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Derive active tab from URL
  const activeTab = useMemo<ActiveTab>(() => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/dashboard/") {
      return "overview";
    } else if (path.startsWith("/dashboard/usage")) {
      return "usage";
    } else if (path === "/dashboard/api-key") {
      return "api-key";
    }
    return "overview";
  }, [location.pathname]);

  // Derive active usage sub-tab from URL
  const activeUsageTab = useMemo<UsageSubTab>(() => {
    const path = location.pathname;
    if (path.startsWith("/dashboard/usage/")) {
      const subPath = path.split("/dashboard/usage/")[1];
      if (subPath === "media" || subPath === "concept-test" || subPath === "price-simulator") {
        return subPath as UsageSubTab;
      }
    }
    return "media";
  }, [location.pathname]);

  // Redirect to default sub-tab if usage tab is accessed without sub-path
  useEffect(() => {
    if (activeTab === "usage" && !location.pathname.includes("/dashboard/usage/")) {
      navigate("/dashboard/usage/media", { replace: true });
    }
  }, [activeTab, location.pathname, navigate]);

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === "overview") {
      navigate("/dashboard", { replace: true });
    } else if (tab === "usage") {
      navigate("/dashboard/usage/media", { replace: true });
    } else if (tab === "api-key") {
      navigate("/dashboard/api-key", { replace: true });
    }
  };

  const handleUsageSubTabChange = (subTab: UsageSubTab) => {
    navigate(`/dashboard/usage/${subTab}`, { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {isSidebarOpen && (
        <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <img src="/hea.png" alt="Logo" className="h-8 w-8 object-contain" />
            <h2 className="text-lg font-semibold">Dashboard</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem
              active={activeTab === "overview"}
              onClick={() => handleTabChange("overview")}
            >
              <Home size={18} className="mr-2" />
              Overview
            </SidebarItem>
            <SidebarItem
              active={activeTab === "usage"}
              onClick={() => handleTabChange("usage")}
            >
              <Chart size={18} className="mr-2" />
              Usage
            </SidebarItem>
            <div className="ml-4 mt-1 space-y-1">
              <SidebarSubItem
                active={activeUsageTab === "media" && activeTab === "usage"}
                onClick={() => handleUsageSubTabChange("media")}
              >
                <Gallery size={16} className="mr-2" />
                Media
              </SidebarSubItem>
              <SidebarSubItem
                active={activeUsageTab === "concept-test" && activeTab === "usage"}
                onClick={() => handleUsageSubTabChange("concept-test")}
              >
                <TestTube size={16} className="mr-2" />
                Concept Test
              </SidebarSubItem>
              <SidebarSubItem
                active={activeUsageTab === "price-simulator" && activeTab === "usage"}
                onClick={() => handleUsageSubTabChange("price-simulator")}
              >
                <Calculator size={16} className="mr-2" />
                Price Simulator
              </SidebarSubItem>
            </div>
            <SidebarItem
              active={activeTab === "api-key"}
              onClick={() => handleTabChange("api-key")}
            >
              <Key size={18} className="mr-2" />
              API Key
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("token_type");
                localStorage.removeItem("expires_in");
                localStorage.removeItem("refresh_expires_in");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userId");
                localStorage.removeItem("userData");
                window.location.reload();
              }
            }}
          >
            <Logout size={18} className="mr-2" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
      )}
      <main className="flex-1 overflow-y-auto bg-background m-4 rounded-2xl shadow-lg border-r-4 border-green-500">
        <div className="container mx-auto px-2 py-4">
          <Routes>
            <Route path="/" element={<Overview onToggleSidebar={toggleSidebar} />} />
            <Route path="usage/*" element={<Usage activeSubTab={activeUsageTab} onSubTabChange={handleUsageSubTabChange} onToggleSidebar={toggleSidebar} />} />
            <Route path="api-key" element={<ApiKey onToggleSidebar={toggleSidebar} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

