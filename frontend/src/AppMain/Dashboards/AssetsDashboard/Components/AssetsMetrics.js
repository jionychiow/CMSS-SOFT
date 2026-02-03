import React, { Component } from 'react';
import { Grid, Typography, Card, CardContent } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { styled } from '@mui/material/styles';

const MetricCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

class AssetsMetrics extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        const {assets} = this.props
        let total_assets = assets.length
        let active_assets = assets.filter((asset)=>asset.status==="Active").length
        let retired_assets = assets.filter((asset)=>asset.status==="Retired").length
        let inactive_assets = assets.filter((asset) => asset.status === "Inactive").length
        let under_maintenance = assets.filter((asset)=>asset.status==="Under Maintenance").length
        let out_of_warranty = assets.filter((asset)=>new Date(asset.warranty_expiration_date).getTime() < new Date().getTime() && asset.status!=="Retired").length
        
        let retired_percentage = total_assets!==0?parseInt(((retired_assets/total_assets))*100):0
        let tota_active_asset = active_assets + under_maintenance
        let out_of_warranty_percentage = tota_active_asset!==0?parseInt((1-(out_of_warranty/tota_active_asset))*100):0
        let under_maintenance_percentage = tota_active_asset!==0?parseInt(((under_maintenance/tota_active_asset))*100):0
        
        let active_assets_percentage = total_assets!==0? parseInt((((tota_active_asset )/total_assets))*100): 0
        return (
            <>
                 <Grid container spacing={3} sx={{mb: 3}}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MetricCard>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    激活资产
                                </Typography>
                                <Gauge 
                                    width={150} 
                                    height={150} 
                                    value={active_assets_percentage} 
                                    sx={(theme) => ({
                                        [`& .${gaugeClasses.valueText}`]: {
                                            fontSize: 30,
                                        },
                                        [`& .${gaugeClasses.valueArc}`]: {
                                            fill: active_assets_percentage >= 75 ?'#4caf50':'#f44336',
                                        },
                                        [`& .${gaugeClasses.referenceArc}`]: {
                                            fill: '#e0e0e0',
                                        },
                                        margin: '0 auto',
                                        display: 'block'
                                    })}
                                />
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        textAlign: 'center',
                                        color: active_assets_percentage >= 75 ? '#4caf50' : '#f44336',
                                        mt: 1
                                    }} 
                                    gutterBottom
                                >
                                    {active_assets_percentage >= 75 ?'良好':'需关注'}
                                </Typography>
                            </CardContent>
                        </MetricCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MetricCard>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    保修期内
                                </Typography>
                                <Gauge 
                                    width={150} 
                                    height={150} 
                                    value={out_of_warranty_percentage} 
                                    sx={(theme) => ({
                                        [`& .${gaugeClasses.valueText}`]: {
                                            fontSize: 30,
                                        },
                                        [`& .${gaugeClasses.valueArc}`]: {
                                            fill: out_of_warranty_percentage >= 75 ?'#4caf50':'#f44336',
                                        },
                                        [`& .${gaugeClasses.referenceArc}`]: {
                                            fill: '#e0e0e0',
                                        },
                                        margin: '0 auto',
                                        display: 'block'
                                    })}
                                />
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        textAlign: 'center',
                                        color: out_of_warranty_percentage >= 75 ? '#4caf50' : '#f44336',
                                        mt: 1
                                    }} 
                                    gutterBottom
                                >
                                    {out_of_warranty_percentage >= 75 ?'良好':'需关注'}
                                </Typography>
                            </CardContent>
                        </MetricCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MetricCard>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    维护中
                                </Typography>
                                <Gauge 
                                    width={150} 
                                    height={150} 
                                    value={under_maintenance_percentage} 
                                    sx={(theme) => ({
                                        [`& .${gaugeClasses.valueText}`]: {
                                            fontSize: 30,
                                        },
                                        [`& .${gaugeClasses.valueArc}`]: {
                                            fill: under_maintenance_percentage <= 25 ?'#4caf50':'#f44336',
                                        },
                                        [`& .${gaugeClasses.referenceArc}`]: {
                                            fill: '#e0e0e0',
                                        },
                                        margin: '0 auto',
                                        display: 'block'
                                    })}
                                />
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        textAlign: 'center',
                                        color: under_maintenance_percentage <= 25 ? '#4caf50' : '#f44336',
                                        mt: 1
                                    }} 
                                    gutterBottom
                                >
                                    {under_maintenance_percentage <= 25 ?'正常':'需关注'}
                                </Typography>
                            </CardContent>
                        </MetricCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <MetricCard>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    已退役资产
                                </Typography>
                                <Gauge 
                                    width={150} 
                                    height={150} 
                                    value={retired_percentage} 
                                    sx={(theme) => ({
                                        [`& .${gaugeClasses.valueText}`]: {
                                            fontSize: 30,
                                        },
                                        [`& .${gaugeClasses.valueArc}`]: {
                                            fill: '#2196f3',
                                        },
                                        [`& .${gaugeClasses.referenceArc}`]: {
                                            fill: '#e0e0e0',
                                        },
                                        margin: '0 auto',
                                        display: 'block'
                                    })}
                                />
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        textAlign: 'center',
                                        color: '#2196f3',
                                        mt: 1
                                    }} 
                                    gutterBottom
                                >
                                    状态正常
                                </Typography>
                            </CardContent>
                        </MetricCard>
                    </Grid>
                </Grid>
            </>
        );
    }
}

export default AssetsMetrics;