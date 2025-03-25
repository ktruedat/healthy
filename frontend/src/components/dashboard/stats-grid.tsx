"use client";

import * as React from "react";
import { Activity, Thermometer, BarChart2, Map } from "lucide-react";
import { StatsCard, StatsCardProps } from "./stats-card";
import { useDashboardSummary } from "@/hooks";
import { EmptyState } from "@/components/common/error-states";

export function StatsCardGrid() {
  const { data: summary, isLoading, error } = useDashboardSummary();

  if (error) {
    return (
      <EmptyState 
        title="Unable to load dashboard data" 
        description="There was an error loading the dashboard statistics. Please try again later."
      />
    );
  }

  // Stats cards definition - customize icons and descriptions based on your data
  const statsCards: (Omit<StatsCardProps, "isLoading"> & { id: string })[] = [
    {
      id: "total-cases",
      title: "Total Cases",
      value: summary?.totalCases || 0,
      icon: <Activity className="h-4 w-4" />,
      formatter: (val) => val.toLocaleString(),
      direction: "up",
      changePercentage: summary?.changePercent || 0,
      description: `${summary?.trendDirection || ''} trend`,
      colorScheme: "blue", // Subtle blue for cases
      trendsReversed: true // Increasing cases is bad
    },
    {
      id: "total-deaths",
      title: "Total Deaths",
      value: summary?.totalDeaths || 0,
      icon: <Thermometer className="h-4 w-4" />,
      formatter: (val) => val.toLocaleString(),
      direction: "down",
      changePercentage: 2.1,
      description: "mortality rate",
      colorScheme: "red", // Subtle red for deaths
      trendsReversed: true // Increasing deaths is bad
    },
    {
      id: "total-recoveries",
      title: "Recoveries",
      value: summary?.totalRecoveries || 0,
      icon: <Map className="h-4 w-4" />,
      formatter: (val) => val.toLocaleString(),
      direction: "up",
      changePercentage: 4.2,
      colorScheme: "green", // Subtle green for recoveries
      trendsReversed: false // Increasing recoveries is good
    },
    {
      id: "average-rate",
      title: "Avg. Incidence Rate",
      value: summary?.averageRate || 0,
      icon: <BarChart2 className="h-4 w-4" />,
      formatter: (val) => val.toFixed(1),
      direction: summary?.trendDirection === 'increasing' ? 'up' : 
                summary?.trendDirection === 'decreasing' ? 'down' : 'stable',
      description: "per 100k population",
      colorScheme: "amber", // Subtle amber/yellow for rates
      trendsReversed: true // Increasing incidence rate is bad
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((card) => (
        <StatsCard
          key={card.id}
          {...card}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
