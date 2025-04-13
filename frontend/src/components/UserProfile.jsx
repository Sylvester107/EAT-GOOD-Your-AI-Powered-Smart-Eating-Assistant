import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    Alert,
} from '@mui/material';
import { updateUserProfile, getUserProfile } from '../services/api';

const UserProfile = ({ onProfileUpdate }) => {
    const [profile, setProfile] = useState({
        name: '',
        weight_goal: '',
        dietary_restrictions: [],
        allergies: [],
        health_conditions: [],
        daily_calorie_target: '',
        activity_level: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await getUserProfile();
                if (response.success && response.profile) {
                    setProfile(response.profile);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        // Convert daily_calorie_target to number
        if (field === 'daily_calorie_target') {
            setProfile({ ...profile, [field]: value ? parseInt(value, 10) : null });
        } else {
            setProfile({ ...profile, [field]: value });
        }
    };

    const handleMultiSelect = (field) => (event) => {
        setProfile({ ...profile, [field]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            // Ensure daily_calorie_target is a number or null
            const profileData = {
                ...profile,
                daily_calorie_target: profile.daily_calorie_target ? parseInt(profile.daily_calorie_target, 10) : null
            };

            const response = await updateUserProfile(profileData);
            if (response.success) {
                setSuccess(true);
                onProfileUpdate(response.profile);
            } else {
                setError(response.error || 'Failed to update profile');
            }
        } catch (error) {
            setError('Failed to update profile. Please try again.');
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Your Profile
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Profile updated successfully!
                </Alert>
            )}
            <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    <TextField
                        label="Name"
                        value={profile.name}
                        onChange={handleChange('name')}
                        fullWidth
                        disabled={loading}
                    />

                    <FormControl fullWidth>
                        <InputLabel>Weight Goal</InputLabel>
                        <Select
                            value={profile.weight_goal}
                            onChange={handleChange('weight_goal')}
                            label="Weight Goal"
                            disabled={loading}
                        >
                            <MenuItem value="lose">Lose Weight</MenuItem>
                            <MenuItem value="maintain">Maintain Weight</MenuItem>
                            <MenuItem value="gain">Gain Weight</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Dietary Restrictions</InputLabel>
                        <Select
                            multiple
                            value={profile.dietary_restrictions}
                            onChange={handleMultiSelect('dietary_restrictions')}
                            label="Dietary Restrictions"
                            disabled={loading}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                        >
                            <MenuItem value="vegetarian">Vegetarian</MenuItem>
                            <MenuItem value="vegan">Vegan</MenuItem>
                            <MenuItem value="gluten-free">Gluten-Free</MenuItem>
                            <MenuItem value="dairy-free">Dairy-Free</MenuItem>
                            <MenuItem value="halal">Halal</MenuItem>
                            <MenuItem value="kosher">Kosher</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Allergies</InputLabel>
                        <Select
                            multiple
                            value={profile.allergies}
                            onChange={handleMultiSelect('allergies')}
                            label="Allergies"
                            disabled={loading}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                        >
                            <MenuItem value="peanuts">Peanuts</MenuItem>
                            <MenuItem value="tree-nuts">Tree Nuts</MenuItem>
                            <MenuItem value="shellfish">Shellfish</MenuItem>
                            <MenuItem value="eggs">Eggs</MenuItem>
                            <MenuItem value="milk">Milk</MenuItem>
                            <MenuItem value="soy">Soy</MenuItem>
                            <MenuItem value="wheat">Wheat</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Health Conditions</InputLabel>
                        <Select
                            multiple
                            value={profile.health_conditions}
                            onChange={handleMultiSelect('health_conditions')}
                            label="Health Conditions"
                            disabled={loading}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                        >
                            <MenuItem value="diabetes">Diabetes</MenuItem>
                            <MenuItem value="hypertension">Hypertension</MenuItem>
                            <MenuItem value="high-cholesterol">High Cholesterol</MenuItem>
                            <MenuItem value="heart-disease">Heart Disease</MenuItem>
                            <MenuItem value="celiac">Celiac Disease</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Daily Calorie Target"
                        type="number"
                        value={profile.daily_calorie_target}
                        onChange={handleChange('daily_calorie_target')}
                        fullWidth
                        disabled={loading}
                    />

                    <FormControl fullWidth>
                        <InputLabel>Activity Level</InputLabel>
                        <Select
                            value={profile.activity_level}
                            onChange={handleChange('activity_level')}
                            label="Activity Level"
                            disabled={loading}
                        >
                            <MenuItem value="sedentary">Sedentary</MenuItem>
                            <MenuItem value="moderate">Moderate</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="very-active">Very Active</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
};

export default UserProfile; 