import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Base components
import { 
  Box, 
  Button, 
  Input, 
  VStack,
  Select,
  useDisclosure
} from '@chakra-ui/react';

// Form components
import { 
  FormControl, 
  FormLabel, 
  FormErrorMessage
} from '@chakra-ui/form-control';

// Modal components
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton 
} from '@chakra-ui/modal';

// Number input components
import { 
  NumberInput, 
  NumberInputField, 
  NumberInputStepper, 
  NumberIncrementStepper, 
  NumberDecrementStepper 
} from '@chakra-ui/number-input';

// Toast hook
import { useToast } from '@chakra-ui/toast';
import { modelService, TrainingConfig } from '../../services/modelService';

const trainingSchema = z.object({
  model_type: z.string().min(1, 'Model type is required'),
  machine_id: z.number().optional(),
  epochs: z.number().min(1, 'Epochs must be at least 1').max(1000, 'Epochs cannot exceed 1000'),
  batch_size: z.number().min(1, 'Batch size must be at least 1'),
});

type TrainingFormData = z.infer<typeof trainingSchema>;

interface ModelTrainingFormProps {
  onTrainingComplete: () => void;
  machines: Array<{ id: number; name: string }>;
}

export const ModelTrainingForm: React.FC<ModelTrainingFormProps> = ({ onTrainingComplete, machines }) => {
  const toast = useToast();
  const [isTraining, setIsTraining] = useState(false);
  const { open, onOpen, onClose } = useDisclosure();
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      model_type: 'lstm',
      epochs: 50,
      batch_size: 32,
    },
  });

  const onSubmit: SubmitHandler<TrainingFormData> = async (data) => {
    setIsTraining(true);
    try {
      // @ts-ignore - Fix the modelService.trainModel type definition
      await modelService.trainModel(JSON.stringify(data), data.machine_id || undefined);
      
      toast({
        title: 'Training started',
        description: 'Your model is being trained in the background.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
      onTrainingComplete();
    } catch (error) {
      console.error('Error training model:', error);
      toast({
        title: 'Error',
        description: 'Failed to start model training. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <>
      <Button colorScheme="blue" mr={3} onClick={onOpen}>
        Train New Model
      </Button>

      <Modal isOpen={open} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Train New Model</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack gap={4}>
              <FormControl isInvalid={!!errors.model_type}>
                <FormLabel>Model Type</FormLabel>
                <Controller
                  name="model_type"
                  control={control}
                  render={({ field }) => (
                    <select 
                      {...field} 
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    >
                      <option value="">Select model type</option>
                      <option value="lstm">LSTM</option>
                      <option value="cnn">CNN</option>
                      <option value="hybrid">Hybrid (CNN-LSTM)</option>
                    </select>
                  )}
                />
                <FormErrorMessage>{errors.model_type?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Machine (Optional)</FormLabel>
                <Controller
                  name="machine_id"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value?.toString() || ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    >
                      <option value="">Select machine (optional)</option>
                      {machines.map((machine) => (
                        <option key={machine.id} value={machine.id}>
                          {machine.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.epochs}>
                <FormLabel>Epochs</FormLabel>
                <Controller
                  name="epochs"
                  control={control}
                  render={({ field: { onChange, value, ...restField } }) => (
                    <NumberInput
                      {...restField}
                      min={1}
                      max={1000}
                      value={value}
                      onChange={(valueString) => onChange(parseInt(valueString) || 0)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
                <FormErrorMessage>{errors.epochs?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.batch_size}>
                <FormLabel>Batch Size</FormLabel>
                <Controller
                  name="batch_size"
                  control={control}
                  render={({ field: { onChange, value, ...restField } }) => (
                    <NumberInput
                      {...restField}
                      min={1}
                      value={value}
                      onChange={(valueString) => onChange(parseInt(valueString) || 0)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
                <FormErrorMessage>{errors.batch_size?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} disabled={isTraining}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit" loading={isTraining} loadingText="Training...">
              Start Training
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
