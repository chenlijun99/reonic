import { useMemo, useState } from 'react';

import ReactECharts from 'echarts-for-react';
import type { SeriesOption } from 'echarts';

import type {
  SimulationConfig,
  SimulationResult,
} from '@reonic/simulator-core/types';
import { Select, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  aggregateTickData,
  getChargepointCount,
} from '@reonic/simulator-core/utils';

interface PowerChartProps {
  startDate: Date;
  simulationConfig: SimulationConfig;
  simulationData: SimulationResult['perTickData'];
  darkMode: boolean;
}

type PlotGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly';

export const PowerChart = ({
  startDate,
  simulationConfig,
  simulationData,
  darkMode,
}: PowerChartProps) => {
  const [plotGranularity, setPlotGranularity] =
    useState<PlotGranularity>('hourly');

  const aggregatedData = aggregateTickData(
    simulationConfig,
    simulationData,
    startDate,
    plotGranularity,
    (tickWindow) => {
      // Aggregate by returning the average power demand of each chargepoint
      const sum = tickWindow.reduce((acc, tickData) => {
        tickData.powerDemandsPerChargepointKw.forEach((power, i) => {
          acc[i] += power;
        });
        return acc;
      }, new Array(tickWindow[0].powerDemandsPerChargepointKw.length).fill(0));
      return sum.map((value) => value / tickWindow.length);
    },
  );

  const chartOption = useMemo(() => {
    const seriesData: SeriesOption[] = [
      {
        name: 'Total Power',
        type: 'line',
        data: aggregatedData.map((data) => [
          +data.date,
          data.data.reduce((acc, data) => {
            return acc + data;
          }, 0),
        ]),
        lineStyle: { width: 5 },
        areaStyle: { opacity: 0.2 },
        smooth: true,
      },
    ];

    for (let i = 0, len = getChargepointCount(simulationConfig); i < len; ++i) {
      seriesData.push({
        name: `cp-${i}`,
        type: 'line',
        data: aggregatedData.map((data) => [data.date, data.data[i]]),
        lineStyle: { width: 1 },
        smooth: true,
      });
    }

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        textStyle: {
          color: darkMode ? '#f3f4f6' : '#111827',
        },
      },
      legend: {
        data: seriesData.map((s) => s.name),
        textStyle: {
          color: darkMode ? '#9ca3af' : '#6b7280',
        },
        type: 'scroll',
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: darkMode ? '#374151' : '#e5e7eb',
          },
        },
        axisLabel: {
          color: darkMode ? '#9ca3af' : '#6b7280',
        },
      },
      yAxis: {
        type: 'value',
        name: 'Power (kW)',
        nameTextStyle: {
          color: darkMode ? '#9ca3af' : '#6b7280',
        },
        axisLine: {
          lineStyle: {
            color: darkMode ? '#374151' : '#e5e7eb',
          },
        },
        axisLabel: {
          color: darkMode ? '#9ca3af' : '#6b7280',
        },
        splitLine: {
          lineStyle: {
            color: darkMode ? '#374151' : '#e5e7eb',
            type: 'dashed',
          },
        },
      },
      series: seriesData,
    };
  }, [aggregatedData, simulationConfig.simulationGranularityMs, darkMode]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Power Demand Over Time (Total & Individual Chargepoints)
          </CardTitle>
          <Select
            value={plotGranularity}
            onChange={(key) => setPlotGranularity(key as PlotGranularity)}
            className="w-40"
          >
            <SelectItem value="hourly" id="hourly" textValue="Hourly">
              Hourly
            </SelectItem>
            <SelectItem value="daily" id="daily" textValue="Daily">
              Daily
            </SelectItem>
            <SelectItem value="weekly" id="weekly" textValue="Weekly">
              Weekly
            </SelectItem>
            <SelectItem value="monthly" id="monthly" textValue="Monthly">
              Monthly
            </SelectItem>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ReactECharts
          option={chartOption}
          style={{ height: '500px' }}
          theme={/* theme */ 'default'}
        />
      </CardContent>
    </Card>
  );
};
