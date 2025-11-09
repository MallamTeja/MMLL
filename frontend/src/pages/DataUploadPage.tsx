import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Button, CircularProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CloudUpload, InsertDriveFile, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';

type FileUpload = {
  file: File;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
};

const DataUploadPage: React.FC = () => {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'csv'>('image');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads = acceptedFiles.map(file => ({
      file,
      status: 'uploading' as const,
    }));
    
    setUploads(prev => [...prev, ...newUploads]);
    
    // Simulate upload
    newUploads.forEach((upload, index) => {
      setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate for demo
        setUploads(prev => {
          const updated = [...prev];
          const uploadIndex = prev.findIndex(u => u.file === upload.file);
          if (uploadIndex !== -1) {
            updated[uploadIndex] = {
              ...upload,
              status: success ? 'completed' : 'error',
              error: success ? undefined : 'Upload failed. Please try again.'
            };
          }
          return updated;
        });
      }, 1500 * (index + 1));
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: uploadType === 'image' 
      ? { 'image/*': ['.jpeg', '.jpg', '.png'] } 
      : { 'text/csv': ['.csv'] },
    multiple: true,
    disabled: isUploading,
  });

  const handleUploadTypeChange = (type: 'image' | 'csv') => {
    setUploadType(type);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Data Upload
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant={uploadType === 'image' ? 'contained' : 'outlined'}
          onClick={() => handleUploadTypeChange('image')}
        >
          Upload Images
        </Button>
        <Button
          variant={uploadType === 'csv' ? 'contained' : 'outlined'}
          onClick={() => handleUploadTypeChange('csv')}
        >
          Upload CSV Data
        </Button>
      </Box>

      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: 'primary.main',
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'background-color 0.2s',
          mb: 3,
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6">
          {isDragActive
            ? 'Drop the files here...'
            : `Drag and drop ${uploadType === 'image' ? 'images' : 'CSV files'} here, or click to select files`}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {uploadType === 'image' 
            ? 'Supports JPG, JPEG, PNG (max 10MB each)' 
            : 'Supports CSV files (max 10MB each)'}
        </Typography>
      </Paper>

      {uploads.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload Queue
          </Typography>
          <List>
            {uploads.map((upload, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {upload.status === 'uploading' ? (
                    <CircularProgress size={24} />
                  ) : upload.status === 'completed' ? (
                    <CheckCircle sx={{ color: green[500] }} />
                  ) : (
                    <ErrorIcon sx={{ color: red[500] }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={upload.file.name}
                  secondary={
                    upload.status === 'uploading' 
                      ? 'Uploading...' 
                      : upload.status === 'completed'
                        ? 'Upload successful'
                        : upload.error
                  }
                  secondaryTypographyProps={{
                    color: upload.status === 'error' ? 'error' : 'textSecondary'
                  }}
                />
                <ListItemText
                  primary={`${(upload.file.size / 1024 / 1024).toFixed(2)} MB`}
                  primaryTypographyProps={{ variant: 'body2', align: 'right' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default DataUploadPage;
