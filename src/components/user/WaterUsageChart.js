import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Mock data: daily usage for last 7 days
const usageData = [120, 95, 110, 130, 90, 100, 105];
const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const data = {
  labels,
  datasets: [
    {
      label: 'Liters Used',
      data: usageData,
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderRadius: 8,
      barThickness: 28,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { color: '#64748b', font: { size: 13 } },
      grid: { color: '#e0e7ef' },
    },
    x: {
      ticks: { color: '#64748b', font: { size: 13 } },
      grid: { display: false },
    },
  },
};

const total = usageData.reduce((a, b) => a + b, 0);
const avg = Math.round(total / usageData.length);
const max = Math.max(...usageData);

const WaterUsageChart = () => (
  <div className="w-full h-48">
    <Bar data={data} options={options} />
  </div>
);

export default WaterUsageChart;
export { total, avg, max }; 