import React, { Component } from 'react';
import Paper from '@mui/material/Paper';
import { Grid, Typography, Avatar, Card, CardContent } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import BlurOnRounded from '@mui/icons-material/BlurOnRounded';
import Stack from '@mui/material/Stack';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import ElderlyIcon from '@mui/icons-material/Elderly';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  [theme.breakpoints.down('sm')]: {
    margin: '4px 0',
  },
}));

class AssetsPapers extends Component {
    render() {
        const { assets } = this.props
        let total_assets = assets.length
        // 计算各种状态的资产数量，即使未在UI中直接使用
        // eslint-disable-next-line no-unused-vars
        const activeCount = assets.filter((asset) => asset.status === "Active").length;
        // eslint-disable-next-line no-unused-vars
        const inactiveCount = assets.filter((asset) => asset.status === "Inactive").length;
        let under_maintenance = assets.filter((asset) => asset.status === "Under Maintenance").length
        let out_of_warranty = assets.filter((asset) => new Date(asset.warranty_expiration_date).getTime() < new Date().getTime() && asset.status !== "Retired").length
        let retired_assets = assets.filter((asset) => asset.status === "Retired").length

        return (
            <>
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <RouterLink 
                            to="/cmms/assets" 
                            style={{ 
                                textDecoration: 'none', 
                                color: 'inherit' 
                            }}
                        >
                            <StatCard>
                                <CardContent>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1, md: 2 }}
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Avatar sx={{ bgcolor: '#4caf50', width: { xs: 36, sm: 40, md: 44 }, height: { xs: 36, sm: 40, md: 44 } }}>
                                            <BlurOnRounded />
                                        </Avatar>
                                        <div style={{ textAlign: { xs: 'center', sm: 'right' } }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                                            {total_assets}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                            所有设备
                                        </Typography>
                                        </div>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        包含已退役设备
                                    </Typography>
                                </CardContent>
                            </StatCard>
                        </RouterLink>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard>
                            <CardContent>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1, md: 2 }}
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Avatar sx={{ bgcolor: '#2196f3', width: { xs: 36, sm: 40, md: 44 }, height: { xs: 36, sm: 40, md: 44 } }}>
                                        <ConstructionIcon />
                                    </Avatar>
                                    <div style={{ textAlign: { xs: 'center', sm: 'right' } }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196f3', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                                            {under_maintenance}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                            维护中设备
                                        </Typography>
                                    </div>
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: { xs: 'center', sm: 'right' } }}>
                                    正在维护的所有设备
                                </Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard>
                            <CardContent>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1, md: 2 }}
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Avatar sx={{ bgcolor: '#ff9800', width: { xs: 36, sm: 40, md: 44 }, height: { xs: 36, sm: 40, md: 44 } }}>
                                        <DocumentScannerIcon />
                                    </Avatar>
                                    <div style={{ textAlign: { xs: 'center', sm: 'right' } }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                                            {out_of_warranty}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                            保修期外资产
                                        </Typography>
                                    </div>
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: { xs: 'center', sm: 'right' } }}>
                                    没有保修的所有资产
                                </Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard>
                            <CardContent>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1, md: 2 }}
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Avatar sx={{ bgcolor: '#f44336', width: { xs: 36, sm: 40, md: 44 }, height: { xs: 36, sm: 40, md: 44 } }}>
                                        <ElderlyIcon />
                                    </Avatar>
                                    <div style={{ textAlign: { xs: 'center', sm: 'right' } }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336', fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                                            {retired_assets}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                            已退役设备
                                        </Typography>
                                    </div>
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: { xs: 'center', sm: 'right' } }}>
                                    所有没用再使用的设备
                                </Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                </Grid>
            </>
        );
    }
}

export default AssetsPapers;