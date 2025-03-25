"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTitle } from "@/components/common/page-title";
import { EnhancedTimeChart } from "@/components/trends/enhanced-time-chart";
import { DiseaseDistributionChart } from "@/components/trends/disease-distribution-chart";
import { DiseaseHeatMap } from "@/components/trends/disease-heat-map";
import { TrendAnalysis } from "@/components/trends/trend-analysis";
import { CorrelationExplorer } from "@/components/trends/correlation-explorer";
import { InsightsSection } from "@/components/trends/insights-section";

import { useDashboardTrends } from "@/hooks";

export default function TrendsPage() {
  const { data, isLoading, error } = useDashboardTrends();
  const [timeRange, setTimeRange] = useState("all");
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageTitle 
        title="Disease Trends" 
        description="Analyze and visualize disease patterns and correlations"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <EnhancedTimeChart 
            data={data} 
            isLoading={isLoading} 
            error={error} 
          />
        </div>
        <div>
          <InsightsSection data={data} />
        </div>
      </div>
      
      <Tabs defaultValue="analysis">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis" className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TrendAnalysis data={data} />
            <DiseaseHeatMap data={data} />
          </div>
        </TabsContent>
        <TabsContent value="distribution" className="py-4">
          <DiseaseDistributionChart data={data} />
        </TabsContent>
        <TabsContent value="correlation" className="py-4">
          <CorrelationExplorer data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
