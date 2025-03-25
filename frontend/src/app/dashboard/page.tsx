import { Metadata } from "next";
import { StatsCardGrid } from "@/components/dashboard/stats-grid";
import { DiseaseChart } from "@/components/dashboard/disease-chart";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Disease analytics dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        
        <div className="space-y-6">
          <StatsCardGrid />
          
          <div className="grid gap-4 grid-cols-1">
            <DiseaseChart />
          </div>
        </div>
      </div>
    </div>
  );
}
