"use client";

import React from "react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { 
  useChartColors, 
  commonOptions, 
  generateAlphaColors 
} from "@/lib/chart-utils";
import { ChartSkeleton } from "@/components/common/loading-states";
import { EmptyState } from "@/components/common/error-states";

// Register the chart.js components we need
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
);

export interface BarChartDataset {
  label: string;
  data: number[];
  borderWidth?: number;
  borderRadius?: number;
}

export interface BarChartProps {
  title?: string;
  labels: string[];
  datasets: BarChartDataset[];
  height?: number;
  showLegend?: boolean;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  yAxisLabel?: string;
  xAxisLabel?: string;
  horizontal?: boolean;
  stacked?: boolean;
}

export function BarChart({
  title,
  labels,
  datasets,
  height = 300,
  showLegend = true,
  isLoading = false,
  error = null,
  onRetry,
  yAxisLabel,
  xAxisLabel,
  horizontal = false,
  stacked = false,
}: BarChartProps) {
  const colors = useChartColors();
  const backgroundColors = generateAlphaColors(colors, 0.7);

  // Return loading state if data is loading
  if (isLoading) {
    return <ChartSkeleton height={height} />;
  }

  // Return error state if there's an error
  if (error) {
    return (
      <EmptyState 
        title="Unable to load chart data" 
        description={error.message}
        action={onRetry && (
          <button
            className="mt-2 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      />
    );
  }

  // Return empty state if no data
  if (!datasets.length || !labels.length) {
    return (
      <EmptyState 
        title="No data available" 
        description="There is no data available to display on this chart."
      />
    );
  }

  // Set up the data structure for the chart
  const data = {
    labels,
    datasets: datasets.map((dataset, index) => {
      const colorIndex = index % colors.length;
      
      return {
        ...dataset,
        backgroundColor: backgroundColors[colorIndex],
        borderColor: colors[colorIndex],
        borderWidth: dataset.borderWidth || 1,
        borderRadius: dataset.borderRadius || 4,
      };
    }),
  };

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <Bar 
        data={data} 
        options={{
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: horizontal ? 'y' as const : 'x' as const,
          plugins: {
            title: {
              display: !!title,
              text: title || "",
              font: {
                size: 16,
                weight: 'bold',
                family: 'var(--font-geist-sans)',
              },
            },
            legend: {
              display: showLegend,
              position: 'top' as const,
              align: 'start' as const,
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                pointStyle: 'circle' as const,
                font: {
                  size: 12,
                  weight: 'normal',
                  family: 'var(--font-geist-sans)',
                },
              },
            },
            tooltip: {
              ...commonOptions.plugins.tooltip,
              titleFont: {
                ...commonOptions.plugins.tooltip.titleFont,
                weight: 'bold',
              },
              bodyFont: {
                ...commonOptions.plugins.tooltip.bodyFont,
                weight: 'normal',
              }
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              stacked: stacked,
              title: {
                display: !!yAxisLabel,
                text: yAxisLabel || "",
              },
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
            },
            x: {
              stacked: stacked,
              title: {
                display: !!xAxisLabel,
                text: xAxisLabel || "",
              },
              grid: {
                display: false,
              },
            },
          },
          interaction: {
            mode: 'index' as const,
            intersect: false,
          },
        }}
      />
    </div>
  );
}
