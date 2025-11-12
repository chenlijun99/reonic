// import the core library.
import ReactEChartsCore from 'echarts-for-react/lib/core';
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
// Import charts, all with Chart suffix
import {
  LineChart,
  BarChart,
  // PieChart,
  // ScatterChart,
  // RadarChart,
  // MapChart,
  // TreeChart,
  // TreemapChart,
  // GraphChart,
  // GaugeChart,
  // FunnelChart,
  // ParallelChart,
  // SankeyChart,
  // BoxplotChart,
  // CandlestickChart,
  // EffectScatterChart,
  // LinesChart,
  // HeatmapChart,
  // PictorialBarChart,
  // ThemeRiverChart,
  // SunburstChart,
  // CustomChart,
} from 'echarts/charts';

// import components, all suffixed with Component
import {
  // GridSimpleComponent,
  GridComponent,
  // PolarComponent,
  // RadarComponent,
  // GeoComponent,
  // SingleAxisComponent,
  // ParallelComponent,
  CalendarComponent,
  // GraphicComponent,
  // ToolboxComponent,
  TooltipComponent,
  AxisPointerComponent,
  // BrushComponent,
  TitleComponent,
  // TimelineComponent,
  // MarkPointComponent,
  // MarkLineComponent,
  // MarkAreaComponent,
  LegendComponent,
  LegendScrollComponent,
  LegendPlainComponent,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  // VisualMapComponent,
  // VisualMapContinuousComponent,
  // VisualMapPiecewiseComponent,
  AriaComponent,
  // TransformComponent,
} from 'echarts/components';

// Import renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
import {
  CanvasRenderer,
  // SVGRenderer,
} from 'echarts/renderers';
import type { registerTheme } from 'echarts';
import type { EChartsReactProps } from 'echarts-for-react';

import { useTheme } from '@/contexts/ThemeContext';

// Register the required components
echarts.use([
  LineChart,
  BarChart,

  AxisPointerComponent,
  CalendarComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  LegendComponent,
  LegendScrollComponent,
  LegendPlainComponent,
  AriaComponent,

  CanvasRenderer,
]);

type EchartsTheme = Parameters<typeof registerTheme>[1];

const lightTheme: EchartsTheme = {
  backgroundColor: 'transparent',
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    textStyle: {
      color: '#111827',
    },
  },
  legend: {
    textStyle: {
      color: '#6b7280',
    },
  },
  xAxis: {
    axisLine: {
      lineStyle: {
        color: '#e5e7eb',
      },
    },
    axisLabel: {
      color: '#6b7280',
    },
  },
  yAxis: {
    nameTextStyle: {
      color: '#6b7280',
    },
    axisLine: {
      lineStyle: {
        color: '#e5e7eb',
      },
    },
    axisLabel: {
      color: '#6b7280',
    },
    splitLine: {
      lineStyle: {
        color: '#e5e7eb',
        type: 'dashed',
      },
    },
  },
};

const darkTheme: EchartsTheme = {
  backgroundColor: 'transparent',
  tooltip: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    textStyle: {
      color: '#f3f4f6',
    },
  },
  legend: {
    textStyle: {
      color: '#9ca3af',
    },
  },
  xAxis: {
    axisLine: {
      lineStyle: {
        color: '#374151',
      },
    },
    axisLabel: {
      color: '#9ca3af',
    },
  },
  yAxis: {
    nameTextStyle: {
      color: '#9ca3af',
    },
    axisLine: {
      lineStyle: {
        color: '#374151',
      },
    },
    axisLabel: {
      color: '#9ca3af',
    },
    splitLine: {
      lineStyle: {
        color: '#374151',
        type: 'dashed',
      },
    },
  },
};

echarts.registerTheme('light', lightTheme);
echarts.registerTheme('dark', darkTheme);

export type EchartsProps = Omit<EChartsReactProps, 'theme'>;

export const Echarts = (props: EchartsProps) => {
  const theme = useTheme();
  return <ReactEChartsCore echarts={echarts} theme={theme.theme} {...props} />;
};
