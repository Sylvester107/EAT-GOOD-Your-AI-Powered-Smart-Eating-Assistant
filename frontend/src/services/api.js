import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const scanProduct = async (imageFile, productName = null, userId = null) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    if (productName) {
        formData.append('product_name', productName);
    }

    const headers = {};
    if (userId) {
        headers['X-User-ID'] = userId;
    }

    try {
        const response = await api.post('/api/scan', formData, {
            headers: {
                ...headers,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error scanning product:', error);
        throw error;
    }
};

export const checkHealth = async () => {
    try {
        const response = await api.get('/api/health');
        return response.data;
    } catch (error) {
        console.error('Error checking health:', error);
        throw error;
    }
};

export const updateUserProfile = async (profileData) => {
    try {
        const response = await api.post('/api/user/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

export const getUserProfile = async () => {
    try {
        const response = await api.get('/api/user/profile');
        return response.data;
    } catch (error) {
        console.error('Error getting profile:', error);
        throw error;
    }
}; 