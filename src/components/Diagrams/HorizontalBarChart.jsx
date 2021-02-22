import React from 'react';
import ChartistGraph from "react-chartist";
import { Spinner } from "react-bootstrap";
import create_labels_and_series from "./diagram_common"

let options = {
  axisX: {
    offset: 30,
    position: 'end',
    labelOffset: {
      x: 0,
      y: 0
    },
    showLabel: true,
    showGrid: true,
    //labelInterpolationFnc: Chartist.noop,
    scaleMinSpace: 30,
    onlyInteger: false
  },
  axisY: {
    offset: 40,
    position: 'start',
    labelOffset: {
      x: 0,
      y: 0
    },
    showLabel: true,
    showGrid: true,
    //labelInterpolationFnc: Chartist.noop,
    scaleMinSpace: 20,
    onlyInteger: false
  },
  width: undefined,
  height: undefined,
  high: undefined,
  low: undefined,
  referenceValue: 0,
  chartPadding: {
    top: 15,
    right: 15,
    bottom: 5,
    left: 10
  },
  seriesBarDistance: 15,
  stackBars: false,
  stackMode: 'accumulate',
  horizontalBars: false,
  distributeSeries: false,
  reverseData: false,
  showGridBackground: false,
  classNames: {
    chart: 'ct-chart-bar',
    horizontalBars: 'ct-horizontal-bars',
    label: 'ct-label',
    labelGroup: 'ct-labels',
    series: 'ct-series',
    bar: 'ct-bar',
    grid: 'ct-grid',
    gridGroup: 'ct-grids',
    gridBackground: 'ct-grid-background',
    vertical: 'ct-vertical',
    horizontal: 'ct-horizontal',
    start: 'ct-start',
    end: 'ct-end'
  }
};




function HorizontalBarChart({data, onlyInteger, offset}) {
  if (!data || data === undefined || data.length === 0) return <Spinner animation="border" variant="primary" size="mg"/>;

  const chartData = create_labels_and_series(data);
  console.log("chartData", chartData);
  options.horizontalBars = true;
  options.distributeSeries = true;
  options.axisX.onlyInteger = onlyInteger;
  options.axisY.offset = offset;
  options.axisY.scaleMinSpace = 100;
  options.axisX.scaleMinSpace = 100;
  return <ChartistGraph
    options={options}
    data={chartData}
    type="Bar"/>;
}

export default HorizontalBarChart;

