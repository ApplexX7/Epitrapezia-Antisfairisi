"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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

export const description = "A radar chart"

const chartData = [
  { ksp: "Rating", comp: 186 },
  { ksp: "FG", comp: 305 },
  { ksp: "Win", comp: 237 },
  { ksp: "kd", comp: 273 },
  { ksp: "Lose", comp: 209 },
]

const chartConfig = {
  comp: {
    label: "comp",
    color: "#442199",
  },
} satisfies ChartConfig

export function ChartRadarDefault() {
  return (
    <Card className="bg-transparent text-black w-full h-full flex justify-center flex-col border-none shadow-none">
    <p className="-mb-10 pl-10 text-2xl font-medium text-shadow-lg">Match Metrics</p>
      <CardContent className="w-full h-full">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-full"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="ksp"
                stroke="#000000"
            />
            <PolarGrid stroke="#000000"
            />
            <Radar
              dataKey="comp"
              fill="var(--color-comp)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
        <p className="-mt-10 text-center text-[22px] pb-2 font-medium">Stats</p>
      </CardContent>
    </Card>
  )
}
