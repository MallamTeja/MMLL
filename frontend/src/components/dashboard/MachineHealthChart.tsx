import React from 'react';
import { Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MachineHealthChart: React.FC = () => {
  // Sample data - in a real app, this would come from an API
  const labels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Machine Health Score',
        data: [65, 78, 66, 89, 76, 82, 91],
        borderColor: '#4B0082',
        backgroundColor: 'rgba(75, 0, 130, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#4B0082',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#4B0082',
        pointHoverBorderColor: '#fff',
        pointHitRadius: 10,
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: number | string) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <Box sx={{ height: 300, width: '100%', mt: 2 }}>
      <Line data={data} options={options} />
    </Box>
  );
};

export default MachineHealthChart;
