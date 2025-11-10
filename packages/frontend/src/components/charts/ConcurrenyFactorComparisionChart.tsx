import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

import type { SimulationResult } from '@reonic/simulator-core/types';
import { computeStatistics } from '@reonic/simulator-core/utils';
import type { Simulation } from '@/store/simulationSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConcurrencyFactorComparisonChartProps {
  simulationsData: [Simulation, SimulationResult['perTickData']][];
  darkMode: boolean;
}

export const ConcurrencyFactorComparisonChart = ({
  simulationsData,
  darkMode,
}: ConcurrencyFactorComparisonChartProps) => {
  const chartOption = useMemo(() => {
    const data = simulationsData.map((data) => {
      const statistics = computeStatistics(data[0].config, data[1]);
      return {
        name: data[0].config.name,
        value: statistics.concurrencyFactor * 100,
      };
    });

    const colors = [
      'hsl(195, 85%, 45%)',
      'hsl(180, 75%, 50%)',
      'hsl(142, 76%, 36%)',
      'hsl(38, 92%, 50%)',
      'hsl(0, 72%, 51%)',
    ];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        textStyle: {
          color: darkMode ? '#f3f4f6' : '#111827',
        },
      },
      legend: {
        data: data.map((d) => d.name),
        textStyle: {
          color: darkMode ? '#9ca3af' : '#6b7280',
        },
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
          color: darkMode ? '#9ca3af' : '#6b7280',
          interval: 0,
          rotate: 30,
        },
        axisLine: {
          lineStyle: {
            color: darkMode ? '#374151' : '#e5e7eb',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Concurrency Factor (%)',
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
          formatter: '{value}%',
        },
        splitLine: {
          lineStyle: {
            color: darkMode ? '#374151' : '#e5e7eb',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d, i) => ({
            value: d.value,
            itemStyle: {
              color: colors[i % colors.length],
            },
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
          <ReactECharts option={chartOption} style={{ height: '500px' }} />
        </CardContent>
      </Card>
    </div>
  );
};
