import React, { Component } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Grid, Card, CardContent, CardHeader } from '@mui/material';
import {Typography} from '@mui/material';
const XcongifCosts = [
    { 
        data: ['采购成本 $', '当前价值 $','折旧 -$'], 
        scaleType: 'band' ,
        label: '资产成本和价值 $',
        colorMap: {
            type: 'ordinal',
            colors: ['#2e7d32', '#2b8cbe', '#d32f2f', '#9c27b0', '#2b8cbe', 'black']
        },
        categoryGapRatio: 0.6
    }
]

const XconfigAllmetric =  [
    {
        data: ['总计','激活', '未激活', '维护中', '保修期','已退役'], 
        label: '资产状态', 
        scaleType: 'band', 
        colorMap: {
            type: 'ordinal',
            colors: ['#2e7d32', '#ed6c02', '#d32f2f', '#9c27b0', '#2b8cbe', 'grey']
        }
    }]



class AssetsGraphs extends Component {
    constructor(props) {
        super(props)
    }
    render() {
     

        const { assets } = this.props
        let total_assets = assets.length
        let active_assets = assets.filter((asset) => asset.status === "Active" || asset.status === "Under Maintenance").length
        let retired_assets = assets.filter((asset) => asset.status === "Retired").length
        let inactive_assets = assets.filter((asset) => asset.status === "Inactive").length
        
        let under_maintenance = assets.filter((asset) => asset.status === "Under Maintenance").length
        let out_of_warranty = assets.filter((asset) => new Date(asset.warranty_expiration_date).getTime() < new Date().getTime() && asset.status!=="Retired").length
        let purchase_value = 0
        let now_value = 0
        assets.forEach(element => {
           
            element.cost? purchase_value += parseInt(element.cost) :purchase_value=purchase_value
            element.current_value?now_value += parseInt(element.current_value):now_value += now_value
          
        });
        let depreciation = purchase_value - now_value
    
        return (
            <>
                <Grid container spacing={3} sx={{ mb: 2 }}>
                    <Grid size={{ md: 12, xs: 12, lg: 6 }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardHeader 
                                title={
                                    <Typography variant="h6" fontWeight="bold">
                                        资产状态详情
                                    </Typography>
                                }
                                sx={{ pb: 1 }}
                            />
                            <CardContent sx={{ flex: 1, pt: 0 }}>
                                <BarChart
                                    series={[{ data: [total_assets,active_assets, inactive_assets, under_maintenance, out_of_warranty,retired_assets] },]}
                                    height={350}
                                    xAxis={XconfigAllmetric}              
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ md: 12, xs: 12, lg: 6 }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardHeader 
                                title={
                                    <Typography variant="h6" fontWeight="bold">
                                        资产值详情
                                    </Typography>
                                }
                                sx={{ pb: 1 }}
                            />
                            <CardContent sx={{ flex: 1, pt: 0 }}>
                                <BarChart
                                    series={[{ data: [purchase_value, now_value,depreciation], },]}
                                    height={350}
                                    xAxis={XcongifCosts}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </>
        );
    }
}

export default AssetsGraphs;