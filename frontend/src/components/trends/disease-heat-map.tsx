"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DiseaseTrends } from "@/types/api-types";

interface DiseaseHeatMapProps {
  data: DiseaseTrends | undefined;
  isLoading?: boolean;
  error?: Error | null;
}

interface HeatMapCell {
  year: number;
  quarter: number;
  value: number;
}

export function DiseaseHeatMap({ data, isLoading = false, error = null }: DiseaseHeatMapProps) {
  const [metric, setMetric] = useState("cases");
  
  const heatmapData = useMemo(() => {
    if (!data?.points) return [];
    
    // Create a 2D array representing quarters (rows) and years (columns)
    const years = Array.from(new Set(data.points.map(p => p.year))).sort();
    const quarters = [1, 2, 3, 4];
    
    return quarters.map(quarter => {
      return years.map(year => {
        const points = data.points.filter(p => 
          p.year === year && p.quarter === quarter
        );
        
        // Sum up the selected metric
        const value = points.reduce((sum, point) => {
          switch (metric) {
            case "incidence":
              return sum + (point.incidenceRate || 0);
            case "mortality":
              return sum + (point.mortalityRate || 0);
            default:
              return sum + point.cases;
          }
        }, 0);
        
        return { year, quarter, value };
      });
    });
  }, [data, metric]);

  // Calculate color scale
  const maxValue = Math.max(...heatmapData.flat().map(cell => cell.value));
  const getColor = (value: number) => {
    const intensity = value / maxValue;
    return `rgb(0, ${Math.round(intensity * 200)}, ${Math.round(intensity * 255)})`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Disease Intensity Map</CardTitle>
        <Select defaultValue="cases" onValueChange={setMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cases">Cases</SelectItem>
            <SelectItem value="incidence">Incidence Rate</SelectItem>
            <SelectItem value="mortality">Mortality Rate</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {heatmapData.map((row, i) => (
                <div key={i} className="flex">
                  {row.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="w-16 h-16 flex items-center justify-center text-xs border-r border-b"
                      style={{
                        backgroundColor: getColor(cell.value),
                        color: cell.value > maxValue / 2 ? 'white' : 'black'
                      }}
                      title={`Q${cell.quarter} ${cell.year}: ${cell.value}`}
                    >
                      {cell.value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
