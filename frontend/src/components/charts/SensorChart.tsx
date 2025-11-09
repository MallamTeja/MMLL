import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, useTheme, Box } from '@mui/material';
import { format } from 'date-fns';

interface SensorChartProps<T> {
  title: string;
  data: T[];
  xField: string;
  yField: string;
  height?: number;
  width?: number | string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  strokeWidth?: number;
  strokeColor?: string;
  areaGradient?: boolean;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  tooltipLabelFormatter?: (label: any) => string;
}

const SensorChart = <T extends Record<string, any>>({
  title,
  data,
  xField,
  yField,
  height = 300,
  width = '100%',
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  strokeWidth = 2,
  strokeColor,
  areaGradient = false,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
  tooltipLabelFormatter,
  ...props
}: SensorChartProps<T>) => {
  const theme = useTheme();
  
  // Default formatters
  const defaultXAxisFormatter = (value: any) => {
    if (value instanceof Date) {
      return format(new Date(value), 'HH:mm');
    }
    return value;
  };

  const defaultYAxisFormatter = (value: any) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  const defaultTooltipFormatter = (value: any, name: string) => {
    return [typeof value === 'number' ? value.toFixed(2) : value, name];
  };

  const defaultTooltipLabelFormatter = (label: any) => {
    if (!label) return '';
    if (label instanceof Date) {
      return format(new Date(label), 'PPpp');
    }
    return label;
  };

  // Sort data by xField if it's a date
  const sortedData = [...data].sort((a, b) => {
    const aVal = a[xField];
    const bVal = b[xField];
    
    if (aVal instanceof Date && bVal instanceof Date) {
      return aVal.getTime() - bVal.getTime();
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return new Date(aVal).getTime() - new Date(bVal).getTime();
    }
    
    return 0;
  });

  // Calculate domain for y-axis to add some padding
  const getYDomain = () => {
    const values = sortedData.map(item => item[yField]).filter(val => typeof val === 'number');
    if (values.length === 0) return [0, 100];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max(0.1 * (max - min), 0.1);
    
    return [min - padding, max + padding];
  };

  const yDomain = getYDomain();
  
  return (
    <Box sx={{ width, height: '100%' }}>
      {title && (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      )}
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sortedData}
            margin={{
              top: 5,
              right: 15,
              left: 0,
              bottom: 5,
            }}
            {...props}
          >
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.palette.divider} 
              />
            )}
            <XAxis
              dataKey={xField}
              tickFormatter={xAxisFormatter || defaultXAxisFormatter}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              tickLine={{ stroke: theme.palette.divider }}
              axisLine={{ stroke: theme.palette.divider }}
            />
            <YAxis
              domain={yDomain}
              tickFormatter={yAxisFormatter || defaultYAxisFormatter}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              tickLine={{ stroke: theme.palette.divider }}
              axisLine={{ stroke: theme.palette.divider }}
              width={60}
            />
            {showTooltip && (
              <Tooltip
                formatter={tooltipFormatter || defaultTooltipFormatter}
                labelFormatter={tooltipLabelFormatter || defaultTooltipLabelFormatter}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                  padding: theme.spacing(1),
                }}
                itemStyle={{
                  color: theme.palette.text.primary,
                }}
                labelStyle={{
                  color: theme.palette.text.secondary,
                  marginBottom: theme.spacing(1),
                  fontWeight: 500,
                }}
              />
            )}
            {showLegend && (
              <Legend 
                wrapperStyle={{
                  paddingTop: '10px',
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey={yField}
              stroke={strokeColor || theme.palette.primary.main}
              strokeWidth={strokeWidth}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
              name={title}
            />
            {areaGradient && (
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={strokeColor || theme.palette.primary.main} 
                    stopOpacity={0.2} 
                  />
                  <stop 
                    offset="95%" 
                    stopColor={strokeColor || theme.palette.primary.main} 
                    stopOpacity={0} 
                  />
                </linearGradient>
              </defs>
            )}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default SensorChart;
