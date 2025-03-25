"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cva } from "class-variance-authority";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";

const trendIconVariants = cva(
  "ml-1 inline-flex h-4 w-4 transition-transform",
  {
    variants: {
      direction: {
        up: "text-emerald-500",
        down: "text-rose-500",
        stable: "text-amber-500",
      },
    },
    defaultVariants: {
      direction: "stable",
    },
  }
);

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
  trendsReversed?: boolean; // Add this property to indicate if up trends should be shown as negative
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
    default: "from-card to-background",
    red: "from-red-50 to-red-100/30 border-red-200/40",
    green: "from-green-50 to-green-100/30 border-green-200/40",
    blue: "from-blue-50 to-blue-100/30 border-blue-200/40",
    amber: "from-amber-50 to-amber-100/30 border-amber-200/40",
  };

  // Determine the trend color class based on direction and whether trends are reversed
  const getTrendColorClass = () => {
    if (direction === 'stable') return '';
    
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
      "overflow-hidden bg-gradient-to-br backdrop-blur-sm", 
      colorSchemes[colorScheme],
      "hover:shadow-lg hover:border-opacity-50 transition-all duration-300",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-5 w-5 text-primary/70">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-10 w-[120px] mb-2" />
            <Skeleton className="h-4 w-[100px]" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {formattedValue}
            </div>
            
            {(changePercentage !== undefined || direction !== 'stable') && (
              <div className="text-xs text-muted-foreground">
                {changePercentage !== undefined && (
                  <span className={cn(getTrendColorClass())}>
                    {direction === 'up' ? '+' : direction === 'down' ? '-' : ''}
                    {Math.abs(changePercentage).toFixed(1)}%
                  </span>
                )}
                
                {TrendIcon && (
                  <TrendIcon className={cn(
                    "ml-1 inline-flex h-4 w-4 transition-transform",
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
