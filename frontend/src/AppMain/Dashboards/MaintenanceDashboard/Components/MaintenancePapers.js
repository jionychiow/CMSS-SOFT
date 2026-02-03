import React, { Component } from 'react';
import Paper from '@mui/material/Paper';
import { Grid, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import {  BlurOnRounded } from '@mui/icons-material';
import Stack from '@mui/material/Stack';
import DangerousIcon from '@mui/icons-material/Dangerous';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
class MaintenancePapers extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        const { maintenances } = this.props

        let pending = maintenances.filter((m)=>m.status === "Pending").length
        let in_progress = maintenances.filter((m)=>m.status === "In Progress").length
        let completed = maintenances.filter((m)=>m.status === "Completed").length
        let cancelled = maintenances.filter((m)=>m.status === "Cancelled").length
        
        return (
            <>
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                height: { xs: 130, sm: 140, md: 150 }, 
                                width: "100%", 
                                p: { xs: 1, sm: 1.5, md: 2 }, 
                                bgcolor: 'success.main',
                                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1, md: 2 }}
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <BlurOnRounded 
                                    sx={{ 
                                        color: 'white', 
                                        width: { xs: 28, sm: 32, md: 36 }, 
                                        height: { xs: 28, sm: 32, md: 36 } 
                                    }} 
                                />
                                <div style={{ textAlign: { xs: 'center', sm: 'right' } }}>
                                    <Typography 
                                        variant={{ xs: 'body2', sm: 'body1', md: 'button' }} 
                                        sx={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        待处理
                                    </Typography>
                                    <Typography 
                                        variant={{ xs: 'h6', sm: 'h5', md: 'h4' }} 
                                        sx={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        {pending}
                                    </Typography>
                                </div>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                height: { xs: 130, sm: 140, md: 150 }, 
                                width: "100%", 
                                p: { xs: 1, sm: 1.5, md: 2 }, 
                                bgcolor: 'info.main',
                                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1, md: 2 }}
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <ConstructionIcon 
                                    sx={{ 
                                        color: 'white', 
                                        width: { xs: 28, sm: 32, md: 36 }, 
                                        height: { xs: 28, sm: 32, md: 36 } 
                                    }} 
                                />
                                <div style={{ textAlign: { xs: 'center', sm: 'right' } }}>
                                    <Typography 
                                        variant={{ xs: 'body2', sm: 'body1', md: 'button' }} 
                                        sx={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        进行中
                                    </Typography>
                                    <Typography 
                                        variant={{ xs: 'h6', sm: 'h5', md: 'h4' }} 
                                        sx={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        {in_progress}
                                    </Typography>
                                </div>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                height: { xs: 130, sm: 140, md: 150 }, 
                                width: "100%", 
                                p: { xs: 1, sm: 1.5, md: 2 }, 
                                bgcolor: 'secondary.main',
                                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1, md: 2 }}
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <BookmarkAddedIcon 
                                    sx={{ 
                                        color: 'white', 
                                        width: { xs: 28, sm: 32, md: 36 }, 
                                        height: { xs: 28, sm: 32, md: 36 } 
                                    }} 
                                />
                                <div style={{ textAlign: { xs: 'center', sm: 'right' } }}>
                                    <Typography 
                                        variant={{ xs: 'body2', sm: 'body1', md: 'button' }} 
                                        sx={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        已完成
                                    </Typography>
                                    <Typography 
                                        variant={{ xs: 'h6', sm: 'h5', md: 'h4' }} 
                                        sx={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        {completed}
                                    </Typography>
                                </div>
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper 
                            elevation={3} 
                            sx={{ 
                                height: { xs: 130, sm: 140, md: 150 }, 
                                width: "100%", 
                                p: { xs: 1, sm: 1.5, md: 2 }, 
                                bgcolor: 'error.main',
                                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1, md: 2 }}
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <DangerousIcon 
                                    sx={{ 
                                        color: 'white', 
                                        width: { xs: 28, sm: 32, md: 36 }, 
                                        height: { xs: 28, sm: 32, md: 36 } 
                                    }} 
                                />
                                <div style={{ textAlign: { xs: 'center', sm: 'right' } }}>
                                    <Typography 
                                        variant={{ xs: 'body2', sm: 'body1', md: 'button' }} 
                                        sx={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        已取消
                                    </Typography>
                                    <Typography 
                                        variant={{ xs: 'h6', sm: 'h5', md: 'h4' }} 
                                        sx={{ color: 'white', fontWeight: 'bold' }}
                                    >
                                        {cancelled}
                                    </Typography>
                                </div>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </>
        );
    }
}

export default MaintenancePapers;