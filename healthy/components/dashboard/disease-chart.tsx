'use client';

import React, { useState, useMemo } from "react";
import { useDashboardTrends } from "@/hooks/use-dashboard-data";
import { LineChart, BarChart, PieChart } from "@/components/charts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BarChart2, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Check, 
  ChevronsUpDown, 
  RotateCcw, 
  Calendar,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DiseaseTrends } from "@/lib/types/api-types";

// Define metric options
const metricOptions = [
  { value: "cases", label: "Cases" },
  { value: "incidenceRate", label: "Incidence Rate" },
  { value: "mortalityRate", label: "Mortality Rate" },
  { value: "recoveryRate", label: "Recovery Rate" },
];

// Define chart type options
const chartTypes = [
  { value: "line", label: "Line", icon: <LineChartIcon className="h-4 w-4" /> },
  { value: "bar", label: "Bar", icon: <BarChart2 className="h-4 w-4" /> },
  { value: "pie", label: "Pie", icon: <PieChartIcon className="h-4 w-4" /> },
];

// Define time frame options
const timeFrameOptions = [
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "monthly", label: "Monthly" },
];

export function DiseaseChart({
  simplified = false,
  height = 400,
}: {
  simplified?: boolean;
  height?: number;
}) {
  // State for chart configuration
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [timeFrame, setTimeFrame] = useState("quarterly");
  const [metric, setMetric] = useState("cases");
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [showPopover, setShowPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showDownloadPopover, setShowDownloadPopover] = useState(false);

  // Fetch disease trends data
  const { data: trendsData, isLoading, error } = useDashboardTrends();

  // Get all available diseases
  const allDiseases = useMemo(() => {
    if (!trendsData?.data?.points) return [];
    return Array.from(
      new Set(trendsData.data.points.map((point) => point.name))
    ).sort();
  }, [trendsData]);

  // Filter diseases based on search
  const filteredDiseases = useMemo(() => {
    if (!searchQuery.trim()) return allDiseases;
    return allDiseases.filter((disease) =>
      disease.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allDiseases, searchQuery]);

  // Process data based on selected options
  const processedData = useMemo(() => {
    if (!trendsData?.data?.points) return { labels: [], datasets: [] };

    // Filter data for selected year if in simplified mode
    let filteredPoints = trendsData.data.points;
    if (simplified && selectedYear) {
      filteredPoints = trendsData.data.points.filter(
        (point) => point.year === selectedYear
      );
    }

    // Group and process data based on timeFrame
    const timeLabels = Array.from(
      new Set(
        filteredPoints.map((point) =>
          timeFrame === "yearly"
            ? point.year.toString()
            : `${point.year}-Q${point.quarter}`
        )
      )
    ).sort();

    const uniqueDiseases = Array.from(
      new Set(filteredPoints.map((point) => point.name))
    ).sort();

    let datasetsToProcess = uniqueDiseases;

    // If user has selected specific diseases, use only those
    // Otherwise, calculate top 5 by total cases
    if (selectedDiseases.length > 0) {
      datasetsToProcess = uniqueDiseases.filter((d) =>
        selectedDiseases.includes(d)
      );
    } else {
      // Calculate total cases for each disease
      const diseaseTotals = uniqueDiseases.map((disease) => {
        const totalCases = filteredPoints
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

    // Process for line and bar charts
    const datasets = datasetsToProcess.map((disease) => {
      const values = timeLabels.map((label) => {
        const points = filteredPoints.filter((point) => {
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

    // For pie chart, aggregate data differently
    const pieData = datasetsToProcess.map((disease) => {
      const totalValue = filteredPoints
        .filter((point) => point.name === disease)
        .reduce((sum, point) => {
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

      return {
        name: disease,
        value: totalValue,
      };
    });

    return {
      labels: timeLabels,
      datasets: datasets,
      pieData: pieData,
    };
  }, [trendsData, timeFrame, metric, selectedDiseases, simplified, selectedYear]);

  // Toggle disease selection
  const toggleDisease = (disease: string) => {
    setSelectedDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  // Reset to default view (top 5)
  const resetToDefaultView = () => {
    setSelectedDiseases([]);
  };

  // Handle year selection for simplified view
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
  };

  // Get available years from data
  const availableYears = useMemo(() => {
    if (!trendsData?.data?.points) return [];
    
    return Array.from(
      new Set(trendsData.data.points.map((point) => point.year))
    ).sort((a, b) => b - a); // Sort descending
  }, [trendsData]);

  // Years as calendar format for date picker
  const yearsAsCalendarFormat = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return availableYears.map(year => {
      const date = new Date(year, 0, 1);
      return date;
    });
  }, [availableYears]);

  // Generate current year label
  const yearLabel = useMemo(() => {
    if (!selectedYear) return 'Select Year';
    return selectedYear.toString();
  }, [selectedYear]);

  // Handle chart download
  const handleDownload = () => {
    // Find the chart SVG
    const chartSvg = document.querySelector('.recharts-wrapper svg');
    if (!chartSvg) return;
    
    const svgData = new XMLSerializer().serializeToString(chartSvg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    const img = new Image();
    
    img.onload = () => {
      canvas.width = chartSvg.clientWidth || 800;
      canvas.height = chartSvg.clientHeight || 500;
      
      // Fill background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `disease-trends-${chartType}-chart.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const renderChart = () => {
    const yAxisLabel = metricOptions.find((m) => m.value === metric)?.label;
    
    if (chartType === 'line') {
      return (
        <LineChart
          labels={processedData.labels}
          datasets={processedData.datasets}
          height={height}
          isLoading={isLoading}
          error={error as Error | null}
          yAxisLabel={yAxisLabel}
          xAxisLabel="Time Period"
          fillArea={true}
          downloadable={false}
        />
      );
    } else if (chartType === 'bar') {
      return (
        <BarChart
          labels={processedData.labels}
          datasets={processedData.datasets}
          height={height}
          isLoading={isLoading}
          error={error as Error | null}
          yAxisLabel={yAxisLabel}
          xAxisLabel="Time Period"
          downloadable={false}
        />
      );
    } else {
      return (
        <PieChart
          data={processedData.pieData || []}
          height={height}
          isLoading={isLoading}
          error={error as Error | null}
          downloadable={false}
        />
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Disease Trends</CardTitle>
            <CardDescription>
              {simplified 
                ? `Top diseases in ${yearLabel}` 
                : "Analyze how disease patterns change over time"}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            {simplified ? (
              <>
                <Popover open={showYearPicker} onOpenChange={setShowYearPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Calendar className="h-4 w-4" /> 
                      {yearLabel}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-2 max-h-60 overflow-y-auto space-y-1">
                      {availableYears.map(year => (
                        <Button 
                          key={year} 
                          variant={year === selectedYear ? "default" : "ghost"} 
                          className="w-full justify-start"
                          onClick={() => handleYearSelect(year)}
                        >
                          {year}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download chart</span>
                </Button>
              </>
            ) : (
              <>
                {selectedDiseases.length > 0 && (
                  <Button variant="outline" size="sm" onClick={resetToDefaultView}>
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Reset
                  </Button>
                )}
                <Popover open={showPopover} onOpenChange={setShowPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={showPopover}
                      className="justify-between"
                      disabled={isLoading}
                    >
                      {selectedDiseases.length > 0
                        ? `${selectedDiseases.length} selected`
                        : "Top 5 diseases"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="end">
                    <div className="p-2">
                      <Input
                        type="text"
                        placeholder="Search diseases"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                      <div className="max-h-60 overflow-y-auto">
                        {filteredDiseases.map((disease) => (
                          <div
                            key={disease}
                            className={cn(
                              "flex items-center p-2 cursor-pointer rounded transition-colors",
                              selectedDiseases.includes(disease) 
                                ? "bg-muted" 
                                : "hover:bg-muted/50"
                            )}
                            onClick={() => toggleDisease(disease)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedDiseases.includes(disease)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="truncate">{disease}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download chart</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {!simplified && (
          <div className="flex flex-wrap gap-4 mt-2">
            {/* Time frame toggle */}
            <ToggleGroup
              type="single"
              value={timeFrame}
              onValueChange={(value) => value && setTimeFrame(value)}
              variant="outline"
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

            {/* Metric toggle */}
            <ToggleGroup
              type="single"
              value={metric}
              onValueChange={(value) => value && setMetric(value)}
              variant="outline"
            >
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
        )}

        {/* Chart type toggle */}
        <ToggleGroup
          type="single"
          value={chartType}
          onValueChange={(value) => value && setChartType(value as 'line' | 'bar' | 'pie')}
          variant="outline"
          className="mt-2"
        >
          {chartTypes.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              aria-label={option.label}
              className="gap-1"
            >
              {option.icon}
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        {/* Selected diseases badges */}
        {selectedDiseases.length > 0 && !simplified && (
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
        )}

        {/* Render the appropriate chart */}
        {renderChart()}

        {selectedDiseases.length === 0 &&
          !isLoading &&
          processedData.datasets.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Showing top 5 diseases by case count. 
              {!simplified && " Use the filter to view specific diseases."}
            </p>
          )}
      </CardContent>
    </Card>
  );
} 