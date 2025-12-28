"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import React from "react";
import api from '@/lib/axios';

import {
  Card,
  CardContent,
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

const chartConfig = {
  hours: {
    label: "hours",
    color: "#212271",
  },
} satisfies ChartConfig

export function ChartBarDefault() {
  const [data, setData] = React.useState([
    { day: "Monday", hours: 0 },
    { day: "Tuesday", hours: 0 },
    { day: "Wednesday", hours: 0 },
    { day: "Thursday", hours: 0 },
    { day: "Friday", hours: 0 },
    { day: "Saturday", hours: 0 },
    { day: "Sunday", hours: 0 },
  ]);

  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await api.get('/attendance/weekly');
        const weekDays = response.data.weekDays;
        
        // Transform data for the chart
        const transformedData = weekDays.map((day: any) => ({
          day: day.day,
          hours: Math.round(day.hours * 10) / 10,
        }));
        
        setData(transformedData);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, []);
  const maxHours = Math.max(...data.map(d => d.hours));
  const yAxisDomain = maxHours <= 60 ? [0, 60] : [0, 420];
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Card className="bg-transparent text-black  w-full h-[400px] border-none shadow-none">
          <CardHeader>
            <CardTitle className=" flex gap-2 leading-none text-shadow-xs ml-3 font-semibold 
            text-2xl justify-center" >Weekly Attendance</CardTitle>
          </CardHeader>
          <CardContent className="h-full w-full ">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart accessibilityLayer data={data}>
                  <CartesianGrid vertical={false}/>
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={{ stroke: "#D1DAE9", strokeWidth: 1 }}
                    tickFormatter={(value) => value.slice(0, 3)}
                    stroke="#0D0C22"
                    />
                  <YAxis
                    domain={yAxisDomain}
                    tickLine={false}
                    axisLine={false}
                    tick={true}
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
    </div>
  )
}