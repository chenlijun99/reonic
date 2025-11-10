import { useMemo, useState } from 'react';

import ReactECharts from 'echarts-for-react';
import type { SeriesOption } from 'echarts';

import type {
  SimulationConfig,
  SimulationResult,
} from '@reonic/simulator-core/types';
import { Select, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aggregateChargingEvents } from '@reonic/simulator-core/utils';

interface ChargingEventsChartProps {
  startDate: Date;
  simulationConfig: SimulationConfig;
  simulationData: SimulationResult['chargingEvents'];
  darkMode: boolean;
}

type PlotGranularity = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const ChargingEventsChart = ({
  startDate,
  simulationConfig,
  simulationData,
  darkMode,
}: ChargingEventsChartProps) => {
  const [plotGranularity, setPlotGranularity] =
    useState<PlotGranularity>('daily');

  const aggregatedData = aggregateChargingEvents(
    simulationConfig,
    simulationData,
    startDate,
    plotGranularity,
    (chargingEvents) => {
      return chargingEvents.length;
    },
  );

  const chartOption = useMemo(() => {
    const seriesData: SeriesOption[] = [
      {
        name: 'Charging Events',
        type: 'bar',
        data: aggregatedData.map((data) => [+data.date, data.data]),
      },
    ];

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
            <SelectItem value="daily" id="daily" textValue="Daily">
              Daily
            </SelectItem>
            <SelectItem value="weekly" id="weekly" textValue="Weekly">
              Weekly
            </SelectItem>
            <SelectItem value="monthly" id="monthly" textValue="Monthly">
              Monthly
            </SelectItem>
            <SelectItem value="yearly" id="yearly" textValue="Yearly">
              Yearly
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
