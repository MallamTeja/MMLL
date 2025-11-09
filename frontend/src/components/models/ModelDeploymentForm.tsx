import React, { useState, FormEvent } from 'react';
// Chakra UI components
// Base Chakra UI components
import { 
  Box, 
  Button, 
  HStack,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Switch,
  Table,
  Tabs,
  Text,
  Textarea,
  Tooltip,
  VStack
} from '@chakra-ui/react';

// Color mode hook
import { useColorModeValue } from '@chakra-ui/color-mode';

// Form components
import { 
  FormControl, 
  FormLabel, 
  FormHelperText, 
  FormErrorMessage 
} from '@chakra-ui/form-control';

// Number input components
import { 
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/number-input';

// Table components
import { 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td 
} from '@chakra-ui/table';

// Tabs components
import { 
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/tabs';

// Icons
import { AddIcon, MinusIcon } from '@chakra-ui/icons';

// Toast
import { useToast } from '@chakra-ui/toast';
import type { UseToastOptions } from '@chakra-ui/toast';
import { Model } from '../../types/models';

// Type definitions for form data
interface ProbeConfig {
  initialDelaySeconds: number;
  periodSeconds: number;
  timeoutSeconds: number;
  successThreshold: number;
  failureThreshold: number;
}

interface FormData {
  name: string;
  description: string;
  environment: string;
  replicas: number;
  cpuRequest: string;
  memoryRequest: string;
  gpuEnabled: boolean;
  gpuType: string;
  gpuCount: number;
  autoScaling: boolean;
  minReplicas: number;
  maxReplicas: number;
  targetCPUUtilization: number;
  targetMemoryUtilization: number;
  readinessProbe: ProbeConfig;
  livenessProbe: ProbeConfig;
}

// Extend FormData to include model info for submission
interface SubmissionData extends FormData {
  modelId: string;
  modelVersion: string;
}

// Custom input component for number inputs
interface NumberInputComponentProps {
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
}

const NumberInputComponent: React.FC<NumberInputComponentProps> = ({
  name,
  value,
  onChange,
  min,
  max,
  step = 1,
}) => {
  const handleChange = (valueAsString: string, valueAsNumber: number) => {
    // Only call onChange if the value is a valid number or the string is empty
    if (valueAsString === '' || !isNaN(valueAsNumber)) {
      onChange({
        target: {
          name,
          value: valueAsString === '' ? '' : valueAsNumber,
          type: 'number'
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <NumberInput
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={handleChange}
    >
      <NumberInputField name={name} />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  );
};

interface ModelDeploymentFormProps {
  model: Model;
  onSubmit: (config: SubmissionData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ModelDeploymentForm: React.FC<ModelDeploymentFormProps> = ({
  model,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Initialize state and hooks
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: `${model.name}-deployment-${new Date().toISOString().split('T')[0]}`,
    description: `Deployment of ${model.name} model`,
    environment: 'production',
    replicas: 1,
    cpuRequest: '1',
    memoryRequest: '1Gi',
    gpuEnabled: false,
    gpuType: 'nvidia.com/gpu',
    gpuCount: 1,
    autoScaling: true,
    minReplicas: 1,
    maxReplicas: 5,
    targetCPUUtilization: 70,
    targetMemoryUtilization: 80,
    readinessProbe: {
      initialDelaySeconds: 5,
      periodSeconds: 10,
      timeoutSeconds: 5,
      successThreshold: 1,
      failureThreshold: 3,
    },
    livenessProbe: {
      initialDelaySeconds: 15,
      periodSeconds: 20,
      timeoutSeconds: 5,
      successThreshold: 1,
      failureThreshold: 3,
    },
  });

  const toast = useToast();
  const { colorMode } = useColorMode();
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submissionData: SubmissionData = {
        ...formData,
        modelId: model.id,
        modelVersion: model.versions?.[0]?.version || '1.0.0',
      };
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error deploying model:', error);
      toast({
        title: 'Deployment Error',
        description: 'Failed to deploy model. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number' || e.target.getAttribute('type') === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
      return;
    }
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
      return;
    }
    
    // Handle nested form data (e.g., readinessProbe.initialDelaySeconds)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof FormData] as Record<string, any>;
        const newValue = type === 'number' ? Number(value) : value;
        
        return {
          ...prev,
          [parent]: {
            ...parentValue,
            [child]: newValue
          }
        } as FormData;
      });
      return;
    }
    
    // Handle regular inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
      return;
    }
    
    // Handle regular inputs
    setFormData(prev => ({
  };

  const handleSwitchChange = (name: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [name]: !(prev as any)[name]
    }));
  };

  // Helper function to handle number input changes
  const handleNumberInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submissionData: SubmissionData = {
        ...formData,
        modelId: model.id,
        modelVersion: model.versions?.[0]?.version || '1.0.0',
      };
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error deploying model:', error);
      toast({
        title: 'Deployment Error',
        description: 'Failed to deploy model. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number' || e.target.getAttribute('type') === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
      return;
    }
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
      return;
    }
    
    // Handle nested form data (e.g., readinessProbe.initialDelaySeconds)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const parentValue = prev[parent as keyof FormData] as Record<string, any>;
        const newValue = type === 'number' ? Number(value) : value;
        
        return {
          ...prev,
          [parent]: {
            ...parentValue,
            [child]: newValue
          }
        } as FormData;
      });
      return;
    }
    
    // Handle regular inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle switch changes
  const handleSwitchChange = (name: keyof FormData) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: !(prev as any)[name]
    }));
  };

  // Handle number input changes
  const handleNumberInputChange = (name: string, value: string | number) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value)
    }));
  };

  const toast = useToast();
  const { colorMode } = useColorMode();
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Deployment Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter deployment name"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter deployment description"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Environment</FormLabel>
          <Select
            name="environment"
            value={formData.environment}
            onChange={handleChange}
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </Select>
        </FormControl>

        <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
          <Text fontWeight="bold" mb={3}>Resources</Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            <FormControl>
              <FormLabel>CPU Cores</FormLabel>
              <NumberInputComponent
                name="cpuRequest"
                value={formData.cpuRequest}
                onChange={handleChange}
                min={0.1}
                max={32}
                step={0.1}
              />
              <FormHelperText>CPU cores to allocate (e.g., 0.5, 1, 2)</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Memory</FormLabel>
              <Select
                name="memoryRequest"
                value={formData.memoryRequest}
                onChange={handleChange}
              >
                <option value="256Mi">256 MiB</option>
                <option value="512Mi">512 MiB</option>
                <option value="1Gi">1 GiB</option>
                <option value="2Gi">2 GiB</option>
                <option value="4Gi">4 GiB</option>
                <option value="8Gi">8 GiB</option>
                <option value="16Gi">16 GiB</option>
              </Select>
            </FormControl>
          </SimpleGrid>

          <FormControl mt={4}>
            <HStack justify="space-between">
              <Box>
                <FormLabel mb={0}>Enable GPU</FormLabel>
                <FormHelperText mt={0}>Accelerate inference with GPU</FormHelperText>
              </Box>
              <Box
                as="label"
                position="relative"
                display="inline-flex"
                alignItems="center"
                cursor="pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.gpuEnabled}
                  onChange={handleSwitchChange('gpuEnabled')}
                  style={{ display: 'none' }}
                />
                <Box
                  w="40px"
                  h="20px"
                  bg={formData.gpuEnabled ? 'blue.500' : 'gray.200'}
                  borderRadius="full"
                  position="relative"
                  transition="all 0.3s"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    w: '16px',
                    h: '16px',
                    borderRadius: '50%',
                    bg: 'white',
                    top: '2px',
                    left: formData.gpuEnabled ? '22px' : '2px',
                    transition: 'all 0.3s',
                    boxShadow: 'sm'
                  }}
                />
              </Box>
            </HStack>
          </FormControl>

          {formData.gpuEnabled && (
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mt={2}>
              <FormControl>
                <FormLabel>GPU Type</FormLabel>
                <Select
                  name="gpuType"
                  value={formData.gpuType}
                  onChange={handleChange}
                >
                  <option value="nvidia.com/gpu">NVIDIA GPU</option>
                  <option value="amd.com/gpu">AMD GPU</option>
                  <option value="intel.com/gpu">Intel GPU</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>GPU Count</FormLabel>
                <NumberInput
                  name="gpuCount"
                  min={1}
                  max={8}
                  value={formData.gpuCount}
                  onChange={(valueString: string) => handleChange({
                    target: {
                      name: 'gpuCount',
                      value: valueString
                    }
                  } as React.ChangeEvent<HTMLInputElement>)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
          )}
        </Box>
                <FormLabel>Min Replicas</FormLabel>
                <NumberInput
                  name="minReplicas"
                  min={1}
                  max={10}
                  value={formData.minReplicas}
                  onChange={(valueString: string) => handleChange({
                    target: {
                      name: 'minReplicas',
                      value: valueString,
          type: 'number',
                    }
                  } as React.ChangeEvent<HTMLInputElement>)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Max Replicas</FormLabel>
                <NumberInput
                  name="maxReplicas"
                  min={formData.minReplicas}
                  max={20}
                  value={formData.maxReplicas}
                  onChange={(valueString: string) => handleChange({
                    target: {
                      name: 'maxReplicas',
                      value: valueString,
          type: 'number',
                    }
                  } as React.ChangeEvent<HTMLInputElement>)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Target CPU %</FormLabel>
                <NumberInput
                  name="targetCPUUtilization"
                  min={10}
                  max={90}
                  value={formData.targetCPUUtilization}
                  onChange={(valueString: string) => handleChange({
                    target: {
                      name: 'targetCPUUtilization',
                      value: valueString,
          type: 'number',
                    }
                  } as React.ChangeEvent<HTMLInputElement>)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Target Memory %</FormLabel>
                <NumberInput
                  name="targetMemoryUtilization"
                  min={10}
                  max={90}
                  value={formData.targetMemoryUtilization}
                  onChange={(valueString: string) => handleChange({
                    target: {
                      name: 'targetMemoryUtilization',
                      value: valueString,
          type: 'number',
                    }
                  } as React.ChangeEvent<HTMLInputElement>)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
          )}
        </Box>

        <Box p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
          <Text fontWeight="bold" mb={3}>Health Checks</Text>
          
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Readiness</Tab>
              <Tab>Liveness</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <VStack gap={4} align="stretch">
                  <FormControl>
                    <FormLabel>Initial Delay (seconds)</FormLabel>
                    <NumberInput
                      name="readinessProbe.initialDelaySeconds"
                      min={1}
                      max={60}
                      value={formData.readinessProbe.initialDelaySeconds}
                      onChange={(valueString: string) => handleChange({
                        target: {
                          name: 'readinessProbe.initialDelaySeconds',
                          value: valueString,
          type: 'number',
                        }
                      } as React.ChangeEvent<HTMLInputElement>)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </VStack>
              </TabPanel>
              <TabPanel px={0}>
                <VStack gap={4} align="stretch">
                  <FormControl>
                    <FormLabel>Period (seconds)</FormLabel>
                    <NumberInput
                      name="livenessProbe.periodSeconds"
                      min={1}
                      max={60}
                      value={formData.livenessProbe.periodSeconds}
                      onChange={(valueString: string) => handleChange({
                        target: {
                          name: 'livenessProbe.periodSeconds',
                          value: valueString,
          type: 'number',
                        }
                      } as React.ChangeEvent<HTMLInputElement>)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        <Box mt={4} p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
          <Text fontWeight="bold" mb={2}>Deployment Summary</Text>
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Text>Model:</Text>
              <Text fontWeight="medium">{model.name}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Environment:</Text>
              <Badge colorScheme={formData.environment === 'production' ? 'red' : 'blue'}>
                {formData.environment}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Replicas:</Text>
              <Text>{formData.autoScaling ? 
                `${formData.minReplicas}-${formData.maxReplicas}` : 
                formData.replicas}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text>Resources:</Text>
              <Text>{formData.cpuRequest} CPU, {formData.memoryRequest} RAM</Text>
            </HStack>
            {formData.gpuEnabled && (
              <HStack justify="space-between">
                <Text>GPU:</Text>
                <Text>{formData.gpuCount}x {formData.gpuType.split('/').pop()?.toUpperCase()}</Text>
              </HStack>

        <ModalFooter px={0} pb={0} mt={6}>
          <Button
            variant="outline"
            mr={3}
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            type="submit"
            loading={isLoading}
            loadingText="Deploying..."
          >
            Deploy Model
          </Button>
        </ModalFooter>
</VStack>
    </Box>
  );
};
  );
};

export default ModelDeploymentForm;
