"use client";

import React, { useState, useMemo } from "react";
import { LineChart } from "@/components/charts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Check, ChevronsUpDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { DiseaseTrends } from "@/types/api-types";

interface EnhancedTimeChartProps {
  data: DiseaseTrends | undefined;
  isLoading?: boolean;
  error?: Error | null;
}

// Various options for time frame display
const timeFrameOptions = [
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "monthly", label: "Monthly" },
];

// Various metrics to display
const metricOptions = [
  { value: "cases", label: "Cases" },
  { value: "incidenceRate", label: "Incidence Rate" },
  { value: "mortalityRate", label: "Mortality Rate" },
  { value: "recoveryRate", label: "Recovery Rate" },
];

export function EnhancedTimeChart({
  data,
  isLoading = false,
  error = null,
}: EnhancedTimeChartProps) {
  const [timeFrame, setTimeFrame] = useState("quarterly");
  const [metric, setMetric] = useState("cases");
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all available diseases
  const allDiseases = useMemo(() => {
    if (!data?.points) return [];
    return Array.from(new Set(data.points.map((point) => point.name))).sort();
  }, [data]);

  // Filter diseases based on search
  const filteredDiseases = useMemo(() => {
    if (!searchQuery.trim()) return allDiseases;
    return allDiseases.filter((disease) =>
      disease.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allDiseases, searchQuery]);

  const processedData = useMemo(() => {
    if (!data?.points) return { labels: [], datasets: [] };

    // Group and process data based on timeFrame
    const timeLabels = Array.from(
      new Set(
        data.points.map((point) =>
          timeFrame === "yearly"
            ? point.year.toString()
            : `${point.year}-Q${point.quarter}`,
        ),
      ),
    ).sort();

    const uniqueDiseases = Array.from(
      new Set(data.points.map((point) => point.name)),
    ).sort();

    let datasetsToProcess = uniqueDiseases;

    // If user has selected specific diseases, use only those
    // Otherwise, calculate top 5 by total cases
    if (selectedDiseases.length > 0) {
      datasetsToProcess = uniqueDiseases.filter((d) =>
        selectedDiseases.includes(d),
      );
    } else {
      // Calculate total cases for each disease
      const diseaseTotals = uniqueDiseases.map((disease) => {
        const totalCases = data.points
          .filter((point) => point.name === disease)
          .reduce((sum, point) => sum + point.cases, 0);
        return { disease, totalCases };
      });

      // Sort by total cases and take top 5
      datasetsToProcess = diseaseTotals
        .sort((a, b) => b.totalCases - a.totalCases)
        .slice(0, 5)
        .map((d) => d.disease);
    }

    // Process only the selected or top diseases
    const datasets = datasetsToProcess.map((disease) => {
      const values = timeLabels.map((label) => {
        const points = data.points.filter((point) => {
          const pointLabel =
            timeFrame === "yearly"
              ? point.year.toString()
              : `${point.year}-Q${point.quarter}`;
          return pointLabel === label && point.name === disease;
        });

        // Calculate the value based on selected metric
        return points.reduce((sum, point) => {
          switch (metric) {
            case "incidenceRate":
              return sum + (point.incidenceRate || 0);
            case "mortalityRate":
              return sum + (point.mortalityRate || 0);
            case "recoveryRate":
              return sum + (point.recoveryRate || 0);
            default:
              return sum + point.cases;
          }
        }, 0);
      });

      return {
        label: disease,
        data: values,
      };
    });

    return {
      labels: timeLabels,
      datasets: datasets,
    };
  }, [data, timeFrame, metric, selectedDiseases]);

  // Toggle disease selection
  const toggleDisease = (disease: string) => {
    setSelectedDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease],
    );
  };

  // Reset to default view (top 5)
  const resetToDefaultView = () => {
    setSelectedDiseases([]);
  };

  // Reset search when closing popover
  const handlePopoverChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchQuery("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Disease Trends Over Time</CardTitle>
            <CardDescription>
              Analyze how disease patterns change over time
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {selectedDiseases.length > 0 && (
              <Button variant="outline" size="sm" onClick={resetToDefaultView}>
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
              <PopoverContent>
                <input
                  type="text"
                  placeholder="Search diseases"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="mt-2 max-h-60 overflow-y-auto">
                  {filteredDiseases.map((disease) => (
                    <div
                      key={disease}
                      className={cn(
                        "flex items-center p-2 cursor-pointer",
                        selectedDiseases.includes(disease) && "bg-gray-200",
                      )}
                      onClick={() => toggleDisease(disease)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedDiseases.includes(disease)
                            ? "visible"
                            : "invisible",
                        )}
                      />
                      {disease}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-2">
          <ToggleGroup
            type="single"
            value={timeFrame}
            onValueChange={setTimeFrame}
          >
            {timeFrameOptions.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={option.label}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <ToggleGroup type="single" value={metric} onValueChange={setMetric}>
            {metricOptions.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={option.label}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap gap-1">
          {selectedDiseases.map((disease) => (
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
          labels={processedData.labels}
          datasets={processedData.datasets}
          height={400}
          isLoading={isLoading}
          error={error}
          yAxisLabel={metricOptions.find((m) => m.value === metric)?.label}
          xAxisLabel="Time Period"
        />

        {selectedDiseases.length === 0 &&
          !isLoading &&
          processedData.datasets.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Showing top 5 diseases by case count. Use the filter to view
              specific diseases.
            </p>
          )}
      </CardContent>
    </Card>
  );
}
