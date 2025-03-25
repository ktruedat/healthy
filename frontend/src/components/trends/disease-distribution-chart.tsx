"use client";

import React, { useState, useMemo } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartIcon, PieChartIcon } from "lucide-react";
import { DiseaseTrends } from "@/types/api-types";

interface DataPoint {
  name: string;
  year: number;
  quarter: number;
  cases: number;
  incidenceRate?: number;
  mortalityRate?: number;
  recoveryRate?: number;
}

interface DiseaseDistributionChartProps {
  data: DiseaseTrends | undefined;
  isLoading?: boolean;
  error?: Error | null;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderWidth: number;
  }[];
}

// Add interface for disease map
interface DiseaseMap {
  [key: string]: number;
}

export function DiseaseDistributionChart({ data, isLoading = false, error = null }: DiseaseDistributionChartProps) {
  const [chartType, setChartType] = useState("pie");
  
  const chartData = useMemo(() => {
    if (!data?.points) return { labels: [], datasets: [] };
    
    // Aggregate total cases by disease with properly typed accumulator
    const diseaseMap = data.points.reduce<DiseaseMap>((acc, point) => {
      acc[point.name] = (acc[point.name] || 0) + point.cases;
      return acc;
    }, {});
    
    // Sort by cases descending and take top 10
    const sortedData = Object.entries(diseaseMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    return {
      labels: sortedData.map(([name]) => name),
      datasets: [{
        data: sortedData.map(([, value]) => value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
          'rgba(83, 102, 255, 0.7)',
          'rgba(40, 159, 64, 0.7)',
          'rgba(210, 199, 199, 0.7)',
        ],
        borderWidth: 1
      }]
    };
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Disease Distribution</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={chartType === "pie" ? "default" : "outline"} 
            size="sm"
            onClick={() => setChartType("pie")}
          >
            <PieChartIcon className="h-4 w-4 mr-2" />
            Pie
          </Button>
          <Button 
            variant={chartType === "bar" ? "default" : "outline"} 
            size="sm"
            onClick={() => setChartType("bar")}
          >
            <BarChartIcon className="h-4 w-4 mr-2" />
            Bar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {chartType === "pie" ? (
            <Pie 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    align: 'center',
                  }
                }
              }}
            />
          ) : (
            <Bar 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
