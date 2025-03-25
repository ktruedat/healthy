"use client";

import React from "react";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { 
  useChartColors, 
  commonOptions, 
  generateAlphaColors 
} from "@/lib/chart-utils";
import { ChartSkeleton } from "@/components/common/loading-states";
import { EmptyState } from "@/components/common/error-states";

// Register the chart.js components we need
ChartJS.register(ArcElement, Tooltip, Legend);

export interface PieChartProps {
  title?: string;
  labels: string[];
  data: number[];
  height?: number;
  showLegend?: boolean;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  doughnut?: boolean;
  cutout?: string;
}

export function PieChart({
  title,
  labels,
  data,
  height = 300,
  showLegend = true,
  isLoading = false,
  error = null,
  onRetry,
  doughnut = false,
  cutout,
}: PieChartProps) {
  const colors = useChartColors();
  const backgroundColors = generateAlphaColors(colors, 0.7);
  const borderColors = [...colors];

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
  if (!data.length || !labels.length) {
    return (
      <EmptyState 
        title="No data available" 
        description="There is no data available to display on this chart."
      />
    );
  }

  // Configure chart data
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors.slice(0, data.length),
        borderColor: borderColors.slice(0, data.length),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <Pie 
        data={chartData} 
        options={{
          responsive: true,
          maintainAspectRatio: false,
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
              position: 'right' as const,
              align: 'center' as const,
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
          cutout: doughnut ? (cutout || '50%') : 0,
        }}
      />
    </div>
  );
}

export function DoughnutChart(props: Omit<PieChartProps, "doughnut">) {
  return <PieChart {...props} doughnut={true} />;
}
