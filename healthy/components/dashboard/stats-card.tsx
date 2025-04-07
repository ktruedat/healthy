'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  changePercentage?: number;
  direction?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  description?: string;
  isLoading?: boolean;
  formatter?: (value: number) => string;
  className?: string;
  colorScheme?: 'default' | 'red' | 'green' | 'blue' | 'amber';
  trendsReversed?: boolean;
}

export function StatsCard({
  title,
  value,
  previousValue,
  changePercentage,
  direction = "stable",
  icon,
  description,
  isLoading = false,
  formatter = (val) => val.toLocaleString(),
  className,
  colorScheme = 'default',
  trendsReversed = false,
}: StatsCardProps) {
  // Format the value if it's a number and a formatter is provided
  const formattedValue = typeof value === 'number' ? formatter(value) : value;
  
  // Determine the trend icon based on direction
  const TrendIcon = {
    up: ArrowUpIcon,
    down: ArrowDownIcon,
    stable: ArrowRightIcon
  }[direction];
  
  // Color schemes mapping
  const colorSchemes = {
    default: "bg-card hover:bg-card/80",
    red: "bg-red-50/30 border-red-200/40 hover:bg-red-50/50 hover:border-red-200/60",
    green: "bg-green-50/30 border-green-200/40 hover:bg-green-50/50 hover:border-green-200/60",
    blue: "bg-blue-50/30 border-blue-200/40 hover:bg-blue-50/50 hover:border-blue-200/60",
    amber: "bg-amber-50/30 border-amber-200/40 hover:bg-amber-50/50 hover:border-amber-200/60",
  };

  // Determine the trend color class based on direction and whether trends are reversed
  const getTrendColorClass = () => {
    if (direction === 'stable') return 'text-muted-foreground';
    
    if (trendsReversed) {
      // For metrics where increase is bad (e.g., deaths)
      return direction === 'up' ? 'text-rose-500' : 'text-emerald-500';
    } else {
      // For metrics where increase is good (e.g., recoveries)
      return direction === 'up' ? 'text-emerald-500' : 'text-rose-500';
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/20",
      colorSchemes[colorScheme],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-5 w-5 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-10 w-[120px] bg-muted rounded mb-2" />
            <div className="h-4 w-[100px] bg-muted rounded" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {formattedValue}
            </div>
            
            {(changePercentage !== undefined || direction !== 'stable') && (
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                {changePercentage !== undefined && (
                  <span className={cn(getTrendColorClass())}>
                    {direction === 'up' ? '+' : direction === 'down' ? '-' : ''}
                    {Math.abs(changePercentage).toFixed(1)}%
                  </span>
                )}
                
                {TrendIcon && (
                  <TrendIcon className={cn(
                    "h-4 w-4",
                    getTrendColorClass()
                  )} />
                )}
                
                {description && (
                  <span className="ml-1">{description}</span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 