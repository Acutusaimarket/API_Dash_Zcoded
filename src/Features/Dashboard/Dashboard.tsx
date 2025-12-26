import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Logout,
  Chart,
  Gallery,
  TestTube,
  Calculator,
  Home,
  Key,
  Box,
  User as UserIcon,
} from "@solar-icons/react";
import { Overview } from "./pages/Overview";
import { Usage } from "./pages/Usage";
import { ApiKey } from "./pages/ApiKey";
import type { User } from "@/lib/api/endpoints";
import { CustomSubscription } from "../CustomSubscription";

interface DashboardProps {
  onLogout?: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const isSidebarOpen = true;
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSubTab, setActiveSubTab] = useState<
    "media" | "concept-test" | "price-simulator" | "product" | "persona"
  >("media");
  const [userData] = useState<User | null>(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        return JSON.parse(storedUserData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  });

  const handleApiKeyClick = () => {
    navigate("/dashboard/api-keys");
  };

  const handleOverviewClick = () => {
    navigate("/dashboard");
  };

  const handleUsageClick = () => {
    navigate("/dashboard/usage");
  };

  return (
    <div className="dashboard-container flex h-screen overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a]">
      {isSidebarOpen && (
        <Sidebar className="bg-white dark:bg-[#111111] shadow-sm">
          <SidebarHeader>
            <div className="flex items-center gap-3">
              <img
                src="/hea.png"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
              <h2 className="text-lg font-semibold text-black dark:text-white">
                API Dashboard
              </h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarItem
                onClick={handleOverviewClick}
                className={`transition-all duration-200 ${
                  location.pathname === "/dashboard" ||
                  location.pathname === "/dashboard/"
                    ? "bg-[#00c950]/10 text-black dark:text-white border-l-4 border-[#00c950] font-semibold"
                    : "text-[#666666] dark:text-[#999999] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white"
                }`}
              >
                <Home size={18} className="mr-2" />
                Overview
              </SidebarItem>
              <SidebarItem
                onClick={handleUsageClick}
                className={`transition-all duration-200 ${
                  location.pathname === "/dashboard/usage"
                    ? "bg-[#00c950]/10 text-black dark:text-white border-l-4 border-[#00c950] font-semibold"
                    : "text-[#666666] dark:text-[#999999] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white"
                }`}
              >
                <Chart size={18} className="mr-2" />
                Usage
              </SidebarItem>
              <div className="ml-4 mt-2 mb-2 space-y-1 border-l-2 border-[#e5e5e5] dark:border-[#1f1f1f] pl-2">
                <SidebarSubItem
                  onClick={() => {
                    navigate("/dashboard/usage");
                    setActiveSubTab("media");
                  }}
                  className={`transition-all duration-200 ${
                    location.pathname === "/dashboard/usage" &&
                    activeSubTab === "media"
                      ? "bg-[#00c950]/10 text-[#00c950] font-medium"
                      : "text-[#666666] dark:text-[#999999] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Gallery size={16} className="mr-2" />
                  Media
                </SidebarSubItem>
                <SidebarSubItem
                  onClick={() => {
                    navigate("/dashboard/usage");
                    setActiveSubTab("concept-test");
                  }}
                  className={`transition-all duration-200 ${
                    location.pathname === "/dashboard/usage" &&
                    activeSubTab === "concept-test"
                      ? "bg-[#00c950]/10 text-[#00c950] font-medium"
                      : "text-[#666666] dark:text-[#999999] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white"
                  }`}
                >
                  <TestTube size={16} className="mr-2" />
                  Concept Test
                </SidebarSubItem>
                <SidebarSubItem
                  onClick={() => {
                    navigate("/dashboard/usage");
                    setActiveSubTab("price-simulator");
                  }}
                  className={`transition-all duration-200 ${
                    location.pathname === "/dashboard/usage" &&
                    activeSubTab === "price-simulator"
                      ? "bg-[#00c950]/10 text-[#00c950] font-medium"
                      : "text-[#666666] dark:text-[#999999] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Calculator size={16} className="mr-2" />
                  Price Simulator
                </SidebarSubItem>
                <SidebarSubItem
                  onClick={() => {
                    navigate("/dashboard/usage");
                    setActiveSubTab("product");
                  }}
                  className={`transition-all duration-200 ${
                    location.pathname === "/dashboard/usage" &&
                    activeSubTab === "product"
                      ? "bg-[#00c950]/10 text-[#00c950] font-medium"
                      : "text-[#666666] dark:text-[#999999] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Box size={16} className="mr-2" />
                  Product
                </SidebarSubItem>
                <SidebarSubItem
                  onClick={() => {
                    navigate("/dashboard/usage");
                    setActiveSubTab("persona");
                  }}
                  className={`transition-all duration-200 ${
                    location.pathname === "/dashboard/usage" &&
                    activeSubTab === "persona"
                      ? "bg-[#00c950]/10 text-[#00c950] font-medium"
                      : "text-[#666666] dark:text-[#999999] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white"
                  }`}
                >
                  <UserIcon size={16} className="mr-2" />
                  Persona
                </SidebarSubItem>
              </div>
              <SidebarItem
                onClick={handleApiKeyClick}
                className={`transition-all duration-200 ${
                  location.pathname === "/dashboard/api-keys"
                    ? "bg-[#00c950]/10 text-black dark:text-white border-l-4 border-[#00c950] font-semibold"
                    : "text-[#666666] dark:text-[#999999] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white"
                }`}
              >
                <Key size={18} className="mr-2" />
                API Key
              </SidebarItem>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="space-y-3">
            {/* Usage Card */}
            <Card
              size="sm"
              className="bg-[#e8f5e9] dark:bg-[#1a3d1f] border-[#c8e6c9] dark:border-[#2d5a33] rounded-lg p-1.5"
            >
              <CardContent className="p-0 space-y-1.5">
                {/* Credits Display */}
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-black dark:text-white">
                    {userData?.credits_consumed?.toLocaleString() || "0"}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    / {userData?.total_credits?.toLocaleString() || "0"}
                  </span>
                </div>

                {/* Usage Label and Percentage */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-black dark:text-white">
                    Usage
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {userData && userData.total_credits > 0
                      ? (
                          (userData.credits_consumed / userData.total_credits) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-[#c8e6c9] dark:bg-[#2d5a33] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#a5d6a7] dark:bg-[#4caf50] transition-all duration-300 rounded-full"
                    style={{
                      width:
                        userData && userData.total_credits > 0
                          ? `${Math.min(
                              (userData.credits_consumed /
                                userData.total_credits) *
                                100,
                              100
                            )}%`
                          : "0%",
                    }}
                  />
                </div>

                {/* Buttons */}
                <div className="space-y-1">
                  {/* <Button
                  className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg h-7 text-xs font-medium"
                  onClick={() => {
                    // Handle Add Credits action
                    console.log("Add Credits clicked");
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                    <path d="M9 3V15M3 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Add Credits
                </Button> */}
                  <CustomSubscription />
                </div>
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Button
              variant="ghost"
              className="w-full justify-start text-[#666666] dark:text-[#999999] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white transition-all duration-200"
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("refresh_token");
                  localStorage.removeItem("token_type");
                  localStorage.removeItem("expires_in");
                  localStorage.removeItem("refresh_expires_in");
                  localStorage.removeItem("token_timestamp");
                  localStorage.removeItem("userEmail");
                  localStorage.removeItem("userId");
                  localStorage.removeItem("userData");
                  sessionStorage.removeItem("userPassword");
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

      <main className="flex-1 overflow-y-auto bg-white dark:bg-[#111111] m-4 rounded-xl shadow-sm border border-[#e5e5e5] dark:border-[#1f1f1f]">
        <div className="container mx-auto px-6 py-6">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route
              path="/usage"
              element={
                <Usage
                  activeSubTab={activeSubTab}
                  onSubTabChange={setActiveSubTab}
                />
              }
            />
            <Route path="/api-keys" element={<ApiKey />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
