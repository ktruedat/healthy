'use client';

import { StatsCard } from "./stats-card";
import { useDashboardSummary } from "@/hooks/use-dashboard-data";
import { Activity, Users, Heart, AlertTriangle } from "lucide-react";

export function StatsCardGrid() {
  const { data: summaryData, isLoading } = useDashboardSummary();
  
  const summary = summaryData?.data;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Cases Card */}
      <StatsCard
        title="Total Cases"
        value={summary?.totalCases ?? 0}
        changePercentage={summary?.changePercent}
        direction={summary?.trendDirection === 'increasing' ? 'up' : summary?.trendDirection === 'decreasing' ? 'down' : 'stable'}
        icon={<Activity className="h-4 w-4" />}
        description="from previous period"
        isLoading={isLoading}
        colorScheme="blue"
      />

      {/* Total Deaths Card */}
      <StatsCard
        title="Total Deaths"
        value={summary?.totalDeaths ?? 0}
        changePercentage={summary?.changePercent}
        direction={summary?.trendDirection === 'increasing' ? 'up' : summary?.trendDirection === 'decreasing' ? 'down' : 'stable'}
        icon={<AlertTriangle className="h-4 w-4" />}
        description="from previous period"
        isLoading={isLoading}
        colorScheme="red"
        trendsReversed={true} // Up trend is bad for deaths
      />

      {/* Total Recoveries Card */}
      <StatsCard
        title="Total Recoveries"
        value={summary?.totalRecoveries ?? 0}
        changePercentage={summary?.changePercent}
        direction={summary?.trendDirection === 'increasing' ? 'up' : summary?.trendDirection === 'decreasing' ? 'down' : 'stable'}
        icon={<Heart className="h-4 w-4" />}
        description="from previous period"
        isLoading={isLoading}
        colorScheme="green"
      />

      {/* Average Rate Card */}
      <StatsCard
        title="Average Rate"
        value={summary?.averageRate ?? 0}
        formatter={(value) => `${value.toFixed(2)}%`}
        changePercentage={summary?.changePercent}
        direction={summary?.trendDirection === 'increasing' ? 'up' : summary?.trendDirection === 'decreasing' ? 'down' : 'stable'}
        icon={<Users className="h-4 w-4" />}
        description="from previous period"
        isLoading={isLoading}
        colorScheme="amber"
      />
    </div>
  );
} 