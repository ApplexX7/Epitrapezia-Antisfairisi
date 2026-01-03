"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { useEffect, useState } from "react"
import api from "@/lib/axios"

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

const chartConfig = {
  comp: {
    label: "comp",
    color: "#442199",
  },
} satisfies ChartConfig

interface RadarGraphProps {
  playerId: number;
}

export function ChartRadarDefault({ playerId }: RadarGraphProps) {
  const [chartData, setChartData] = useState([
    { ksp: "Rating", comp: 0 },
    { ksp: "Games", comp: 0 },
    { ksp: "Wins", comp: 0 },
    { ksp: "Consistency", comp: 0 },
    { ksp: "Win Rate", comp: 0 },
  ])
  const [loading, setLoading] = useState(true)
  const [globalStats, setGlobalStats] = useState<any>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get(`/stats/metrics/${playerId}`)
        const { playerMetrics, globalStats } = response.data

        setChartData([
          { ksp: "Rating", comp: playerMetrics.rating },
          { ksp: "Games", comp: playerMetrics.gamesPlayed },
          { ksp: "Wins", comp: playerMetrics.wins },
          { ksp: "Consistency", comp: playerMetrics.consistency },
          { ksp: "Win Rate", comp: playerMetrics.winRate },
        ])
        
        setGlobalStats(globalStats)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch player metrics:", err)
        setLoading(false)
      }
    }

    if (playerId) {
      fetchMetrics()
    }
  }, [playerId])

  if (loading) {
    return (
      <Card className="bg-transparent text-black w-full h-full flex justify-center flex-col border-none shadow-none">
        <p className="-mb-10 pl-10 text-2xl font-medium text-shadow-lg">Match Metrics</p>
        <CardContent className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500">Loading metrics...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-transparent text-black w-full h-full flex justify-center flex-col border-none shadow-none overflow-hidden">
      <p className="-mb-8 pl-10 text-2xl font-medium text-shadow-lg">Match Metrics</p>
      <CardContent className="w-full h-full flex flex-col overflow-y-auto">
        <div className="flex-1 flex justify-center">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-96 w-full"
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
        </div>
        <div className="mt-4 px-4 pb-4 text-center space-y-2 flex-shrink-0">
          <p className="text-[18px] font-medium">Stats Ranking</p>
          {globalStats && (
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                You're in the top <span className="font-semibold text-black">{(100 - globalStats.playerPercentile).toFixed(1)}%</span> of players
              </p>
              <p className="text-xs whitespace-normal">
                Win Rate: <span className="font-semibold">{chartData[4]?.comp.toFixed(1)}%</span> 
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
