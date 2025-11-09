import React from 'react';
import { Box, Text } from '@chakra-ui/react';

interface SensorGaugeProps {
  value: number;
  label: string;
  min?: number;
  max?: number;
}

export const SensorGauge: React.FC<SensorGaugeProps> = ({ value, label, min = 0, max = 100 }) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  return (
    <Box p={4} borderWidth={1} borderRadius="md" textAlign="center">
      <Text fontSize="sm" color="gray.500" mb={2}>
        {label}
      </Text>
      <Box
        height="120px"
        width="100%"
        bg="gray.100"
        borderRadius="md"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          bottom="0"
          left="0"
          width="100%"
          height={`${percentage}%`}
          bg={percentage > 80 ? 'red.400' : percentage > 50 ? 'yellow.400' : 'green.400'}
          transition="height 0.3s ease-in-out"
        />
        <Text
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          fontWeight="bold"
          fontSize="xl"
          color="gray.700"
        >
          {value.toFixed(1)}
        </Text>
      </Box>
    </Box>
  );
};

export default SensorGauge;
