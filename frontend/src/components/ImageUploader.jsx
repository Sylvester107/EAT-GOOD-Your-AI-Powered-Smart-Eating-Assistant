import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';

const ImageUploader = ({ onImageUpload }) => {
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');

    const onDrop = useCallback((acceptedFiles) => {
        setError('');
        const file = acceptedFiles[0];
        
        if (!file) {
            setError('Please select an image file');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Pass file to parent
        onImageUpload(file);
    }, [onImageUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxFiles: 1
    });

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
            }}
            {...getRootProps()}
        >
            <input {...getInputProps()} />
            {preview ? (
                <Box sx={{ mt: 2 }}>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            objectFit: 'contain'
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                    >
                        Upload New Image
                    </Button>
                </Box>
            ) : (
                <Box sx={{ p: 4 }}>
                    <ImageIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        or click to select a file
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Supported formats: JPEG, JPG, PNG
                    </Typography>
                </Box>
            )}
            {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}
        </Paper>
    );
};

export default ImageUploader; 