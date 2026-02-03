import  { Component } from 'react';
import AuthContext from '../../../AuthProvider/AuthContext';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import { url } from '../../../Config';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Grid, TextField, MenuItem, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Chip, Toolbar, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Add as AddIcon, FilterList as FilterIcon } from '@mui/icons-material';

import EnhancedTable from './Table';
import {  Backdrop, CircularProgress } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import AssetsDelete from '../AssetForm/AssetsDelete';
import AssetsPapers from '../../Dashboards/AssetsDashboard/Components/AssetsPapers';
import { Link as RouterLink } from 'react-router-dom';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
// 定义样式组件
const HeaderCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
  color: 'white',
  borderRadius: 16,
  padding: '24px',
  marginBottom: '32px',
  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-1px)',
  },
}));

class AssetsTable extends Component {
    constructor(propos) {
        super(propos)
        this.state = {
            is_loading: true,
            assets_data : [],
            filtered_assets_data: [],
            assets_to_delete:[],
            delete_form:false,
            selectedPhase: '',
            selectedProcess: '',
            selectedProductionLine: '',
            configData: {
                phases: [],
                productionLines: [],
                processes: []
            },
            // Excel功能相关状态
            openDownloadDialog: false,
            openUploadDialog: false,
            downloadPhase: '',
            selectedFile: null,
            uploadProgress: 0,
            uploading: false,
        }
        this.refreshData = this.refreshData.bind(this)
        this.deleteAssets = this.deleteAssets.bind(this)
        this.onDeleteAssets = this.onDeleteAssets.bind(this)
        this.onclose = this.onclose.bind(this)
        this.OnUpdate = this.OnUpdate.bind(this)
    }
     refreshData() {
        this.setState({ is_loading:true},async ()=>{
            try {
                const response = await axios.get(url + '/api/v1/assets/', {
                  headers: {
                    'Authorization': "Token " + this.context.state.token
                  }
                });
               
                this.setState({ assets_data:response.data}, () => {
                    // 在获取数据后执行筛选
                    this.applyFilters();
                });
              } catch (error) {
                  
                  toast.error("Something wrong! Please try again. Hint: "+ error.response.data['detail']);
        
              } finally {
                this.setState({ is_loading: false });
              }
        })

    }
    
