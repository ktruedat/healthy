"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/charts";
import { useDashboardTrends } from "@/hooks";
import { Check, ChevronsUpDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function DiseaseChart() {
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useDashboardTrends();
  
  // Extract all available disease names
  const allDiseases = useMemo(() => {
    if (!data?.points) return [];
    return Array.from(new Set(data.points.map(point => point.name))).sort();
  }, [data]);
  
  // Filter diseases based on search query
  const filteredDiseases = useMemo(() => {
    if (!searchQuery.trim()) return allDiseases;
    return allDiseases.filter(disease => 
      disease.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allDiseases, searchQuery]);

  // Process the data for the chart using the actual API response structure
  const { labels, datasets } = useMemo(() => {
    const timeLabels: string[] = [];
    const chartDatasets: { label: string; data: number[]; totalCases?: number }[] = [];
    
    if (data?.points) {
      // Step 1: Identify unique time periods (year-quarter combinations)
      const uniqueTimePeriods = Array.from(
        new Set(data.points.map(point => `${point.year}-Q${point.quarter}`))
      ).sort();
      
      // Step 2: Identify unique diseases
      const uniqueDiseases = Array.from(
        new Set(data.points.map(point => point.name))
      ).sort();
      
      // Use the unique time periods as labels
      timeLabels.push(...uniqueTimePeriods);
      
      // Step 3: Create a dataset for each disease
      uniqueDiseases.forEach(diseaseName => {
        // Initialize an array of zeros for all time periods
        const casesByTimePeriod = new Array(uniqueTimePeriods.length).fill(0);
        
        // Fill in the actual case counts where data exists
        data.points
          .filter(point => point.name === diseaseName)
          .forEach(point => {
            const timeLabel = `${point.year}-Q${point.quarter}`;
            const index = uniqueTimePeriods.indexOf(timeLabel);
            if (index !== -1) {
              casesByTimePeriod[index] = point.cases;
            }
          });
        
        // Calculate max cases for this disease for later filtering
        const maxCases = Math.max(...casesByTimePeriod);
        const totalCases = casesByTimePeriod.reduce((sum, cases) => sum + cases, 0);
        
        // If user has selected specific diseases, show only those
        // Otherwise, use the automatic filtering logic
        if (selectedDiseases.length > 0) {
          if (selectedDiseases.includes(diseaseName)) {
            chartDatasets.push({
              label: diseaseName,
              data: casesByTimePeriod,
              totalCases
            });
          }
        } else {
          // Only add diseases with significant case numbers to avoid clutter
          if (maxCases > 1000) {
            chartDatasets.push({
              label: diseaseName,
              data: casesByTimePeriod,
              totalCases
            });
          }
        }
      });
      
      if (selectedDiseases.length === 0) {
        // Sort datasets by total cases (descending) to prioritize major diseases
        chartDatasets.sort((a, b) => {
          return (b.totalCases || 0) - (a.totalCases || 0);
        });
        
        // Limit to top diseases to avoid overwhelming the chart
        if (chartDatasets.length > 5) {
          chartDatasets.splice(5);
        }
      }
    }
    
    return { labels: timeLabels, datasets: chartDatasets };
  }, [data, selectedDiseases]);

  // Toggle a disease selection
  const toggleDisease = (disease: string) => {
    setSelectedDiseases(prev => 
      prev.includes(disease) 
        ? prev.filter(d => d !== disease)
        : [...prev, disease]
    );
  };

  // Reset to show default top 5 diseases
  const resetToDefaultView = () => {
    setSelectedDiseases([]);
  };

  // Reset search when closing the popover
  const handlePopoverChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchQuery("");
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card to-background/80 shadow-xl border-muted/20">
      <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
        <div>
          <CardTitle className="text-primary/90 font-bold">Disease Trends</CardTitle>
          <CardDescription className="text-muted-foreground/80">
            Number of cases over time by quarter
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {selectedDiseases.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetToDefaultView}
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset to top 5
            </Button>
          )}
          <Popover open={open} onOpenChange={handlePopoverChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between"
                disabled={isLoading}
              >
                {selectedDiseases.length > 0 
                  ? `${selectedDiseases.length} selected` 
                  : "Top 5 diseases"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="end">
              <div className="p-2">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Search diseases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-[300px] overflow-auto">
                {filteredDiseases.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No disease matches your search
                  </div>
                ) : (
                  filteredDiseases.map((disease) => (
                    <div 
                      key={disease}
                      className="px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        toggleDisease(disease);
                        // Don't close the popover
                        setOpen(true);
                      }}
                    >
                      <div className="flex items-center w-full">
                        <div
                          className={cn(
                            "mr-2 h-4 w-4 border rounded flex items-center justify-center",
                            selectedDiseases.includes(disease) 
                              ? "bg-primary border-primary" 
                              : "border-input"
                          )}
                        >
                          {selectedDiseases.includes(disease) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        {disease}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {selectedDiseases.length > 0 && (
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-center text-muted-foreground border"
                    onClick={() => {
                      resetToDefaultView();
                      setOpen(false);
                    }}
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap gap-1">
          {selectedDiseases.map(disease => (
            <Badge 
              key={disease} 
              variant="outline"
              className="cursor-pointer"
              onClick={() => toggleDisease(disease)}
            >
              {disease}
              <span className="ml-1 text-xs">×</span>
            </Badge>
          ))}
        </div>
        <LineChart 
          labels={labels}
          datasets={datasets}
          height={350}
          isLoading={isLoading}
          error={error as Error}
          yAxisLabel="Number of Cases"
          xAxisLabel="Time Period"
        />
        {selectedDiseases.length === 0 && !isLoading && datasets.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Showing top {datasets.length} diseases by case count. Use the filter to view specific diseases.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
