
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart3, TrendingUp } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Data for the first chart (Claim Adjudication Overview)
const adjudicationChartData = [
  { month: "Jan", autoAdjudicated: 300, manualReview: 150, total: 450 },
  { month: "Feb", autoAdjudicated: 350, manualReview: 120, total: 470 },
  { month: "Mar", autoAdjudicated: 400, manualReview: 100, total: 500 },
  { month: "Apr", autoAdjudicated: 380, manualReview: 110, total: 490 },
  { month: "May", autoAdjudicated: 420, manualReview: 90, total: 510 },
  { month: "Jun", autoAdjudicated: 450, manualReview: 80, total: 530 },
];

const adjudicationChartConfig = {
  autoAdjudicated: { label: "Auto-Adjudicated", color: "hsl(var(--chart-1))" },
  manualReview: { label: "Manual Review", color: "hsl(var(--chart-2))" },
};

// Sample data for TAT Trend chart (relative to June 1, 2025)
const tatChartData = [
  { month: "Jan 2025", avgTatDays: 5.2 },
  { month: "Feb 2025", avgTatDays: 4.8 },
  { month: "Mar 2025", avgTatDays: 5.5 },
  { month: "Apr 2025", avgTatDays: 4.5 },
  { month: "May 2025", avgTatDays: 4.2 },
];

const tatChartConfig = {
  avgTatDays: { label: "Avg TAT (Days)", color: "hsl(var(--chart-3))" },
};


export function DashboardCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Claim Adjudication Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
           <ChartContainer config={adjudicationChartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={adjudicationChartData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="autoAdjudicated" fill="var(--color-autoAdjudicated)" radius={4} />
                <Bar dataKey="manualReview" fill="var(--color-manualReview)" radius={4} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Turnaround Time (TAT) Trend
            </CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={tatChartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tatChartData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} tickMargin={8} 
                  tickFormatter={(value) => `${value}d`}
                />
                <Tooltip
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Legend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="avgTatDays" stroke="var(--color-avgTatDays)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-avgTatDays)" }} activeDot={{ r: 6 }} name="Avg TAT (Days)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