    applyFilters() {
        const { assets_data, selectedPhase, selectedProcess, selectedProductionLine, configData } = this.state;
        
        const filtered = assets_data.filter(asset => {
            // 如果没有选择筛选条件，则显示所有数据
            if (!selectedPhase && !selectedProcess && !selectedProductionLine) {
                return true;
            }
            
            // 检查期别筛选 - 使用code进行匹配
            if (selectedPhase) {
                // 查找对应的期别名称
                const selectedPhaseObj = configData.phases.find(p => p.code === selectedPhase);
                const selectedPhaseName = selectedPhaseObj ? selectedPhaseObj.name : null;
                if (asset.phase_name !== selectedPhaseName) {
                    return false;
                }
            }
            
            // 检查工序筛选 - 使用code进行匹配
            if (selectedProcess) {
                // 查找对应的工序名称
                const selectedProcessObj = configData.processes.find(p => p.code === selectedProcess);
                const selectedProcessName = selectedProcessObj ? selectedProcessObj.name : null;
                if (asset.process_name !== selectedProcessName) {
                    return false;
                }
            }
            
            // 检查产线筛选 - 使用code进行匹配
            if (selectedProductionLine) {
                // 查找对应的产线名称
                const selectedLineObj = configData.productionLines.find(l => l.code === selectedProductionLine);
                const selectedLineName = selectedLineObj ? selectedLineObj.name : null;
                if (asset.production_line_name !== selectedLineName) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.setState({ filtered_assets_data: filtered });
    }
    
    handleFilterChange = (filterName, value) => {
        // 根据不同的过滤器名称，决定是否需要重置其他过滤器
        const updates = { [filterName]: value };
        
        // 当产线改变时，重置工序选择
        if (filterName === 'selectedProductionLine') {
            updates.selectedProcess = '';
        }
        
        // 当期别改变时，重置产线和工序选择
        if (filterName === 'selectedPhase') {
            updates.selectedProductionLine = '';
            updates.selectedProcess = '';
        }
        
        this.setState(updates, () => {
            // 确保应用过滤器
            this.applyFilters();
            // 强制组件更新以确保UI同步
            this.forceUpdate();
        });
    }
    deleteData() {
        var tempthis= this
        this.setState({ is_loading:true},async ()=>{
            try {
                this.state.assets_to_delete.forEach(async (element) => {
                    try {
                        await axios.delete(url+ '/api/v1/assets/'+ element + '/', {
                          headers: {
                            'Authorization': "Token " + this.context.state.token
                          }
                          
                        });
                    } catch (error) {
                        
                        toast.error("Something wrong! Please try again. Hint: "+ error.response.data['detail']);
                      
                    } finally {
                        tempthis.refreshData()
                    }
                    
                });

                toast.success("Assets deleted");
                
                
                
                
            } catch (error) {
                this.setState({ is_loading: false },()=>{
                    this.refreshData()
                });
                toast.error("Something wrong! Please try again. Hint: "+ error);
               
                
            }   
           
        })

    }
    async componentDidMount() {
        // 获取配置数据
        await this.fetchConfigData();
        this.refreshData();
    }

    async fetchConfigData() {
        try {
            console.log('AssetsTable - 开始获取配置数据...');
            const token = this.context.state.token;
            console.log('AssetsTable - Token:', token ? '存在' : '不存在');
            
            const response = await axios.get(`${url}/api/maintenance/config/get-config-data/`, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
            
            console.log('AssetsTable - API响应数据:', response.data);
            
            this.setState({
                configData: {
                    phases: response.data.phases || [],
                    productionLines: response.data.productionLines || [],
                    processes: response.data.processes || []
                }
            });
            
            console.log('AssetsTable - 配置数据设置完成:', {
                phasesCount: response.data.phases?.length || 0,
                productionLinesCount: response.data.productionLines?.length || 0,
                processesCount: response.data.processes?.length || 0
            });
        } catch (error) {
            console.error('AssetsTable - 获取配置数据失败:', error);
            // 详细错误信息
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request data:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            toast.error('获取配置数据失败');
        }
    }
    OnUpdate() {

        this.refreshData()

    }
    deleteAssets(assets) {
        this.setState({delete_form:true, assets_to_delete:assets})
    }
    async onDeleteAssets() {
        this.setState({delete_form:false,is_loading:true},()=>{
         this.deleteData()
           
            
            
        })
    }
    onclose() {
        this.setState({delete_form:false})
    }
    
    // Excel功能相关方法
    handleOpenDownloadDialog = () => {
        this.setState({ openDownloadDialog: true, downloadPhase: this.state.selectedPhase });
    };

    handleCloseDownloadDialog = () => {
        this.setState({ openDownloadDialog: false, downloadPhase: '' });
    };

    handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(`${url}/api/v1/asset-excel/download-template/`, {
                headers: {
                    'Authorization': "Token " + this.context.state.token
                },
                responseType: 'blob' // 重要：指定响应类型为blob
            });
            
            // 创建下载链接
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', '资产数据模板.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
            
            toast.success('模板下载成功');
        } catch (error) {
            console.error('下载模板失败:', error);
            toast.error('下载模板失败');
        }
    };

    handleDownloadAssets = async () => {
        try {
            // 将phase code转换为phase name
            let phaseName = this.state.downloadPhase;
            if (this.state.downloadPhase && this.state.configData.phases) {
                const phaseObj = this.state.configData.phases.find(p => p.code === this.state.downloadPhase);
                if (phaseObj) {
                    phaseName = phaseObj.name;
                }
            }
            
            const response = await axios.post(`${url}/api/v1/asset-excel/download-assets/`, {
                phase: this.state.downloadPhase ? phaseName : ''  // 发送中文名称给后端
            }, {
                headers: {
                    'Authorization': "Token " + this.context.state.token,
                    'Content-Type': 'application/json',
                },
                responseType: 'blob' // 重要：指定响应类型为blob
            });
            
            // 创建下载链接
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `资产数据${this.state.downloadPhase ? '-' + phaseName : ''}.xlsx`);  // 使用中文名称作为文件名
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
            
            toast.success('资产数据下载成功');
            this.handleCloseDownloadDialog();
        } catch (error) {
            console.error('下载资产数据失败:', error);
            toast.error('下载资产数据失败');
        }
    };

    handleOpenUploadDialog = () => {
        this.setState({ openUploadDialog: true, selectedFile: null });
    };

    handleCloseUploadDialog = () => {
        this.setState({ openUploadDialog: false, selectedFile: null, uploadProgress: 0 });
    };

    handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                file.name.endsWith('.xlsx')) {
                this.setState({ selectedFile: file });
            } else {
                toast.error('请选择Excel文件(.xlsx)');
            }
        }
    };

    handleUpload = async () => {
        const { selectedFile } = this.state;
        if (!selectedFile) {
            toast.warning('请选择要上传的文件');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            this.setState({ uploading: true });

            const response = await axios.post(`${url}/api/v1/asset-excel/upload-assets/`, formData, {
                headers: {
                    'Authorization': "Token " + this.context.state.token,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    this.setState({ uploadProgress: progress });
                }
            });

            toast.success(response.data.message || '文件上传成功');
            this.handleCloseUploadDialog();
            // 重新获取记录以显示新上传的数据
            this.refreshData();
        } catch (error) {
            console.error('上传失败:', error);
            const errorMessage = error.response?.data?.error || '上传失败';
            toast.error(errorMessage);
        } finally {
            this.setState({ uploading: false, uploadProgress: 0 });
        }
    };
    render() {
       
        const breadcrumbs = [

            <RouterLink
        to={'/'}
        replace={true}

    >
        主页
    </RouterLink>,
            <Typography key="65463sds" color="text.primary">
                设备总数
            </Typography>,
        ];
        return (
            <>

                {this.state.delete_form && 
                <AssetsDelete handleClose={this.onclose} 
                HandleConfirm={this.onDeleteAssets} 
                AssetsToDelete = {this.state.assets_to_delete.length}
                ></AssetsDelete> }
                <ToastContainer></ToastContainer>

                <Container maxWidth="xl" sx={{ mt: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                    {/* 页面头部 */}
                    <HeaderCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h4" component="h1" gutterBottom>
                                    设备总数管理系统
                                </Typography>
                                <Typography variant="h6" component="p" sx={{ opacity: 0.9 }}>
                                    设备资产管理中心
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip 
                                    label="设备管理"
                                    color="default" 
                                    variant="outlined"
                                    size="large"
                                    sx={{ 
                                        bgcolor: 'rgba(255, 255, 255, 0.2)', 
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        height: '48px'
                                    }}
                                />
                                <ActionButton 
                                    variant="contained" 
                                    color="secondary"
                                    onClick={() => window.location.href = '/'} 
                                    sx={{ 
                                        px: 2,
                                        minWidth: 'auto',
                                        ml: 1
                                    }}
                                >
                                    返回主页
                                </ActionButton>
                            </Box>
                        </Box>
                        
                        <Toolbar sx={{ p: 0, minHeight: 'auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <PrecisionManufacturingIcon sx={{ color: 'white', fontSize: 32 }} />
                                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                                    设备总数
                                </Typography>
                            </Box>
                            
                            {/* Excel功能按钮组 */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Tooltip title="下载设备数据模板">
                                    <ActionButton 
                                        variant="outlined"
                                        color="inherit"
                                        startIcon={<FileDownloadIcon />}
                                        onClick={this.handleOpenDownloadDialog}
                                        sx={{ 
                                            px: 2,
                                            color: 'white',
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                            '&:hover': {
                                                borderColor: 'white',
                                                bgcolor: 'rgba(255, 255, 255, 0.1)'
                                            }
                                        }}
                                    >
                                        下载模板
                                    </ActionButton>
                                </Tooltip>
                                
                                <Tooltip title="导出当前设备数据">
                                    <ActionButton 
                                        variant="outlined"
                                        color="inherit"
                                        startIcon={<DownloadIcon />}
                                        onClick={this.handleOpenDownloadDialog}
                                        sx={{ 
                                            px: 2,
                                            color: 'white',
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                            '&:hover': {
                                                borderColor: 'white',
                                                bgcolor: 'rgba(255, 255, 255, 0.1)'
                                            }
                                        }}
                                    >
                                        导出数据
                                    </ActionButton>
                                </Tooltip>
                                
                                <Tooltip title="批量导入设备数据">
                                    <ActionButton 
                                        variant="contained"
                                        color="inherit"
                                        startIcon={<FileUploadIcon />}
                                        onClick={this.handleOpenUploadDialog}
                                        sx={{ 
                                            px: 2,
                                            color: '#1976d2',
                                            backgroundColor: 'white',
                                            '&:hover': {
                                                backgroundColor: '#f0f4f8'
                                            }
                                        }}
                                    >
                                        批量导入
                                    </ActionButton>
                                </Tooltip>
                            </Box>
                        </Toolbar>
                    </HeaderCard>

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
                    
                    <AssetsPapers
                        assets = {this.state.filtered_assets_data.length > 0 ? this.state.filtered_assets_data : this.state.assets_data}
                    ></AssetsPapers>
                    {/* <AssetsMetrics assets = {this.state.assets_data} /> */}

                    {/* 筛选控件 - 移到表格上方 */}
                    <Paper 
                        sx={{ 
                            p: { xs: 1.5, sm: 2, md: 3 }, 
                            mb: 3,
                            borderRadius: 3,
                            boxShadow: 3,
                            backgroundColor: 'background.paper',
                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.02))',
                            border: '1px solid',
                            borderColor: 'divider'
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
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#1976d2',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1976d2',
                                            },
                                        },
                                    }}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200,
                                                },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">全部</MenuItem>
                                    {!this.state.configData.phases ? (
                                        <MenuItem value="" disabled>加载中...</MenuItem>
                                    ) : (
                                        this.state.configData.phases.map((phase) => (
                                            <MenuItem key={phase.code} value={phase.code}>{phase.name}</MenuItem>
                                        ))
                                    )}
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
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#1976d2',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1976d2',
                                            },
                                        },
                                    }}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200,
                                                },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">全部</MenuItem>
                                    {(!this.state.configData.productionLines || !this.state.configData.phases) ? (
                                        <MenuItem value="" disabled>加载中...</MenuItem>
                                    ) : (
                                        this.state.configData.productionLines
                                        .filter(line => 
                                            !this.state.selectedPhase || 
                                            this.state.selectedPhase === '' ||
                                            this.state.configData.phases.find(p => p.code === this.state.selectedPhase)?.code === line.phase_code
                                        )
                                        .map((line) => (
                                            <MenuItem key={line.code} value={line.code}>{line.name}</MenuItem>
                                        ))
                                    )}
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
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#1976d2',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1976d2',
                                            },
                                        },
                                    }}
                                    SelectProps={{
                                        MenuProps: {
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200,
                                                },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">全部</MenuItem>
                                    {!this.state.configData.processes ? (
                                        <MenuItem value="" disabled>加载中...</MenuItem>
                                    ) : (
                                        this.state.configData.processes.map((process) => (
                                            <MenuItem key={process.code} value={process.code}>{process.name}</MenuItem>
                                        ))
                                    )}
                                </TextField>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper 
                        sx={{ 
                            mt: { xs: 1.5, sm: 2 }, 
                            borderRadius: 3, 
                            boxShadow: 4,
                            overflow: 'hidden',
                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.02))',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <EnhancedTable 
                            rows={this.state.filtered_assets_data.length > 0 ? this.state.filtered_assets_data : this.state.assets_data} 
                            handleDelete={this.deleteAssets}
                            OnUpdate = {this.OnUpdate}
                        ></EnhancedTable>
                    </Paper>
                </Container>
                
                {/* Excel下载对话框 */}
                <Dialog open={this.state.openDownloadDialog} onClose={this.handleCloseDownloadDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>导出资产数据</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    onClick={this.handleDownloadTemplate}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                >
                                    下载模板
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    label="选择期别"
                                    value={this.state.downloadPhase}
                                    onChange={(e) => this.setState({ downloadPhase: e.target.value })}
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                >
                                    <MenuItem value="">全部</MenuItem>
                                    {!this.state.configData.phases ? (
                                        <MenuItem value="" disabled>加载中...</MenuItem>
                                    ) : (
                                        this.state.configData.phases.map((phase) => (
                                            <MenuItem key={phase.code} value={phase.code}>{phase.name}</MenuItem>
                                        ))
                                    )}
                                </TextField>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCloseDownloadDialog}>取消</Button>
                        <Button 
                            onClick={this.handleDownloadAssets} 
                            variant="contained"
                            disabled={!this.state.downloadPhase}
                        >
                            下载资产数据
                        </Button>
                    </DialogActions>
                </Dialog>
                
                {/* Excel上传对话框 */}
                <Dialog open={this.state.openUploadDialog} onClose={this.handleCloseUploadDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>批量导入资产数据</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    请使用下载的模板填写数据，然后上传文件进行批量导入。
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <input
                                    accept=".xlsx"
                                    style={{ display: 'none' }}
                                    id="raised-button-file"
                                    type="file"
                                    onChange={this.handleFileSelect}
                                />
                                <label htmlFor="raised-button-file">
                                    <Button 
                                        variant="outlined" 
                                        component="span" 
                                        fullWidth
                                        startIcon={<UploadIcon />}
                                    >
                                        选择Excel文件
                                    </Button>
                                </label>
                                {this.state.selectedFile && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        已选择: {this.state.selectedFile.name}
                                    </Typography>
                                )}
                            </Grid>
                            {this.state.uploadProgress > 0 && (
                                <Grid item xs={12}>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={this.state.uploadProgress} 
                                        sx={{ mt: 2 }} 
                                    />
                                    <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
                                        上传进度: {this.state.uploadProgress}%
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCloseUploadDialog}>取消</Button>
                        <Button 
                            onClick={this.handleUpload} 
                            variant="contained"
                            disabled={!this.state.selectedFile || this.state.uploading}
                        >
                            {this.state.uploading ? '上传中...' : '上传'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}
AssetsTable.contextType = AuthContext;
export default AssetsTable;