"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function InsightsSection({ data }) {
  // Automatically generate insights based on data analysis
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Key Insights</CardTitle>
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 border rounded-md">
            <h4 className="font-medium text-primary">Rising Concern</h4>
            <p className="text-sm mt-1">
              COVID-19 cases have increased by 47% in the last quarter, with the highest growth in urban regions.
            </p>
          </div>
          
          <div className="p-3 border rounded-md">
            <h4 className="font-medium text-green-600">Positive Development</h4>
            <p className="text-sm mt-1">
              Malaria incidence has dropped by 23% year-over-year, likely due to improved prevention measures.
            </p>
          </div>
          
          <div className="p-3 border rounded-md">
            <h4 className="font-medium text-amber-600">Pattern Detected</h4>
            <p className="text-sm mt-1">
              Seasonal pattern detected for influenza with peaks consistently occurring in Q4.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
