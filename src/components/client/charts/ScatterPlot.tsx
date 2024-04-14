'use client'

import { Card, CardDescription, CardHeader } from '@/components/ui/card'
// import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { chartTheme, getChartColors } from '@/lib/chartTheme'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'
import { scaleLinear } from 'd3'

const formatYAxis = (n: number) => {
  if (typeof n === 'number') {
    if (n % 1 === 0) {
      // only display integer values
      return n
    }
  }

  return ''
}

export const ScatterPlot = ({
  data = [],
  ariaLabel = 'Scatter Plot',
  keys = ['value'],
  indexBy = 'label',
  tickValues = undefined,
}: {
  data: {
    label: string
    x: number
    y: number
    [key: string]: unknown
  }[]
  ariaLabel?: string
  keys?: string[]
  indexBy?: string
  tickValues?: number[]
}) => {
  const total = data.reduce(
    (acc: number, item) => (typeof item.x === 'number' ? acc + item.x : acc),
    0
  )

  const maxValueY = Math.max(...data.map((item) => item.y))
  const minValueY = Math.min(...data.map((item) => item.y))
  const maxValueX = Math.max(...data.map((item) => item.x))
  const minValueX = Math.min(...data.map((item) => item.x))

  let leftMargin = 20
  if (maxValueY > 9999 || minValueX > 9999) {
    leftMargin += 30
  } else if (maxValueY > 999 || minValueX > 999) {
    leftMargin += 20
  } else if (maxValueY > 99 || minValueX > 99) {
    leftMargin += 15
  } else if (maxValueY > 9 || minValueX > 9) {
    leftMargin += 5
  }

  let rightMargin = 20
  if (maxValueX > 9999) {
    rightMargin += 30
  } else if (maxValueX > 999) {
    rightMargin += 20
  } else if (maxValueX > 99) {
    rightMargin += 15
  } else if (maxValueX > 9) {
    rightMargin += 5
  }

  const hideLeftAxis = maxValueY === minValueY
  const hideBottomAxis = false // maxValueX === minValueX

  const xScale = scaleLinear([minValueX, maxValueX], [minValueX, maxValueX])
  let tickAmount = Math.max(5, Math.min(10, data.length))
  const xTicks = xScale.ticks(tickAmount)

  return (
    <ResponsiveScatterPlot
      data={[
        {
          id: 'data',
          data: data,
        },
      ]}
      // keys={keys}
      // indexBy={indexBy}
      margin={{ top: 5, right: rightMargin, bottom: 30, left: leftMargin }}
      // padding={0.3}
      // valueScale={{ type: 'linear' }}
      // indexScale={{ type: 'band', round: true }}
      yScale={{ type: 'linear', min: minValueY, max: maxValueY }}
      xScale={{ type: 'linear', min: minValueX, max: maxValueX }}
      animate={false}
      colors={getChartColors(1)}
      theme={chartTheme}
      gridXValues={xTicks.length}
      axisBottom={
        hideBottomAxis
          ? null
          : {
              // tickSize: 5,
              // tickPadding: 5,
              // tickRotation: 0,
              legend: '',
              // legendPosition: 'middle',
              // legendOffset: 32,
              tickValues: xTicks,
              // truncateTickAt: 0,
              // renderTick: (props) => {
              //   const { value, x, y } = props
              //   return (
              //     <g transform={`translate(${x},${y})`}>
              //       <text
              //         x={0}
              //         y={0}
              //         dy={16}
              //         textAnchor="middle"
              //         fill="#fff"
              //         fontSize={14}
              //       >
              //         {value} €
              //       </text>
              //     </g>
              //   )
              // },
            }
      }
      axisLeft={
        hideLeftAxis
          ? null
          : {
              format: formatYAxis,
              // tickSize: 5,
              // tickPadding: 5,
              // tickRotation: 0,
              // legend: '',
              // legendPosition: 'middle',
              // legendOffset: -40,
              // truncateTickAt: 10,
              // tickValues: 3,
              // tickValues: maxValue < 8 ? maxValue : undefined,
            }
      }
      tooltip={({ node: { data } }) => (
        <Card>
          <CardHeader className="p-4">
            <CardDescription className="p-0 m-0">
              <strong>{data.label}</strong>
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      role="application"
      ariaLabel={ariaLabel}
      nodeSize={{
        key: 'data.z',
        values: [0, 100],
        sizes: [10, 100],
      }}
    />
  )
}
