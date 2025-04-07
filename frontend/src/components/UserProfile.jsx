import React, { useState } from 'react';
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
} from '@mui/material';

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

    const handleChange = (field) => (event) => {
        setProfile({ ...profile, [field]: event.target.value });
    };

    const handleMultiSelect = (field) => (event) => {
        setProfile({ ...profile, [field]: event.target.value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onProfileUpdate(profile);
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Your Profile
            </Typography>
            <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    <TextField
                        label="Name"
                        value={profile.name}
                        onChange={handleChange('name')}
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel>Weight Goal</InputLabel>
                        <Select
                            value={profile.weight_goal}
                            onChange={handleChange('weight_goal')}
                            label="Weight Goal"
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
                    />

                    <FormControl fullWidth>
                        <InputLabel>Activity Level</InputLabel>
                        <Select
                            value={profile.activity_level}
                            onChange={handleChange('activity_level')}
                            label="Activity Level"
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
                    >
                        Save Profile
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
};

export default UserProfile; 