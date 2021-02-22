/**
 * Converts a dict to Chartist data format.
 * @param data dict to convert.
 * @returns {{labels: Array, series: Array}}
 */
function create_labels_and_series(data){
  let labels = [];
  let series = [];
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      labels.push(key);
      series.push(data[key]);
    }
  }
  return {labels: labels, series: series}
}

export default create_labels_and_series;