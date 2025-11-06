import 'chart.js';

declare module 'chart.js' {
  interface ChartTypeRegistry {
    bar: {
      chartOptions: import('chart.js').ChartOptions<'bar'>;
      datasetOptions: import('chart.js').ChartDataset<'bar', (number | [number, number] | null)[]>;
    };
    line: {
      chartOptions: import('chart.js').ChartOptions<'line'>;
      datasetOptions: import('chart.js').ChartDataset<'line', (number | [number, number] | null)[]>;
    };
    pie: {
      chartOptions: import('chart.js').ChartOptions<'pie'>;
      datasetOptions: import('chart.js').ChartDataset<'pie', (number | [number, number] | null)[]>;
    };
  }
}
