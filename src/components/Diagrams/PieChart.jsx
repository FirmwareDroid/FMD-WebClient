import React from 'react';
import ChartistGraph from "react-chartist";
import Legend from "chartist-plugin-legend";
import { Spinner } from "react-bootstrap";
import create_labels_and_series from "./diagram_common"


/**
 * Creates a ChartistGraph pie chart.
 * @param data: the data to generate the chart from.
 * @param labelOffset: offset of the labels.
 * @param legendPosition: Position of the chart legend. Examples: 'top', 'bottom'
 * @returns {*}
 * @constructor
 */
function PieChart({data, labelOffset, legendPosition}) {
  if (!data || data.length === 0) return <Spinner animation="border" variant="primary" size="mg"/>;
  const pieData = create_labels_and_series(data);
  const plugins = [Legend({position: legendPosition})];
  const sum = function(a, b) { return a + b };
  const total = pieData.series.reduce(sum);

  return <ChartistGraph
            options={
            {
              chartPadding: 0,
              labelOffset: labelOffset,
              labelDirection: 'explode',
              plugins,
              labelInterpolationFnc: function(label) {
                const index = pieData.labels.indexOf(label);
                //console.log("pieData.series", pieData.series, "labels", pieData.labels, "total", total, "index", index);
                //return Math.round(pieData.series[index].value / total * 100) + '%';
                return (pieData.series[index].value / total * 100).toFixed(2) + '%';
              }
            }
          }
            data={pieData}
            type="Pie"/>;
}

export default PieChart;
