"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"

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

export const description = "A bar chart"

const chartData = [
  { day: "Monday", hours: 6 },
  { day: "Tuesday", hours: 10 },
  { day: "Wednesday", hours: 2 },
  { day: "Thursday", hours: 0 },
  { day: "Friday", hours: 6 },
  { day: "Saturday", hours: 1 },
  { day: "Sunday", hours: 14 },
]

const chartConfig = {
  hours: {
    label: "hours",
    color: "#212271",
  },
} satisfies ChartConfig

export function ChartBarDefault() {
  return (
    <Card className="bg-transparent text-black w-full h-[400px] border-none shadow-none">
      <CardHeader>
        <CardTitle className=" flex gap-2 leading-none text-shadow-xs ml-3 font-semibold 
        text-2xl justify-center" >Weekly Attendance</CardTitle>
      </CardHeader>
      <CardContent className="h-full w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false}/>
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={{ stroke: "#D1DAE9", strokeWidth: 1 }}
                tickFormatter={(value) => value.slice(0, 3)}
                stroke="#0D0C22"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="hours" fill="var(--color-hours)" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
