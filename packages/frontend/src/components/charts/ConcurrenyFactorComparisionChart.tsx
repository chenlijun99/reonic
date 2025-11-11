import { useMemo } from 'react';

import { Echarts } from '@/components/charts/Echarts';
import type { SimulationResult } from '@reonic/simulator-core/types';
import { computeStatistics } from '@reonic/simulator-core/utils';
import type { Simulation } from '@/store/simulationSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConcurrencyFactorComparisonChartProps {
  simulationsData: [Simulation, SimulationResult['perTickData']][];
}

export const ConcurrencyFactorComparisonChart = ({
  simulationsData,
}: ConcurrencyFactorComparisonChartProps) => {
  const chartOption = useMemo(() => {
    const data = simulationsData.map((data) => {
      const statistics = computeStatistics(data[0].config, data[1]);
      return {
        name: data[0].config.name,
        value: statistics.concurrencyFactor * 100,
      };
    });

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: data.map((d) => d.name),
        bottom: 0,
        type: 'scroll',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        axisLabel: {
          interval: 0,
          rotate: 30,
        },
        axisLine: {},
      },
      yAxis: {
        type: 'value',
        name: 'Concurrency Factor (%)',
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => ({
            value: d.value,
          })),
          barWidth: '60%',
        },
      ],
    };
  }, [simulationsData]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Concurrency Factor Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparing {simulationsData.length} selected simulation
            {simulationsData.length !== 1 ? 's' : ''}
          </p>
        </CardHeader>
        <CardContent>
          <Echarts option={chartOption} style={{ height: '500px' }} />
        </CardContent>
      </Card>
    </div>
  );
};
