export const getChartColors = (amount: number) => {
  const colors: string[] = [];

  // generate color strings for hsl()
  // the middle color is hsl(36 100% 50%)
  // evenly generate darker and lighter colors to fit the amount
  // always go 5 percent darker or lighter subtract 4 degrees of the hue for darker and add 4 degrees for lighter colors.
  const start_hue = 36;
  const start_saturation = 100;
  const start_lightness = 50;

  for (let i = 1; i <= amount; i++) {
    const hue = start_hue + (i - Math.ceil(amount / 2)) * 4;
    const saturation = start_saturation;
    const lightness = start_lightness + (i - Math.ceil(amount / 2)) * 5;

    const color = `hsl(${hue} ${saturation}% ${lightness}%)`;
    colors.push(color);
  }

  // This basically generates these colors (here as hex):
  // #FFF1CC
  // #FFE099
  // #FFCC66
  // #FFB433
  // #FF9900
  // #E57A00
  // #CC5F00
  // #B24700
  // #993300
  // #802200
  // #661400
  // #4D0A00
  // #330300

  return colors;
};

export const chartTheme = {
  background: 'transparent',
  text: {
    fontSize: 14,
    fill: 'currentColor',
    outlineWidth: 4,
    outlineColor: 'currentColor',
  },
  axis: {
    domain: {
      line: {
        stroke: 'currentColor',
        strokeWidth: 0,
      },
    },
    legend: {
      text: {
        fontSize: 14,
        fill: 'currentColor',
        outlineWidth: 0,
        outlineColor: 'transparent',
      },
    },
    ticks: {
      line: {
        stroke: 'transparent',
        strokeWidth: 1,
        opacity: 0.2,
      },
      text: {
        fontSize: 14,
        fill: 'currentColor',
        outlineWidth: 0,
        outlineColor: 'transparent',
      },
    },
  },
  grid: {
    line: {
      stroke: 'currentColor',
      strokeWidth: 1,
      opacity: 0.2,
    },
  },
  legends: {
    title: {
      text: {
        fontSize: 14,
        fill: 'currentColor',
        outlineWidth: 0,
        outlineColor: 'transparent',
      },
    },
    text: {
      fontSize: 14,
      fill: 'currentColor',
      outlineWidth: 0,
      outlineColor: 'transparent',
    },
    ticks: {
      line: {},
      text: {
        fontSize: 14,
        fill: 'currentColor',
        outlineWidth: 0,
        outlineColor: 'transparent',
      },
    },
  },
  annotations: {
    text: {
      fontSize: 14,
      fill: 'currentColor',
      outlineWidth: 2,
      outlineColor: 'currentColor',
      outlineOpacity: 1,
    },
    link: {
      stroke: 'currentColor',
      strokeWidth: 1,
      outlineWidth: 2,
      outlineColor: 'currentColor',
      outlineOpacity: 1,
    },
    outline: {
      stroke: 'currentColor',
      strokeWidth: 2,
      outlineWidth: 2,
      outlineColor: 'currentColor',
      outlineOpacity: 1,
    },
    symbol: {
      fill: 'currentColor',
      outlineWidth: 2,
      outlineColor: 'currentColor',
      outlineOpacity: 1,
    },
  },
  // tooltip: {
  //   container: {
  //     background: 'hsl(266 87% 41%)',
  //     color: '#fff',
  //     fontSize: 14,
  //   },
  //   basic: {},
  //   chip: {},
  //   table: {},
  //   tableCell: {},
  //   tableCellValue: {},
  // },
};
