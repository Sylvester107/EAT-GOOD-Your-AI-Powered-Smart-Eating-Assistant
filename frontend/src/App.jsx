import { useState } from 'react'
import {
    Container,
    Box,
    Typography,
    Grid,
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CameraIcon from '@mui/icons-material/Camera'
import PersonIcon from '@mui/icons-material/Person'
import HomeIcon from '@mui/icons-material/Home'

import ImageInput from './components/ImageInput'
import NutritionAnalysis from './components/NutritionAnalysis'
import UserProfile from './components/UserProfile'
import LoadingSpinner from './components/LoadingSpinner'
import { scanProduct } from './services/api'

function App() {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('scan')
    const [analysisResults, setAnalysisResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [userProfile, setUserProfile] = useState(null)

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen)
    }

    const handleImageUpload = async (file) => {
        try {
            setLoading(true)
            const results = await scanProduct(file, null, userProfile?.id)
            setAnalysisResults(results)
        } catch (error) {
            console.error('Error analyzing image:', error)
            setAnalysisResults({
                success: false,
                error: 'Failed to analyze image. Please try again.',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleProfileUpdate = (profile) => {
        setUserProfile(profile)
        setActiveTab('scan')
    }

    const drawer = (
        <List>
            <ListItem button onClick={() => setActiveTab('scan')}>
                <ListItemIcon>
                    <CameraIcon />
                </ListItemIcon>
                <ListItemText primary="Scan Food" />
            </ListItem>
            <ListItem button onClick={() => setActiveTab('profile')}>
                <ListItemIcon>
                    <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
            </ListItem>
        </List>
    )

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <HomeIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" noWrap component="div">
                        Eat Good
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
            >
                {isMobile ? (
                    <Drawer
                        variant="temporary"
                        open={drawerOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            display: { xs: 'block', sm: 'none' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: 240,
                            },
                        }}
                    >
                        {drawer}
                    </Drawer>
                ) : (
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: 240,
                            },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                )}
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - 240px)` },
                    mt: 8,
                }}
            >
                <Container maxWidth="lg">
                    {activeTab === 'scan' ? (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <ImageInput onImageCapture={handleImageUpload} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                {loading ? (
                                    <LoadingSpinner />
                                ) : (
                                    <NutritionAnalysis analysis={analysisResults} />
                                )}
                            </Grid>
                        </Grid>
                    ) : (
                        <UserProfile onProfileUpdate={handleProfileUpdate} />
                    )}
                </Container>
            </Box>
        </Box>
    )
}

export default App
