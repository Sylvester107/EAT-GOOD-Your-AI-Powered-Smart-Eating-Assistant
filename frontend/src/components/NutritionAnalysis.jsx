import React from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Divider,
} from '@mui/material';
import {
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    ThumbsUpDown as ThumbsUpDownIcon,
    Warning as WarningIcon,
    Lightbulb as LightbulbIcon,
    Restaurant as RestaurantIcon,
} from '@mui/icons-material';

const NutritionAnalysis = ({ analysis }) => {
    if (!analysis || !analysis.success) {
        return (
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">
                    {analysis?.error || 'No analysis available'}
                </Typography>
            </Paper>
        );
    }

    const { visual_verdict, nutrition_data } = analysis;
    const {
        title,
        color,
        icon,
        health_score,
        positive_aspects,
        concerns,
        alternatives,
        tips,
        fit_for_user,
        explanation,
    } = visual_verdict;

    const getIcon = () => {
        switch (icon) {
            case 'thumb_up':
                return <ThumbUpIcon sx={{ color }} />;
            case 'thumb_down':
                return <ThumbDownIcon sx={{ color }} />;
            case 'thumbs_up_down':
                return <ThumbsUpDownIcon sx={{ color }} />;
            default:
                return null;
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getIcon()}
                <Typography variant="h5" sx={{ ml: 1 }}>
                    {title}
                </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Health Score: {health_score}/10
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {explanation}
                </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Nutrition Facts
                </Typography>
                <List dense>
                    {nutrition_data.calories && (
                        <ListItem>
                            <ListItemText
                                primary="Calories"
                                secondary={`${nutrition_data.calories} kcal`}
                            />
                        </ListItem>
                    )}
                    {nutrition_data.fat && (
                        <ListItem>
                            <ListItemText
                                primary="Fat"
                                secondary={`${nutrition_data.fat}g`}
                            />
                        </ListItem>
                    )}
                    {nutrition_data.carbohydrates && (
                        <ListItem>
                            <ListItemText
                                primary="Carbohydrates"
                                secondary={`${nutrition_data.carbohydrates}g`}
                            />
                        </ListItem>
                    )}
                    {nutrition_data.protein && (
                        <ListItem>
                            <ListItemText
                                primary="Protein"
                                secondary={`${nutrition_data.protein}g`}
                            />
                        </ListItem>
                    )}
                </List>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Positive Aspects
                </Typography>
                <List dense>
                    {positive_aspects.map((aspect, index) => (
                        <ListItem key={index}>
                            <ListItemIcon>
                                <ThumbUpIcon color="success" />
                            </ListItemIcon>
                            <ListItemText primary={aspect} />
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Concerns
                </Typography>
                <List dense>
                    {concerns.map((concern, index) => (
                        <ListItem key={index}>
                            <ListItemIcon>
                                <WarningIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText primary={concern} />
                        </ListItem>
                    ))}
                </List>
            </Box>

            {alternatives && alternatives.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Healthier Alternatives
                    </Typography>
                    <List dense>
                        {alternatives.map((alternative, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <RestaurantIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText primary={alternative} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            {tips && tips.length > 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Tips
                    </Typography>
                    <List dense>
                        {tips.map((tip, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <LightbulbIcon color="info" />
                                </ListItemIcon>
                                <ListItemText primary={tip} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            <Box sx={{ mt: 2 }}>
                <Chip
                    label={`Fit for you: ${fit_for_user}`}
                    color={
                        fit_for_user === 'Yes'
                            ? 'success'
                            : fit_for_user === 'No'
                            ? 'error'
                            : 'warning'
                    }
                />
            </Box>
        </Paper>
    );
};

export default NutritionAnalysis; 