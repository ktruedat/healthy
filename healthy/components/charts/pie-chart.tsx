'use client';

import * as React from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: DataPoint[];
  height?: number;
  isLoading?: boolean;
  error?: Error | null;
  className?: string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  backgroundColor?: string;
  downloadable?: boolean;
}

const COLORS = [
  "hsl(221, 83%, 53%)",  // blue
  "hsl(142, 71%, 45%)",  // green
  "hsl(0, 84%, 60%)",    // red
  "hsl(32, 95%, 44%)",   // amber
  "hsl(262, 80%, 59%)",  // purple
  "hsl(190, 90%, 50%)",  // cyan
  "hsl(315, 80%, 60%)",  // pink
  "hsl(43, 96%, 58%)",   // yellow
];

export function PieChart({
  data,
  height = 300,
  isLoading = false,
  error = null,
  className,
  showLegend = true,
  innerRadius = 0,
  outerRadius = "70%",
  backgroundColor = "white",
  downloadable = true,
}: PieChartProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);

  // Handle download as PNG
  const handleDownload = () => {
    if (!chartRef.current) return;

    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    const img = new Image();
    
    img.onload = () => {
      canvas.width = svg.clientWidth;
      canvas.height = svg.clientHeight;
      
      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = 'disease-distribution-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-60 flex-col items-center justify-center text-muted-foreground">
        <p>Error loading chart data</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-60 items-center justify-center text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div ref={chartRef} className="relative">
        {downloadable && (
          <div className="absolute right-2 top-2 z-10">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download chart</span>
            </Button>
          </div>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--popover)',
                color: 'var(--popover-foreground)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                padding: '8px 12px',
                fontSize: '14px'
              }}
              itemStyle={{
                color: 'inherit',
                padding: '4px 0'
              }}
              labelStyle={{ 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: 'var(--popover-foreground)'
              }}
              formatter={(value, name) => [`${value}`, name]}
              wrapperStyle={{ 
                zIndex: 1000,
                outline: 'none'
              }}
            />
            {showLegend && (
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: '10px' }}
              />
            )}
            <Pie
              data={data}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 