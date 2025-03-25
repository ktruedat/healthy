"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { DiseaseTrends } from "@/types/api-types";

// Register required chart.js components
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface CorrelationExplorerProps {
  data: DiseaseTrends | undefined;
  isLoading?: boolean;
  error?: Error | null;
}

interface ScatterDataset {
  datasets: {
    label: string;
    data: { x: number; y: number; label: string }[];
    backgroundColor: string;
    pointRadius: number;
    pointHoverRadius: number;
  }[];
  correlation?: number;
}

type MetricKey = keyof DiseaseTrends["points"][0];
type ValidMetricKey = Exclude<MetricKey, "year" | "quarter" | "name">;

// Available metrics for correlation analysis
const metrics: Array<{ value: ValidMetricKey; label: string }> = [
  { value: "cases", label: "Cases" },
  { value: "incidenceRate", label: "Incidence Rate" },
  { value: "mortalityRate", label: "Mortality Rate" },
  { value: "recoveryRate", label: "Recovery Rate" },
];

export function CorrelationExplorer({
  data,
  isLoading = false,
  error = null,
}: CorrelationExplorerProps) {
  const [xAxis, setXAxis] = useState<ValidMetricKey>("cases");
  const [yAxis, setYAxis] = useState<ValidMetricKey>("mortalityRate");

  const scatterData = useMemo(() => {
    const defaultData = {
      datasets: [
        {
          label: `${getMetricLabel(xAxis)} vs ${getMetricLabel(yAxis)}`,
          data: [],
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
      correlation: 0,
    };

    if (!data?.points?.length) {
      return defaultData;
    }

    try {
      // Extract data points for the selected metrics
      const points = data.points
        .filter(
          (point) =>
            typeof point[xAxis] === "number" &&
            typeof point[yAxis] === "number",
        )
        .map((point) => ({
          x: point[xAxis] as number,
          y: point[yAxis] as number,
          label: point.name,
        }));

      if (points.length === 0) {
        return defaultData;
      }

      // Calculate correlation
      const correlation = calculateCorrelation(
        points.map((p) => p.x),
        points.map((p) => p.y),
      );

      return {
        datasets: [
          {
            ...defaultData.datasets[0],
            data: points,
          },
        ],
        correlation,
      };
    } catch (err) {
      console.error("Error processing correlation data:", err);
      return defaultData;
    }
  }, [data, xAxis, yAxis]);

  // Helper to get metric label
  const getMetricLabel = (value: string) => {
    return metrics.find((m) => m.value === value)?.label || value;
  };

  // Calculate correlation coefficient
  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
    );

    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Get correlation strength description
  const getCorrelationDescription = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return "Strong";
    if (abs >= 0.5) return "Moderate";
    if (abs >= 0.3) return "Weak";
    return "Very weak";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle>Correlation Explorer</CardTitle>
        <div className="flex gap-2">
          <div>
            <label className="text-sm">X Axis</label>
            <Select
              value={xAxis}
              onValueChange={(value: ValidMetricKey) => setXAxis(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((metric) => (
                  <SelectItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm">Y Axis</label>
            <Select
              value={yAxis}
              onValueChange={(value: ValidMetricKey) => setYAxis(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((metric) => (
                  <SelectItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Scatter
            data={{
              datasets: scatterData.datasets,
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: getMetricLabel(xAxis),
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: getMetricLabel(yAxis),
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const point =
                        scatterData.datasets[0].data[context.dataIndex];
                      return `${point.label}: (${point.x}, ${point.y})`;
                    },
                  },
                },
              },
            }}
          />
        </div>
        <div className="mt-4 p-3 bg-muted/40 rounded-md">
          <h4 className="font-medium">Correlation Analysis</h4>
          <p className="text-sm mt-1">
            Correlation coefficient:{" "}
            <strong>{(scatterData.correlation || 0).toFixed(2)}</strong> (
            {getCorrelationDescription(scatterData.correlation || 0)}{" "}
            {(scatterData.correlation || 0) >= 0 ? "positive" : "negative"}{" "}
            correlation)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
