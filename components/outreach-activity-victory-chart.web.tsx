import type { RecentOutreachActivityPoint } from '@/hooks/use-recent-outreach-activity';

/* eslint-disable @typescript-eslint/no-require-imports */
if (typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis as Window & typeof globalThis;
}

const {
  VictoryAxis,
  VictoryBar,
} = require('victory/dist/victory.js');
/* eslint-enable @typescript-eslint/no-require-imports */

const Y_AXIS_STEP = 5;

function roundUpToStep(value: number, step: number) {
  return Math.max(step, Math.ceil(value / step) * step);
}

type OutreachActivityVictoryChartProps = {
  accentColor: string;
  ariaLabel?: string;
  data: RecentOutreachActivityPoint[];
  formatYLabel?: (value: number) => string;
  gradientId?: string;
  gridColor: string;
  labelColor: string;
  secondaryAccentColor?: string;
  secondaryData?: RecentOutreachActivityPoint[];
  secondaryFormatYLabel?: (value: number) => string;
};

export function OutreachActivityVictoryChart({
  accentColor,
  ariaLabel = 'Recent outreach activity bar chart',
  data,
  formatYLabel,
  gradientId = 'recentOutreachBars',
  gridColor,
  labelColor,
  secondaryAccentColor,
  secondaryData,
  secondaryFormatYLabel,
}: OutreachActivityVictoryChartProps) {
  const chartData = data.map((item, index) => ({
    day: index + 1,
    dayLabel: item.shortLabel,
    value: item.value,
  }));
  const secondaryChartData = secondaryData?.map((item, index) => ({
    day: index + 1,
    dayLabel: item.shortLabel,
    value: item.value,
  }));
  const hasSecondarySeries = Boolean(secondaryChartData?.length && secondaryAccentColor);
  const peak = Math.max(1, ...chartData.map((item) => item.value));
  const secondaryPeak = Math.max(1, ...(secondaryChartData ?? []).map((item) => item.value));
  const primaryYMax = roundUpToStep(peak, Y_AXIS_STEP);
  const secondaryYMax = roundUpToStep(secondaryPeak, Y_AXIS_STEP);
  const yAxisIntervalCount = hasSecondarySeries
    ? Math.max(1, secondaryYMax / Y_AXIS_STEP)
    : Math.max(1, primaryYMax / Y_AXIS_STEP);
  const primaryYTickValues = Array.from({ length: yAxisIntervalCount + 1 }, (_, index) =>
    (primaryYMax / yAxisIntervalCount) * index,
  );
  const secondaryYTickValues = Array.from({ length: yAxisIntervalCount + 1 }, (_, index) =>
    (secondaryYMax / yAxisIntervalCount) * index,
  );
  const height = 240;
  const padding = { bottom: 36, left: 42, right: hasSecondarySeries ? 42 : 18, top: 18 };
  const width = 360;
  const domain = {
    x: [0.5, Math.max(1, chartData.length) + 0.5],
    y: [0, primaryYMax],
  };
  const secondaryDomain = {
    ...domain,
    y: [0, secondaryYMax],
  };
  const tickValues = chartData.map((item) => item.day);
  const tickLabels = new Map(chartData.map((item) => [item.day, item.dayLabel]));
  const primaryBarData = hasSecondarySeries
    ? chartData.map((item) => ({ ...item, day: item.day - 0.18 }))
    : chartData;
  const secondaryBarData = (secondaryChartData ?? []).map((item) => ({
    ...item,
    day: item.day + 0.18,
  }));
  const secondaryGradientId = `${gradientId}Secondary`;

  return (
    <svg
      aria-label={ariaLabel}
      height="100%"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      width="100%">
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor={accentColor} stopOpacity={1} />
          <stop offset="100%" stopColor={accentColor} stopOpacity={0.42} />
        </linearGradient>
        {hasSecondarySeries ? (
          <linearGradient id={secondaryGradientId} x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={secondaryAccentColor} stopOpacity={1} />
            <stop offset="100%" stopColor={secondaryAccentColor} stopOpacity={0.42} />
          </linearGradient>
        ) : null}
      </defs>
      <VictoryAxis
        dependentAxis
        domain={domain}
        height={height}
        padding={padding}
        standalone={false}
        tickValues={primaryYTickValues}
        width={width}
        style={{
          axis: { stroke: 'transparent' },
          grid: { stroke: gridColor, strokeDasharray: '6,8' },
          tickLabels: {
            fill: labelColor,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 10,
            fontWeight: 700,
          },
        }}
        tickFormat={(tick: number) => formatYLabel?.(tick) ?? `${tick}`}
      />
      {hasSecondarySeries ? (
        <VictoryAxis
          dependentAxis
          domain={secondaryDomain}
          height={height}
          orientation="right"
          padding={padding}
          standalone={false}
          tickValues={secondaryYTickValues}
          width={width}
          style={{
            axis: { stroke: 'transparent' },
            grid: { stroke: 'transparent' },
            tickLabels: {
              fill: labelColor,
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 10,
              fontWeight: 700,
            },
          }}
          tickFormat={(tick: number) => secondaryFormatYLabel?.(tick) ?? `${tick}`}
        />
      ) : null}
      <VictoryAxis
        domain={domain}
        height={height}
        padding={padding}
        standalone={false}
        style={{
          axis: { stroke: 'transparent' },
          ticks: { stroke: 'transparent' },
          tickLabels: {
            fill: labelColor,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 10,
            fontWeight: 700,
          },
        }}
        tickFormat={(tick: number) => tickLabels.get(tick) ?? ''}
        tickValues={tickValues}
        width={width}
      />
      <VictoryBar
        alignment="middle"
        animate={{
          duration: 650,
          onLoad: { duration: 650 },
        }}
        barRatio={0.72}
        barWidth={hasSecondarySeries ? 8 : undefined}
        cornerRadius={{ topLeft: 8, topRight: 8 }}
        data={primaryBarData}
        domain={domain}
        height={height}
        padding={padding}
        standalone={false}
        style={{
          data: {
            fill: `url(#${gradientId})`,
            filter: 'drop-shadow(0px 8px 10px rgba(15, 118, 110, 0.18))',
          },
        }}
        width={width}
        x="day"
        y="value"
      />
      {hasSecondarySeries ? (
        <VictoryBar
          alignment="middle"
          animate={{
            duration: 650,
            onLoad: { duration: 650 },
          }}
          barWidth={8}
          cornerRadius={{ topLeft: 8, topRight: 8 }}
          data={secondaryBarData}
          domain={secondaryDomain}
          height={height}
          padding={padding}
          standalone={false}
          style={{
            data: {
              fill: `url(#${secondaryGradientId})`,
              filter: 'drop-shadow(0px 8px 10px rgba(15, 118, 110, 0.12))',
            },
          }}
          width={width}
          x="day"
          y="value"
        />
      ) : null}
    </svg>
  );
}
