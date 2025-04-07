import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';

const CameraScanner = ({ onImageCapture }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState('');
    const [facingMode, setFacingMode] = useState('environment'); // 'user' for front camera, 'environment' for back camera

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, [facingMode]);

    const startCamera = async () => {
        try {
            const constraints = {
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
            setError('');
        } catch (err) {
            setError('Could not access camera. Please ensure camera permissions are granted.');
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);
            
            canvas.toBlob((blob) => {
                const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
                onImageCapture(file);
            }, 'image/jpeg', 0.95);
        }
    };

    const toggleCamera = () => {
        setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: 'background.paper',
            }}
        >
            {error ? (
                <Box sx={{ p: 4 }}>
                    <Typography color="error" gutterBottom>
                        {error}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={startCamera}
                        sx={{ mt: 2 }}
                    >
                        Try Again
                    </Button>
                </Box>
            ) : (
                <>
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            height: '300px',
                            overflow: 'hidden',
                            borderRadius: 1,
                            mb: 2
                        }}
                    >
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<CameraAltIcon />}
                            onClick={captureImage}
                        >
                            Capture
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FlipCameraIosIcon />}
                            onClick={toggleCamera}
                        >
                            Switch Camera
                        </Button>
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default CameraScanner; 