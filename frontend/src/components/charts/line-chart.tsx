"use client";

import React, { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  useChartColors,
  commonOptions,
  generateAlphaColors,
  createGradient,
} from "@/lib/chart-utils";
import { ChartSkeleton } from "@/components/common/loading-states";
import { EmptyState } from "@/components/common/error-states";

// Register the chart.js components we need
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export interface LineChartDataset {
  label: string;
  data: number[];
  borderWidth?: number;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  fill?: boolean;
}

export interface LineChartProps {
  title?: string;
  labels: string[];
  datasets: LineChartDataset[];
  height?: number;
  showLegend?: boolean;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  yAxisLabel?: string;
  xAxisLabel?: string;
  useGradient?: boolean;
}

export function LineChart({
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
  useGradient = true,
}: LineChartProps) {
  const chartRef = useRef(null);
  const colors = useChartColors();
  const backgroundColors = generateAlphaColors(colors, 0.1);

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
        action={
          onRetry && (
            <button
              className="mt-2 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              onClick={onRetry}
            >
              Try Again
            </button>
          )
        }
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

  const data = {
    labels,
    datasets: datasets.map((dataset, index) => {
      const colorIndex = index % colors.length;

      return {
        ...dataset,
        borderColor: colors[colorIndex],
        backgroundColor: useGradient
          ? function (context: any) {
              const chart = context.chart;
              const { ctx, chartArea } = chart;

              if (!chartArea) {
                // This can happen when the chart is not yet rendered
                return backgroundColors[colorIndex];
              }

              return createGradient(
                ctx,
                chartArea.bottom,
                backgroundColors[colorIndex],
                "rgba(0,0,0,0)",
              );
            }
          : backgroundColors[colorIndex],
        borderWidth: dataset.borderWidth || 2,
        tension: dataset.tension || 0.3,
        pointRadius: dataset.pointRadius || 2,
        pointHoverRadius: dataset.pointHoverRadius || 5,
        fill: dataset.fill ?? useGradient,
      };
    }),
  };

  return (
    <div style={{ height: `${height}px`, position: "relative" }}>
      <Line
        ref={chartRef}
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: !!title,
              text: title || "",
              font: {
                size: 16,
                weight: "bold", // Using string literal directly
                family: "var(--font-geist-sans)",
              },
            },
            legend: {
              display: showLegend,
              position: "top" as const,
              align: "start" as const,
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                pointStyle: "circle" as const,
                font: {
                  size: 12,
                  weight: "normal", // Using string literal directly
                  family: "var(--font-geist-sans)",
                },
              },
            },
            tooltip: {
              ...commonOptions.plugins.tooltip,
              titleFont: {
                ...commonOptions.plugins.tooltip.titleFont,
                weight: "bold",
              },
              bodyFont: {
                ...commonOptions.plugins.tooltip.bodyFont,
                weight: "normal",
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: !!yAxisLabel,
                text: yAxisLabel || "",
              },
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
            },
            x: {
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
            mode: "index" as const,
            intersect: false,
          },
        }}
      />
    </div>
  );
}
