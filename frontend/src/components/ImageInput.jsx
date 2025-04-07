import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import ImageUploader from './ImageUploader';
import CameraScanner from './CameraScanner';

const ImageInput = ({ onImageCapture }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab label="Upload Image" />
                    <Tab label="Use Camera" />
                </Tabs>
            </Box>
            <Box>
                {activeTab === 0 ? (
                    <ImageUploader onImageUpload={onImageCapture} />
                ) : (
                    <CameraScanner onImageCapture={onImageCapture} />
                )}
            </Box>
        </Paper>
    );
};

export default ImageInput; 