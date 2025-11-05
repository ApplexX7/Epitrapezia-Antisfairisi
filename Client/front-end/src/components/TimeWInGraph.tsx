"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis ,YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A simple area chart"

const chartData = [
  { month: "January", desktop: 500 },
  { month: "February", desktop: 800 },
  { month: "March", desktop: 1800 },
  { month: "April", desktop: 600 },
  { month: "May", desktop: 1850 },
  { month: "July", desktop: 1600 },
  { month: "August", desktop: 500 },
  { month: "September", desktop: 1200 },
  { month: "Octobre", desktop: 1300 },
  { month: "November", desktop: 700 },
  { month: "December", desktop: 200 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "7979FF",
  },
} satisfies ChartConfig

export function ChartAreaDefault() {
    return (
      <Card className="bg-transparent text-black w-full h-full flex justify-center flex-col border-none shadow-none">
        <CardContent className="w-full h-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <AreaChart
              className="w-full h-full"
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={true}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
                stroke="#0D0C22"
              />
                <YAxis
                    stroke="#0D0C22"
                    tickLine={false}
                    axisLine={true}
                    tickMargin={6}
                    tickCount={10}
                />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
            <defs>
                    <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0D0C22" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0D0C22" stopOpacity={0.3} />
                    </linearGradient>
                    </defs>

                    <Area
                    dataKey="desktop"
                    type="natural"
                    fill="url(#fillDesktop)"
                    stroke="#0D0C22"
                    strokeWidth={2}
                />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }
  