import { Component } from 'react';
import AuthContext from '../../../AuthProvider/AuthContext';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import RouterLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { url } from '../../../Config';
import EnhancedTable from './Table';

import { Backdrop, CircularProgress, Container, Paper, Grid, TextField, MenuItem, Box } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import MaintenancePapers from '../../Dashboards/MaintenanceDashboard/Components/MaintenancePapers';
import ConstructionIcon from '@mui/icons-material/Construction';

class MaintenanceTable extends Component {
    static contextType = AuthContext;
    
    constructor(props) {
        super(props);
        this.state = {
            is_loading: true,
            maintenance_data: [],
            filtered_maintenance_data: [],
            maintenances_to_delete: [],
            delete_form: false,
            assets: [],
            users: [],
            selectedPhase: '',
            selectedProductionLine: '',
            selectedProcess: ''
        };
        this.refreshData = this.refreshData.bind(this);
        this.deleteMaintenances = this.deleteMaintenances.bind(this);
        this.onDeleteMaintenances = this.onDeleteMaintenances.bind(this);
        this.onclose = this.onclose.bind(this);
        this.OnUpdate = this.OnUpdate.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
    }

    refreshData() {
        this.setState({ ...this.state, is_loading: true }, async () => {
            try {
                const response = await axios.get(url + '/api/v1/maintenances/', {
                    headers: {
                        'Authorization': "Token " + this.context.state.token
                    }
                });
                const response2 = await axios.get(url + '/api/v1/assets/', {
                    headers: {
                        'Authorization': "Token " + this.context.state.token
                    }
                });
                const response3 = await axios.get(url + '/api/v1/profile-users/', {
                    headers: {
                        'Authorization': "Token " + this.context.state.token
                    }
                });

                this.setState({
                    ...this.state,
                    maintenance_data: response.data,
                    filtered_maintenance_data: response.data,
                    assets: response2.data,
                    users: response3.data
                });
            } catch (error) {
                toast.error("出现问题！请重试。提示：" + error.response?.data?.['detail'] || error.message);
            } finally {
                this.setState({ is_loading: false });
            }
        });
    }

    async componentDidMount() {
        this.refreshData();
    }

    OnUpdate() {
        this.refreshData();
    }

    deleteMaintenances(maintenances) {
        this.setState({ ...this.state, delete_form: true, maintenances_to_delete: maintenances });
    }

    async onDeleteMaintenances() {
        this.setState({ ...this.state, delete_form: false, is_loading: true }, () => {
            this.deleteData();
        });
    }

    deleteData() {
        var tempthis = this;
        this.setState({ ...this.state, is_loading: true }, async () => {
            try {
                this.state.maintenances_to_delete.forEach(async (element) => {
                    try {
                        await axios.delete(url + '/api/v1/maintenances/' + element + '/', {
                            headers: {
                                'Authorization': "Token " + this.context.state.token
                            }
                        });
                    } catch (error) {
                        toast.error("出现问题！请重试。提示：" + error.response?.data?.['detail'] || error.message);
                    } finally {
                        tempthis.refreshData();
                    }
                });

                toast.success("维修记录已删除");
            } catch (error) {
                this.setState({ is_loading: false }, () => {
                    this.refreshData();
                });
                toast.error("出现问题！请重试。错误信息：" + error.message);
            }
        });
    }

    onclose() {
        this.setState({ ...this.state, delete_form: false });
    }

    handleFilterChange(fieldName, value) {
        this.setState(prevState => {
            const newState = { ...prevState, [fieldName]: value };
            
            // Apply filters based on current selections
            let filteredData = [...this.state.maintenance_data];
            
            if (newState.selectedPhase) {
                filteredData = filteredData.filter(item => item.phase === newState.selectedPhase);
            }
            
            if (newState.selectedProductionLine) {
                filteredData = filteredData.filter(item => item.production_line === newState.selectedProductionLine);
            }
            
            if (newState.selectedProcess) {
                filteredData = filteredData.filter(item => item.process === newState.selectedProcess);
            }
            
            newState.filtered_maintenance_data = filteredData;
            
            return newState;
        });
    }

