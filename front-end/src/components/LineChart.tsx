"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"


import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A line chart"

const chartData = [
  { day: "Monday", Level: 186 },
  { day: "Tuesday", Level: 305 },
  { day: "Wednesday", Level: 237 },
  { day: "Thursday", Level: 73 },
  { day: "Friday", Level: 209 },
  { day: "Saturday", Level: 214 },
  { day: "Sunday", Level: 214 },
]

const chartConfig = {
  Level: {
    label: "Level",
    color: "0D0C22",
  },
} satisfies ChartConfig

export function ChartLineDefault() {
  return (
    <Card className="bg-transparent text-black w-full border-none shadow-none">
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none text-shadow-xs ml-3 font-semibold 
        self-start text-2xl">
          Week Progress <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
      <CardContent>
        <ChartContainer config={chartConfig}>
        <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 15, right:10 }} 
            >
                <CartesianGrid vertical={false} horizontal={false} />
                <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={{ stroke: "#0D0C22", strokeWidth: 2 }} // thick X axis
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    stroke="#0D0C22"
                    interval={0}
                />
                <ReferenceLine
                    x="Monday"
                    stroke="#0D0C22"
                    strokeWidth={2}
                    label={{ value: "Status", position: "top", fill: "#0D0C22",fontWeight: "bolder" }}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Line
                    dataKey="Level"
                    type="natural"
                    stroke="#0D0C22"
                    strokeWidth={2}
                    dot={false}
                />
        </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
