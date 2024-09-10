 // @ts-nocheck


import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

const chartData = [
  { browser: "chrome", visitors: 275 },
  { browser: "safari", visitors: 200 },
  { browser: "firefox", visitors: 287 },
  { browser: "edge", visitors: 173 },
  { browser: "other", visitors: 190 },
];

export function DonutChart() {
  const totalVisitors = chartData.reduce((acc, curr) => acc + curr.visitors, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donut Chart</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer>
          <PieChart>
            <Pie data={chartData} dataKey="visitors" nameKey="browser" innerRadius={60}>
              <Label position="center">
                <tspan x="50%" textAnchor="middle">{totalVisitors}</tspan>
                <tspan x="50%" y="24" textAnchor="middle">Visitors</tspan>
              </Label>
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
