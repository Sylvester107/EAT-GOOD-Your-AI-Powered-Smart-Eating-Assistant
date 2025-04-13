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
    Grid,
} from '@mui/material';
import {
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    ThumbsUpDown as ThumbsUpDownIcon,
    Warning as WarningIcon,
    Lightbulb as LightbulbIcon,
    Restaurant as RestaurantIcon,
    LocalFireDepartment as CaloriesIcon,
    WaterDrop as FatIcon,
    Grain as CarbsIcon,
    FitnessCenter as ProteinIcon,
} from '@mui/icons-material';

const NutritionAnalysis = ({ analysis }) => {
    if (!analysis || !analysis.success) {
        return (
            <Paper elevation={3} sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                borderRadius: 2
            }}>
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
                return <ThumbUpIcon sx={{ color, fontSize: 40 }} />;
            case 'thumb_down':
                return <ThumbDownIcon sx={{ color, fontSize: 40 }} />;
            case 'thumbs_up_down':
                return <ThumbsUpDownIcon sx={{ color, fontSize: 40 }} />;
            default:
                return null;
        }
    };

    return (
        <Paper elevation={3} sx={{ 
            p: 3, 
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {getIcon()}
                <Box sx={{ ml: 2 }}>
                    <Typography variant="h4" sx={{ 
                        fontWeight: 'bold',
                        color: '#2C3E50',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                        {title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Health Score: {health_score}/10
                    </Typography>
                </Box>
            </Box>

            <Typography variant="body1" sx={{ 
                mb: 3, 
                color: 'text.secondary',
                lineHeight: 1.6
            }}>
                {explanation}
            </Typography>

            <Divider sx={{ 
                my: 3,
                borderColor: 'rgba(0, 0, 0, 0.08)'
            }} />

            <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                color: '#2C3E50'
            }}>
                Nutrition Facts
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {nutrition_data.calories && (
                    <Grid item xs={6} sm={3}>
                        <Paper elevation={1} sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            bgcolor: '#FFF5E6',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-2px)'
                            }
                        }}>
                            <CaloriesIcon sx={{ color: '#FF9800', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 600 }}>{nutrition_data.calories}</Typography>
                            <Typography variant="body2" color="text.secondary">Calories</Typography>
                        </Paper>
                    </Grid>
                )}
                {nutrition_data.fat && (
                    <Grid item xs={6} sm={3}>
                        <Paper elevation={1} sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            bgcolor: '#E6F3FF',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-2px)'
                            }
                        }}>
                            <FatIcon sx={{ color: '#2196F3', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 600 }}>{nutrition_data.fat}g</Typography>
                            <Typography variant="body2" color="text.secondary">Fat</Typography>
                        </Paper>
                    </Grid>
                )}
                {nutrition_data.carbohydrates && (
                    <Grid item xs={6} sm={3}>
                        <Paper elevation={1} sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            bgcolor: '#E6FFE6',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-2px)'
                            }
                        }}>
                            <CarbsIcon sx={{ color: '#4CAF50', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 600 }}>{nutrition_data.carbohydrates}g</Typography>
                            <Typography variant="body2" color="text.secondary">Carbs</Typography>
                        </Paper>
                    </Grid>
                )}
                {nutrition_data.protein && (
                    <Grid item xs={6} sm={3}>
                        <Paper elevation={1} sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            bgcolor: '#FFE6E6',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-2px)'
                            }
                        }}>
                            <ProteinIcon sx={{ color: '#F44336', fontSize: 30, mb: 1 }} />
                            <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 600 }}>{nutrition_data.protein}g</Typography>
                            <Typography variant="body2" color="text.secondary">Protein</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            <Divider sx={{ 
                my: 3,
                borderColor: 'rgba(0, 0, 0, 0.08)'
            }} />

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                            fontWeight: 'bold', 
                            color: '#4CAF50',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                            Positive Aspects
                        </Typography>
                        <List dense>
                            {positive_aspects.map((aspect, index) => (
                                <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemIcon>
                                        <ThumbUpIcon color="success" />
                                    </ListItemIcon>
                                    <ListItemText primary={aspect} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ 
                            fontWeight: 'bold', 
                            color: '#F44336',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                            Concerns
                        </Typography>
                        <List dense>
                            {concerns.map((concern, index) => (
                                <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemIcon>
                                        <WarningIcon color="warning" />
                                    </ListItemIcon>
                                    <ListItemText primary={concern} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Grid>
            </Grid>

            {alternatives && alternatives.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 'bold', 
                        color: '#2196F3',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                        Healthier Alternatives
                    </Typography>
                    <List dense>
                        {alternatives.map((alternative, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
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
                    <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 'bold', 
                        color: '#FF9800',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                        Tips
                    </Typography>
                    <List dense>
                        {tips.map((tip, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemIcon>
                                    <LightbulbIcon color="info" />
                                </ListItemIcon>
                                <ListItemText primary={tip} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Chip
                    label={`Fit for you: ${fit_for_user}`}
                    color={
                        fit_for_user === 'Yes'
                            ? 'success'
                            : fit_for_user === 'No'
                            ? 'error'
                            : 'warning'
                    }
                    sx={{ 
                        fontSize: '1.1rem',
                        padding: '8px 16px',
                        height: 'auto',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                />
            </Box>
        </Paper>
    );
};

export default NutritionAnalysis; 