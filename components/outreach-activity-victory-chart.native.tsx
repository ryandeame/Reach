import { useFont } from '@shopify/react-native-skia';
import { Bar, CartesianChart } from 'victory-native';

import type { RecentOutreachActivityPoint } from '@/hooks/use-recent-outreach-activity';

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
  data,
  formatYLabel,
  gridColor,
  labelColor,
  secondaryAccentColor,
  secondaryData,
  secondaryFormatYLabel,
}: OutreachActivityVictoryChartProps) {
  const chartData = data.map((item, index) => ({
    day: index + 1,
    label: item.shortLabel,
    secondaryValue: secondaryData?.[index]?.value ?? 0,
    value: item.value,
  }));
  const hasSecondarySeries = Boolean(secondaryData?.length && secondaryAccentColor);
  const peak = Math.max(1, ...chartData.map((item) => item.value));
  const secondaryPeak = Math.max(1, ...chartData.map((item) => item.secondaryValue));
  const axisFont = useFont(require('../assets/fonts/Roboto-Regular.ttf'), 11);
  const yMax = Math.max(5, peak + 1);
  const secondaryYMax = Math.max(5, secondaryPeak + 1);
  const groupedBarWidth = 8;
  const groupedBarOffset = 4.5;

  return (
    <CartesianChart
      data={chartData}
      xKey="day"
      yKeys={hasSecondarySeries ? ['value', 'secondaryValue'] : ['value']}
      domain={{ x: [0.5, chartData.length + 0.5], y: hasSecondarySeries ? undefined : [0, yMax] }}
      domainPadding={{ left: 18, right: 18, top: 16 }}
      xAxis={{
        font: axisFont,
        formatXLabel: (value) => chartData.find((item) => item.day === value)?.label ?? '',
        labelColor,
        labelOffset: 4,
        lineColor: 'transparent',
        tickCount: chartData.length,
        tickValues: chartData.map((item) => item.day),
      }}
      yAxis={[
        {
          axisSide: 'left',
          domain: [0, yMax],
          font: axisFont,
          formatYLabel: (value) => formatYLabel?.(value) ?? `${value}`,
          labelColor,
          labelOffset: 6,
          lineColor: gridColor,
          lineWidth: 1,
          tickCount: 4,
          yKeys: ['value'],
        },
        ...(hasSecondarySeries
          ? [
              {
                axisSide: 'right' as const,
                domain: [0, secondaryYMax] as [number, number],
                font: axisFont,
                formatYLabel: (value: number) => secondaryFormatYLabel?.(value) ?? `${value}`,
                labelColor,
                labelOffset: 6,
                lineColor: 'transparent',
                lineWidth: 1,
                tickCount: 4,
                yKeys: ['secondaryValue' as const],
              },
            ]
          : []),
      ]}
      frame={{
        lineColor: 'transparent',
      }}
      padding={{ bottom: 22, left: 34, right: hasSecondarySeries ? 34 : 8, top: 12 }}>
      {({ points, chartBounds }) =>
        hasSecondarySeries ? (
          <>
            <Bar
              animate={{ type: 'timing', duration: 650 }}
              barWidth={groupedBarWidth}
              chartBounds={chartBounds}
              color={accentColor}
              points={points.value.map((point) => ({
                ...point,
                x: point.x - groupedBarOffset,
              }))}
              roundedCorners={{
                topLeft: 10,
                topRight: 10,
              }}
            />
            <Bar
              animate={{ type: 'timing', duration: 650 }}
              barWidth={groupedBarWidth}
              chartBounds={chartBounds}
              color={secondaryAccentColor}
              points={points.secondaryValue.map((point) => ({
                ...point,
                x: point.x + groupedBarOffset,
              }))}
              roundedCorners={{
                topLeft: 10,
                topRight: 10,
              }}
            />
          </>
        ) : (
          <Bar
            animate={{ type: 'timing', duration: 650 }}
            barCount={chartData.length}
            chartBounds={chartBounds}
            color={accentColor}
            innerPadding={0.36}
            points={points.value}
            roundedCorners={{
              topLeft: 10,
              topRight: 10,
            }}
          />
        )
      }
    </CartesianChart>
  );
}
