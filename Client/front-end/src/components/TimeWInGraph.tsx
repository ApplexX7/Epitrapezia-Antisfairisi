"use client"

import { Area, AreaChart, CartesianGrid, XAxis ,YAxis, ReferenceLine } from "recharts"
import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { useSocketStore } from "./hooks/SocketIOproviders"

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  xp: {
    label: "XP",
    color: "7979FF",
  },
} satisfies ChartConfig

interface XpGraphProps {
  playerId: number;
}

export function ChartAreaDefault({ playerId }: XpGraphProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const socket = useSocketStore((state: any) => state.socket)

  const fetchXpHistory = async () => {
    try {
      const response = await api.get(`/stats/xp-history/${playerId}`)
      const { xpHistory, currentExperience } = response.data

      // Format data for chart
      const formattedData = xpHistory.map((entry: any) => ({
        week: entry.week,
        xp: entry.xp || 0,
        weekGain: entry.weekGain || 0,
        isCurrentMonth: entry.isCurrentMonth || false
      }))

      // Find current month
      const currentMonthEntry = formattedData.find((entry: any) => entry.isCurrentMonth)
      if (currentMonthEntry) {
        setCurrentMonth(currentMonthEntry.week)
      }

      setChartData(formattedData)
      setLoading(false)
    } catch (err) {
      console.error("Failed to fetch XP history:", err)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (playerId) {
      fetchXpHistory()
    }
  }, [playerId])

  // Listen for XP updates via socket
  useEffect(() => {
    if (!socket) return

    const handleXpUpdate = () => {
      fetchXpHistory()
    }

    const handleGameEnd = () => {
      // Refetch XP history when a game ends
      fetchXpHistory()
    }

    // Listen for XP gain events
    socket.on("xp:gained", handleXpUpdate)
    socket.on("game:ended", handleGameEnd)
    socket.on("xp:updated", handleXpUpdate)

    return () => {
      socket.off("xp:gained", handleXpUpdate)
      socket.off("game:ended", handleGameEnd)
      socket.off("xp:updated", handleXpUpdate)
    }
  }, [socket])

  if (loading) {
    return (
      <Card className="bg-transparent text-black w-full h-full flex justify-center flex-col border-none shadow-none">
        <CardContent className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500">Loading XP progress...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-transparent text-black w-full h-full flex justify-center flex-col border-none shadow-none">
      <p className="pl-10 text-2xl font-medium text-shadow-lg mb-2">XP Journey</p>
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
              dataKey="week"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
              stroke="#0D0C22"
            />
              <YAxis
                  stroke="#0D0C22"
                  tickLine={false}
                  axisLine={true}
                  tickMargin={6}
                  domain={[0, "dataMax + 10"]}
                  type="number"
              />
            {currentMonth && (
              <ReferenceLine
                x={currentMonth}
                stroke="#FF6B6B"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ value: "Now", position: "top", fill: "#FF6B6B", fontWeight: "bold" }}
              />
            )}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
          <defs>
                  <linearGradient id="fillXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7979FF" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#7979FF" stopOpacity={0.3} />
                  </linearGradient>
                  </defs>

                  <Area
                  dataKey="xp"
                  type="natural"
                  fill="url(#fillXp)"
                  stroke="#7979FF"
                  strokeWidth={2}
              />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
  