import { useMemo, useState } from 'react';

import type { SeriesOption } from 'echarts';

import { Echarts } from '@/components/charts/Echarts';
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
}

type PlotGranularity = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const ChargingEventsChart = ({
  startDate,
  simulationConfig,
  simulationData,
}: ChargingEventsChartProps) => {
  const [plotGranularity, setPlotGranularity] =
    useState<PlotGranularity>('daily');

  const aggregatedData = useMemo(() => {
    return aggregateChargingEvents(
      simulationConfig,
      simulationData,
      startDate,
      plotGranularity,
      (chargingEvents) => {
        return chargingEvents.length;
      },
    );
  }, [startDate, simulationConfig, simulationData, plotGranularity]);

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
      },
      legend: {
        data: seriesData.map((s) => s.name),
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
      },
      yAxis: {
        type: 'value',
        name: 'Power (kW)',
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series: seriesData,
    };
  }, [aggregatedData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Charging Events
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
        <Echarts option={chartOption} style={{ height: '500px' }} />
      </CardContent>
    </Card>
  );
};
