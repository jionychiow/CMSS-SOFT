import * as React from 'react';
import { url } from '../../../Config';

import {
    Button,
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Drawer,
    Paper,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import AuthContext from '../../../AuthProvider/AuthContext';
import { Grid } from '@mui/material';
import { Backdrop, CircularProgress, MenuItem, TextField } from '@mui/material';
import axios from 'axios';

function formatDateForInput(date) {
    const d = new Date(date);
    const pad = (n) => n < 10 ? '0' + n : n;
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}
class AssetEditForm extends React.Component {
    constructor(props) {
        super(props);
        const { asset } = props;  // Receive the asset object from props
        this.state = {
            is_loading: false,
            name: asset?.name || '',
            ref: asset?.ref || '',
            photo: null,
            status: asset?.status || 'Active',
            phase: asset?.phase || '',
            process: asset?.process || '', // Add process field
            production_line: asset?.production_line || '', // Add production_line field
            menu_open: true,
            configData: {
                phases: [],
                productionLines: [],
                processes: []
            }
        };
        this.isBadForm = this.isBadForm.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.fetchConfigData = this.fetchConfigData.bind(this);
    }

    handleDateChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: formatDateForInput(value) });
    };
    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    handleFileChange = (e) => {
        if (e.target.files[0].size > 2000000) {
            toast.error('The uploaded file is bigger than 2MB\nPlease select another file')
            this.setState({ photo: '' });

        }
        else
            this.setState({ photo: e.target.files[0] });
    };
    handleClose() {
        this.setState({ ...this.state, menu_open: false })
    }
    handleRegister = async () => {
        if (this.isBadForm()) return;
        this.setState({ is_loading: true });
        
        try {
            const { asset } = this.props;  // Get the asset object from props
            
            // 构建要发送的数据对象
            const submitData = {
                name: this.state.name,
                ref: this.state.ref,
                status: this.state.status,
                // 发送代码字段而不是对象
                phase_code: this.getPhaseCodeByName(this.state.phase),
                process_code: this.getProcessCodeByName(this.state.process),
                production_line_code: this.getProductionLineCodeByName(this.state.production_line)
            };
            
            // 只有在编辑模式下且原始资产有值时才添加uuid
            if (asset && asset.uuid) {
                submitData.uuid = asset.uuid;
            }
            
            // 如果有图片文件，则单独处理
            const formData = new FormData();
            Object.keys(submitData).forEach(key => {
                if (submitData[key]) {
                    formData.append(key, submitData[key]);
                }
            });
            
            // 添加图片文件（如果有的话）
            if (this.state.photo) {
                formData.append('photo', this.state.photo);
            }

            const method = asset ? 'patch' : 'post';
            const apiURL = url + '/api/v1/assets/' + (asset ? `${asset.uuid}/` : '');

            await axios({
                method: method,
                url: apiURL,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': "Token " + this.context.state.token
                }
            });

            toast.success(`Asset ${asset ? 'updated' : 'created'}`);
            if (this.props.OnUpdate)
                this.props.OnUpdate()
        } catch (error) {
            console.log(error);
            let errorMessage = "出现问题！请重试。";
            if (error.response && error.response.data) {
                if (error.response.data.detail) {
                    errorMessage += ` 提示：${error.response.data.detail}`;
                } else if (typeof error.response.data === 'object') {
                    // 显示详细的验证错误
                    const errorDetails = Object.entries(error.response.data)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('; ');
                    errorMessage += ` 详情：${errorDetails}`;
                }
            }
            toast.error(errorMessage);
        } finally {
            this.setState({ is_loading: false });
        }
    };
    async fetchConfigData() {
        try {
            console.log('AssetEditForm - 开始获取配置数据...');
            const token = this.context.state.token;
            console.log('AssetEditForm - Token:', token ? '存在' : '不存在');
            
            const response = await axios.get(`${url}/api/maintenance/config/get-config-data/`, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
            
            console.log('AssetEditForm - API响应数据:', response.data);
            
            this.setState({
                configData: {
                    phases: response.data.phases || [],
                    productionLines: response.data.productionLines || [],
                    processes: response.data.processes || []
                }
            });
            
            console.log('AssetEditForm - 配置数据设置完成:', {
                phasesCount: response.data.phases?.length || 0,
                productionLinesCount: response.data.productionLines?.length || 0,
                processesCount: response.data.processes?.length || 0
            });
        } catch (error) {
            console.error('AssetEditForm - 获取配置数据失败:', error);
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

    // 辅助方法：根据名称获取对应代码
    getPhaseCodeByName = (name) => {
        if (!name) return null;
        const phase = this.state.configData.phases.find(p => p.name === name);
        return phase ? phase.code : null;
    };

    getProductionLineCodeByName = (name) => {
        if (!name) return null;
        const line = this.state.configData.productionLines.find(l => l.name === name);
        return line ? line.code : null;
    };

    getProcessCodeByName = (name) => {
        if (!name) return null;
        const process = this.state.configData.processes.find(p => p.name === name);
        return process ? process.code : null;
    };

    isBadForm() {
        const { name, ref } = this.state; // 只有name和ref是必填字段
        if (!name || !ref) {
            toast.error("请填写所有必填字段");
            return true;
        }
        return false;
    }
    async componentDidMount() {
        // 获取配置数据
        await this.fetchConfigData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.asset !== this.props.asset) {
            const asset = this.props.asset;

            this.setState({
                name: asset?.name || '',
                ref: asset?.ref || '',
                photo: null,
                status: asset?.status || 'Active',
                phase: asset?.phase || '',
                process: asset?.process || '',
                production_line: asset?.production_line || '',
            });
        }
    }

    render() {
        const { asset } = this.props;
        return (
            <>
                <Drawer
                    anchor="right"
                    open={this.props.show}
                    onClose={this.props.handleClose}
                    PaperProps={{
    sx: {
      width: "50vw",       // main width
      minWidth: 420,        // consistent min width
      maxWidth: 720,        // consistent max width
      display: "flex",
      flexDirection: "column",
      bgcolor: "background.default",
    }
  }}
                    ModalProps={{ keepMounted: true }}
                >
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 10 }}
                        open={this.state.is_loading}
                    >
                        <CircularProgress />
                    </Backdrop>
                    <AppBar
                        elevation={0}
                        color="default"
                        sx={{
                            borderBottom: "1px solid",
                            borderColor: (theme) => theme.palette.divider,
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                        }}
                    >
                        <Toolbar>
                            <IconButton edge="start" onClick={this.props.handleClose}>
                                <CloseIcon />
                            </IconButton>

                            <Typography sx={{ flex: 1 }} variant="h6">
                                {asset ? "编辑设备" : "新建设备"}
                            </Typography>

                            <Button variant="contained" onClick={this.handleRegister}>
                                {asset ? "保存" : "创建"}
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            px: 0,
                            py: 0,
                        }}
                    >

                        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>

  {/* SECTION 1 — DEVICE INFORMATION */}
  <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
    <Typography variant="h6" fontWeight={600}>设备信息</Typography>
    <Divider sx={{ my: 2 }} />

    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          label="设备型号"
          name="name"
          fullWidth
          value={this.state.name}
          onChange={this.handleChange}
        />
      </Grid>

      <Grid size={12}>
        <TextField
          label="设备编码"
          name="ref"
          fullWidth
          value={this.state.ref}
          onChange={this.handleChange}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="期别"
          name="phase"
          select
          fullWidth
          value={this.state.phase}
          onChange={(e) => {
            const phaseValue = e.target.value;
            this.setState({ 
              phase: phaseValue,
              // Reset dependent fields when phase changes
              production_line: '',
              process: ''
            });
          }}
        >
          {this.state.configData.phases.map((phase) => (
            <MenuItem key={phase.code} value={phase.name}>{phase.name}</MenuItem>
          ))}
        </TextField>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="产线"
          name="production_line"
          select
          fullWidth
          value={this.state.production_line}
          onChange={(e) => {
            const value = e.target.value;
            this.setState({ 
              production_line: value,
              // Also reset process when production line changes
              process: ''
            });
          }}
          disabled={!this.state.phase} // Disable if no phase selected
        >
          <MenuItem value="">请选择</MenuItem>
          {this.state.configData.productionLines
            .filter(line => 
              !this.state.phase || 
              this.state.configData.phases.find(p => p.name === this.state.phase)?.code === line.phase_code
            )
            .map((line) => (
              <MenuItem key={line.code} value={line.name}>{line.name}</MenuItem>
            ))}
        </TextField>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="工序"
          name="process"
          select
          fullWidth
          value={this.state.process}
          onChange={(e) => {
            const value = e.target.value;
            this.setState({ process: value });
          }}
          disabled={!this.state.phase || !this.state.production_line} // Disable if no phase or production line selected
        >
          <MenuItem value="">请选择</MenuItem>
          {this.state.configData.processes.map((process) => (
            <MenuItem key={process.code} value={process.name}>{process.name}</MenuItem>
          ))}
        </TextField>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="设备状态"
          name="status"
          select
          fullWidth
          value={this.state.status}
          onChange={this.handleChange}
        >
          <MenuItem value="Active">启用</MenuItem>
          <MenuItem value="Inactive">停机</MenuItem>
          <MenuItem value="Under Maintenance">维护中</MenuItem>
          <MenuItem value="Retired">已退役</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  </Paper>

  {/* SECTION 2 — PHOTO */}
  <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
    <Typography variant="h6" fontWeight={600}>照片</Typography>
    <Divider sx={{ my: 2 }} />

    <Button variant="outlined" component="label">
      上传照片
      <input type="file" hidden onChange={this.handleFileChange} />
    </Button>

    {this.state.photo && (
      <Typography variant="body2" sx={{ mt: 1 }}>
        已选择: {this.state.photo.name}
      </Typography>
    )}
  </Paper>

                    </Box>
                    </Box>

                </Drawer>

            </>
        );
    }
}
AssetEditForm.contextType = AuthContext
export default AssetEditForm;
