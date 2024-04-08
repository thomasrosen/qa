'use client'

import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { chartTheme, getChartColors } from '@/lib/chartTheme'
import { BarDatum, ResponsiveBar } from '@nivo/bar'

const formatYAxis = (n: number) => {
  if (typeof n === 'number') {
    if (n % 1 === 0) {
      // only display integer values
      return n
    }
  }

  return ''
}

export const BarChart = ({
  data = [],
  ariaLabel = 'Bar Chart',
  keys = ['value'],
  indexBy = 'label',
  tickValues = [],
}: {
  data: {
    label: string
    value: number
    [key: string]: unknown
  }[]
  ariaLabel?: string
  keys?: string[]
  indexBy?: string
  tickValues?: number[]
}) => {
  const total = data.reduce(
    (acc: number, item) =>
      typeof item.value === 'number' ? acc + item.value : acc,
    0
  )

  const maxValue = data.reduce(
    (acc: number, item) =>
      typeof item.value === 'number'
        ? item.value > acc
          ? item.value
          : acc
        : acc,
    0
  )

  let leftMargin = 20
  if (maxValue > 9999) {
    leftMargin += 30
  } else if (maxValue > 999) {
    leftMargin += 20
  } else if (maxValue > 99) {
    leftMargin += 15
  } else if (maxValue > 9) {
    leftMargin += 5
  }

  return (
    <ResponsiveBar
      data={data as BarDatum[]}
      keys={keys}
      indexBy={indexBy}
      margin={{ top: 5, right: 0, bottom: 30, left: leftMargin }}
      padding={0.3}
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      animate={false}
      colors={getChartColors(tickValues.length)}
      theme={chartTheme}
      colorBy="indexValue"
      gridYValues={[0, ...new Set(tickValues)]}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        // legend: '',
        legendPosition: 'middle',
        legendOffset: 32,
        // truncateTickAt: 0,
      }}
      axisLeft={{
        format: formatYAxis,
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        // legend: '',
        legendPosition: 'middle',
        legendOffset: -40,
        // truncateTickAt: undefined,
        // tickValues: maxValue < 8 ? maxValue : undefined,
      }}
      labelSkipWidth={12}
      // labelSkipHeight={12}
      labelSkipHeight={9999} // Hide labels
      // labelTextColor={{
      //   from: 'color',
      //   modifiers: [['darker', 3]],
      // }}
      borderRadius={12}
      tooltip={({ value, indexValue, data, ...props }) => (
        <Card>
          <CardHeader className="p-4">
            <CardDescription>
              <strong>{data.label}</strong>: {data.value} (
              {Math.round((value / total) * 100)}%)
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      // legends={[
      //   {
      //     dataFrom: 'keys',
      //     anchor: 'bottom-right',
      //     direction: 'column',
      //     justify: false,
      //     translateX: 120,
      //     translateY: 0,
      //     itemsSpacing: 2,
      //     itemWidth: 100,
      //     itemHeight: 20,
      //     itemDirection: 'left-to-right',
      //     itemOpacity: 0.85,
      //     symbolSize: 20,
      //     // effects: [
      //     //   {
      //     //     on: 'hover',
      //     //     style: {
      //     //       itemOpacity: 1,
      //     //     },
      //     //   },
      //     // ],
      //   },
      // ]}
      role="application"
      ariaLabel={ariaLabel}
      // barAriaLabel={(e) => e.id + ': ' + e.formattedValue + ', ' + e.indexValue}
    />
  )
}
