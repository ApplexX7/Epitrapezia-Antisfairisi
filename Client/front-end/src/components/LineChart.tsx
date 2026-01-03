"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { useSocketStore } from "./hooks/SocketIOproviders"

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

const chartConfig = {
  xp: {
    label: "XP",
    color: "0D0C22",
  },
} satisfies ChartConfig

export function ChartLineDefault() {
  const [chartData, setChartData] = useState([
    { day: "Monday", xp: 0 },
    { day: "Tuesday", xp: 0 },
    { day: "Wednesday", xp: 0 },
    { day: "Thursday", xp: 0 },
    { day: "Friday", xp: 0 },
    { day: "Saturday", xp: 0 },
    { day: "Sunday", xp: 0 },
  ])
  const [loading, setLoading] = useState(true)
  const socket = useSocketStore((state: any) => state.socket)

  const fetchWeeklyXp = async () => {
    try {
      const response = await api.get('/attendance/weekly-xp')
      const weekData = response.data.weekData
      
      const transformedData = weekData.map((day: any) => ({
        day: day.day,
        xp: day.xp,
      }))
      
      setChartData(transformedData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching weekly XP:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeeklyXp()
  }, [])

  // Listen for XP updates via socket
  useEffect(() => {
    if (!socket) return

    const handleXpUpdate = () => {
      fetchWeeklyXp()
    }

    const handleGameEnd = () => {
      // Refetch XP history when a game ends
      fetchWeeklyXp()
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
      <Card className="bg-transparent text-black w-full border-none shadow-none">
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none text-shadow-xs ml-3 font-semibold 
          self-start text-2xl">
            Week Progress <TrendingUp className="h-4 w-4" />
          </div>
        </CardFooter>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-transparent text-black w-full border-none shadow-none">
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none text-shadow-xs ml-3 font-semibold 
        self-start text-2xl">
          XP Progress <TrendingUp className="h-4 w-4" />
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
                <YAxis
                    stroke="#0D0C22"
                    tickLine={false}
                    axisLine={true}
                    tickMargin={6}
                    domain={[0, "dataMax + 2"]}
                    type="number"
                />
                <ReferenceLine
                    x="Monday"
                    stroke="#0D0C22"
                    strokeWidth={2}
                    label={{ value: "Week", position: "top", fill: "#0D0C22",fontWeight: "bolder" }}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Line
                    dataKey="xp"
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
