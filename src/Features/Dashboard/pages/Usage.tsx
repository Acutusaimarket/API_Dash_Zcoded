import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gallery, TestTube, Calculator, Document } from "@solar-icons/react";

type UsageSubTab = "media" | "concept-test" | "price-simulator";

interface UsageProps {
  activeSubTab: UsageSubTab;
  onSubTabChange: (subTab: UsageSubTab) => void;
  onToggleSidebar?: () => void;
}

export function Usage({ activeSubTab, onSubTabChange, onToggleSidebar }: UsageProps) {
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
          <h1 className="text-3xl font-bold">usage</h1>
          {/* <p className="text-muted-foreground mt-2">
            Monitor your API usage across different services.
          </p> */}
        </div>
      </div>
      <div className="border-b border-border/40">
        <nav className="flex gap-5">
          <button
            onClick={() => onSubTabChange("media")}
            className={`
              flex items-center gap-2 px-1 pb-4 pt-0 text-sm font-medium transition-colors
              border-b-2 relative
              ${activeSubTab === "media" 
                ? "text-foreground border-green-500" 
                : "text-muted-foreground border-transparent hover:text-foreground"
              }
            `}
          >
            <Gallery size={18} />
            <span>Media</span>
          </button>
          <button
            onClick={() => onSubTabChange("concept-test")}
            className={`
              flex items-center gap-2 px-1 pb-4 pt-0 text-sm font-medium transition-colors
              border-b-2 relative
              ${activeSubTab === "concept-test" 
                ? "text-foreground border-green-500" 
                : "text-muted-foreground border-transparent hover:text-foreground"
              }
            `}
          >
            <TestTube size={18} />
            <span>Concept Test</span>
          </button>
          <button
            onClick={() => onSubTabChange("price-simulator")}
            className={`
              flex items-center gap-2 px-1 pb-4 pt-0 text-sm font-medium transition-colors
              border-b-2 relative
              ${activeSubTab === "price-simulator" 
                ? "text-foreground border-green-500" 
                : "text-muted-foreground border-transparent hover:text-foreground"
              }
            `}
          >
            <Calculator size={18} />
            <span>Price Simulator</span>
          </button>
        </nav>
      </div>
      <div>
        {activeSubTab === "media" && <MediaUsage />}
        {activeSubTab === "concept-test" && <ConceptTestUsage />}
        {activeSubTab === "price-simulator" && <PriceSimulatorUsage />}
      </div>
    </div>
  );
}

function MediaUsage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Usage</CardTitle>
        <CardDescription>Track your media API calls and consumption</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Requests</span>
            <span className="text-lg font-semibold">856</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Data Processed</span>
            <span className="text-lg font-semibold">2.4 GB</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">This Month</span>
            <span className="text-lg font-semibold">234 requests</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConceptTestUsage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Concept Test Usage</CardTitle>
        <CardDescription>Monitor your concept testing API usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Tests Run</span>
            <span className="text-lg font-semibold">142</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Active Tests</span>
            <span className="text-lg font-semibold">8</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">This Month</span>
            <span className="text-lg font-semibold">45 tests</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriceSimulatorUsage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Simulator Usage</CardTitle>
        <CardDescription>Track your price simulation API calls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Simulations</span>
            <span className="text-lg font-semibold">236</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Scenarios Tested</span>
            <span className="text-lg font-semibold">1,024</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">This Month</span>
            <span className="text-lg font-semibold">78 simulations</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