    render() {
        const breadcrumbs = [
            <RouterLink
                underline="hover"
                key="2"
                color="inherit"
                href="/"
            >
                首页
            </RouterLink>,
            <Typography key="3" color="text.primary">
                维修记录
            </Typography>,
        ];

        return (
            <>
                <ToastContainer></ToastContainer>

                <Container maxWidth="xl" sx={{ mt: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                        <Stack spacing={2} justifyContent={{ xs: 'flex-start', sm: 'space-between' }} 
                              direction={{ xs: 'column', sm: 'row' }} 
                              alignItems={{ xs: 'flex-start', sm: 'center'}}
                              sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: { xs: 1, sm: 0 } }}>
                                <ConstructionIcon sx={{ color: '#1976d2', fontSize: { xs: 24, sm: 28, md: 32, lg: 36 } }} />
                                <Typography variant={{ xs: 'h6', sm: 'h5', md: 'h4', lg: 'h3' }} component="h1" sx={{ fontWeight: 'bold' }}>
                                    维修记录
                                </Typography>
                            </Stack>
                            <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ display: { xs: 'none', md: 'flex' } }}>
                                {breadcrumbs}
                            </Breadcrumbs>
                        </Stack>
                    </Box>

                    <Backdrop
                        sx={{ 
                            color: '#fff', 
                            zIndex: (theme) => theme.zIndex.drawer + 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.3)'
                        }}
                        open={this.state.is_loading}
                    >
                        <CircularProgress sx={{ color: '#1976d2' }} />
                    </Backdrop>
                    
                    <MaintenancePapers maintenances={this.state.filtered_maintenance_data.length > 0 ? this.state.filtered_maintenance_data : this.state.maintenance_data}></MaintenancePapers>

                    {/* 筛选控件 - 移到表格上方 */}
                    <Paper 
                        sx={{ 
                            p: { xs: 2, sm: 3, md: 4 }, 
                            mb: 3,
                            borderRadius: 4,
                            boxShadow: 6,
                            backgroundColor: 'background.paper',
                            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))',
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'box-shadow 0.3s ease, transform 0.2s ease',
                            '&:hover': {
                                boxShadow: 8,
                                transform: 'translateY(-2px)',
                            }
                        }}
                    >
                        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} alignItems="center">
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <TextField
                                    select
                                    label="期别"
                                    value={this.state.selectedPhase}
                                    onChange={(e) => this.handleFilterChange('selectedPhase', e.target.value)}
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                                borderWidth: '1px',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#1976d2',
                                                borderWidth: '1.5px',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1976d2',
                                                borderWidth: '1.5px',
                                            },
                                        },
                                        '& .MuiSelect-select': {
                                            py: '10px',
                                            px: '14px',
                                        }
                                    }}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200,
                                                    borderRadius: '8px',
                                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                                                },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="" sx={{ fontWeight: 'bold' }}>全部</MenuItem>
                                    <MenuItem value="一期" sx={{ fontWeight: 'regular' }}>一期</MenuItem>
                                    <MenuItem value="二期" sx={{ fontWeight: 'regular' }}>二期</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <TextField
                                    select
                                    label="产线"
                                    value={this.state.selectedProductionLine}
                                    onChange={(e) => this.handleFilterChange('selectedProductionLine', e.target.value)}
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    disabled={!this.state.selectedPhase} // Disable if no phase selected
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                                borderWidth: '1px',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#1976d2',
                                                borderWidth: '1.5px',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1976d2',
                                                borderWidth: '1.5px',
                                            },
                                        },
                                        '& .MuiSelect-select': {
                                            py: '10px',
                                            px: '14px',
                                        }
                                    }}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200,
                                                    borderRadius: '8px',
                                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                                                },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="" sx={{ fontWeight: 'bold' }}>全部</MenuItem>
                                    {this.state.selectedPhase === '一期' && [
                                        // 一期产线
                                        <MenuItem key="1#" value="1#" sx={{ fontWeight: 'regular' }}>1#</MenuItem>,
                                        <MenuItem key="2#" value="2#" sx={{ fontWeight: 'regular' }}>2#</MenuItem>,
                                        <MenuItem key="3#" value="3#" sx={{ fontWeight: 'regular' }}>3#</MenuItem>,
                                        <MenuItem key="4#" value="4#" sx={{ fontWeight: 'regular' }}>4#</MenuItem>,
                                        <MenuItem key="5#" value="5#" sx={{ fontWeight: 'regular' }}>5#</MenuItem>,
                                        <MenuItem key="6#" value="6#" sx={{ fontWeight: 'regular' }}>6#</MenuItem>,
                                        <MenuItem key="7#" value="7#" sx={{ fontWeight: 'regular' }}>7#</MenuItem>,
                                        <MenuItem key="8#" value="8#" sx={{ fontWeight: 'regular' }}>8#</MenuItem>,
                                        <MenuItem key="9#" value="9#" sx={{ fontWeight: 'regular' }}>9#</MenuItem>,
                                        <MenuItem key="10#" value="10#" sx={{ fontWeight: 'regular' }}>10#</MenuItem>
                                    ]}
                                    {this.state.selectedPhase === '二期' && [
                                        // 二期产线
                                        <MenuItem key="2-1#" value="2-1#" sx={{ fontWeight: 'regular' }}>2-1#</MenuItem>,
                                        <MenuItem key="2-2#" value="2-2#" sx={{ fontWeight: 'regular' }}>2-2#</MenuItem>,
                                        <MenuItem key="2-3#" value="2-3#" sx={{ fontWeight: 'regular' }}>2-3#</MenuItem>,
                                        <MenuItem key="2-4#" value="2-4#" sx={{ fontWeight: 'regular' }}>2-4#</MenuItem>,
                                        <MenuItem key="2-5#" value="2-5#" sx={{ fontWeight: 'regular' }}>2-5#</MenuItem>,
                                        <MenuItem key="2-6#" value="2-6#" sx={{ fontWeight: 'regular' }}>2-6#</MenuItem>,
                                        <MenuItem key="2-7#" value="2-7#" sx={{ fontWeight: 'regular' }}>2-7#</MenuItem>,
                                        <MenuItem key="2-8#" value="2-8#" sx={{ fontWeight: 'regular' }}>2-8#</MenuItem>,
                                        <MenuItem key="2-9#" value="2-9#" sx={{ fontWeight: 'regular' }}>2-9#</MenuItem>
                                    ]}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <TextField
                                    select
                                    label="工序"
                                    value={this.state.selectedProcess}
                                    onChange={(e) => this.handleFilterChange('selectedProcess', e.target.value)}
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    disabled={!this.state.selectedPhase || !this.state.selectedProductionLine} // Disable if no phase or production line selected
                                    InputLabelProps={{
                                        shrink: true
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                                borderWidth: '1px',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#1976d2',
                                                borderWidth: '1.5px',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1976d2',
                                                borderWidth: '1.5px',
                                            },
                                        },
                                        '& .MuiSelect-select': {
                                            py: '10px',
                                            px: '14px',
                                        }
                                    }}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200,
                                                    borderRadius: '8px',
                                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                                                },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="" sx={{ fontWeight: 'bold' }}>全部</MenuItem>
                                    <MenuItem value="PL" sx={{ fontWeight: 'regular' }}>PL</MenuItem>
                                    <MenuItem value="N1" sx={{ fontWeight: 'regular' }}>N1</MenuItem>
                                    <MenuItem value="N2" sx={{ fontWeight: 'regular' }}>N2</MenuItem>
                                    <MenuItem value="S1" sx={{ fontWeight: 'regular' }}>S1</MenuItem>
                                    <MenuItem value="F1" sx={{ fontWeight: 'regular' }}>F1</MenuItem>
                                    <MenuItem value="F2" sx={{ fontWeight: 'regular' }}>F2</MenuItem>
                                    <MenuItem value="CF" sx={{ fontWeight: 'regular' }}>CF</MenuItem>
                                    <MenuItem value="B" sx={{ fontWeight: 'regular' }}>B</MenuItem>
                                    <MenuItem value="BZ" sx={{ fontWeight: 'regular' }}>BZ</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper 
                        sx={{ 
                            mt: { xs: 1.5, sm: 2 }, 
                            borderRadius: 4, 
                            boxShadow: 8,
                            overflow: 'hidden',
                            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'box-shadow 0.3s ease, transform 0.2s ease',
                            '&:hover': {
                                boxShadow: 12,
                                transform: 'translateY(-1px)',
                            }
                        }}
                    >
                        <EnhancedTable 
                            rows={this.state.filtered_maintenance_data.length > 0 ? this.state.filtered_maintenance_data : this.state.maintenance_data} 
                            handleDelete={this.deleteMaintenances}
                            OnUpdate={this.OnUpdate}
                            assets={this.state.assets}
                            users={this.state.users}
                        ></EnhancedTable>
                    </Paper>
                </Container>
            </>
        );
    }
}

MaintenanceTable.contextType = AuthContext;
export default MaintenanceTable;