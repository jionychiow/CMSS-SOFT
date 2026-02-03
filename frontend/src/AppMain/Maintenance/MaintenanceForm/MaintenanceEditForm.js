import * as React from 'react';
import { url as url_base } from '../../../Config';

import {
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  Paper,
  Divider,
  Grid,
  TextField,
  MenuItem,
  Backdrop,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../../AuthProvider/AuthContext';

class MaintenanceRecordForm extends React.Component {
  constructor(props) {
    super(props);
    const { maintenancePlan } = props;

    this.state = {
      is_loading: false,
      users: [],  // 添加用户列表状态

      // BASIC INFO
      name: maintenancePlan?.name || "",
      ref: maintenancePlan?.ref || "",
      assigned_to: maintenancePlan?.assigned_to?.id || "",
      asset: maintenancePlan?.asset?.uuid || "",

      // OTHER INFO
      started_at: maintenancePlan?.started_at?.slice(0, 16) || "",
      finished_at: maintenancePlan?.finished_at?.slice(0, 16) || "",
      type: maintenancePlan?.type || "Planned",
      priority: maintenancePlan?.priority || "Medium",
      status: maintenancePlan?.status || "Completed",
      cost: maintenancePlan?.cost || "",
      description: maintenancePlan?.description || "",
      instructions: null
    };
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = async () => {
    try {
      // 使用包含用户类型信息的API端点
      const response = await axios.get(`${url_base}/api/v1/all-users-for-assignment/`, {
        headers: {
          'Authorization': `Token ${this.context.state.token}`
        }
      });
      
      // 过滤只显示操作员用户
      const operatorUsers = response.data.filter(user => 
        user.type === 'Operator' || user.type === 'Admin'
      );
      
      this.setState({ users: operatorUsers });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('获取用户列表失败');
    }
  };

  handleChange = (e) => {
    console.log('MaintenanceEditForm handleChange - 当前用户数据:', this.props.users); // 调试信息
    this.setState({ [e.target.name]: e.target.value });
  };

  handleDateChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleFileChange = (e) => {
    this.setState({ instructions: e.target.files[0] });
  };

  isBadForm() {
    const {
      name,
      ref,
      assigned_to,
      asset
    } = this.state;

    if (!name || !ref || !assigned_to || !asset) {
      toast.error("请填写所有必填字段");
      return true;
    }

    return false;
  }

  handleRegister = async () => {
    if (this.isBadForm()) return;

    this.setState({ is_loading: true });

    const formData = new FormData();
    Object.keys(this.state).forEach((key) => {
      if (this.state[key] !== null && this.state[key] !== "")
        formData.append(key, this.state[key]);
    });

    try {
      const { maintenancePlan } = this.props;
      const method = maintenancePlan ? "patch" : "post";
      const url =
        url_base +
        "/api/v1/maintenances/" +
        (maintenancePlan ? `${maintenancePlan.uuid}/` : "");

      await axios({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Token " + this.context.state.token
        }
      });

      toast.success(
        `维修记录 ${maintenancePlan ? "已更新" : "已创建"}`
      );

      if (this.props.OnUpdate) this.props.OnUpdate();
    } catch (error) {
      toast.error(
        "错误：" + (error?.response?.data?.detail || "请重试。")
      );
    } finally {
      this.setState({ is_loading: false });
    }
  };
  componentDidUpdate(prevProps) {
  if (prevProps.maintenancePlan !== this.props.maintenancePlan) {
    const m = this.props.maintenancePlan || {};

    this.setState({
      name: m?.name || "",
      ref: m?.ref || "",
      assigned_to: m?.assigned_to?.id || "",
      asset: m?.asset?.uuid || "",
      started_at: m?.started_at?.slice(0, 16) || "",
      finished_at: m?.finished_at?.slice(0, 16) || "",
      type: m?.type || "Planned",
      priority: m?.priority || "Medium",
      status: m?.status || "Completed",
      cost: m?.cost || "",
      description: m?.description || "",
      instructions: null
    });
  }
  // 注意：我们不再监听传入的users props，因为我们使用本地获取的数据
}


  render() {
    const { maintenancePlan, assets } = this.props; // 不再从props解构users
    const { users } = this.state; // 从本地状态获取users
    console.log('MaintenanceEditForm render - local users state:', users); // 调试信息

    return (
      <Drawer
        anchor="right"
        open={this.props.show}
        onClose={this.props.handleClose}
        PaperProps={{
          sx: {
            width: "50vw",
            minWidth: 420,
            maxWidth: 720,
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default"
          }
        }}
        ModalProps={{ keepMounted: true }}
      >
        {/* LOADING BACKDROP */}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 10 }}
          open={this.state.is_loading}
        >
          <CircularProgress />
        </Backdrop>

        {/* HEADER */}
        <AppBar
          elevation={0}
          color="default"
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            position: "sticky",
            top: 0,
            zIndex: 10
          }}
        >
          <Toolbar>
            <IconButton edge="start" onClick={this.props.handleClose}>
              <CloseIcon />
            </IconButton>

            <Typography sx={{ flex: 1 }} variant="h6">
              {maintenancePlan ? "编辑维护计划" : "新建维护计划"}
            </Typography>

            <Button variant="contained" onClick={this.handleRegister}>
              {maintenancePlan ? "保存" : "创建"}
            </Button>
          </Toolbar>
        </AppBar>

        {/* CONTENT */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>

          {/* SECTION 1 - BASIC INFO */}
          <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
            <Typography variant="h6" fontWeight={600}>
              基本信息
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="计划开始时间"
                  type="datetime-local"
                  name="planned_starting_date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={this.state.planned_starting_date}
                  onChange={this.handleDateChange}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="计划完成时间"
                  type="datetime-local"
                  name="planned_finished"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={this.state.planned_finished}
                  onChange={this.handleDateChange}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="名称"
                  name="name"
                  fullWidth
                  value={this.state.name}
                  onChange={this.handleChange}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="参考编号"
                  name="ref"
                  fullWidth
                  value={this.state.ref}
                  onChange={this.handleChange}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="分配给"
                  name="assigned_to"
                  select
                  fullWidth
                  value={this.state.assigned_to}
                  onChange={this.handleChange}
                >
                  {users && users.length > 0 ? (
                    users.map((u) => (
                      <MenuItem key={u?.user?.id} value={u?.user?.id}>
                        {u?.user?.username}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      暂无用户数据
                    </MenuItem>
                  )}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="资产"
                  name="asset"
                  select
                  fullWidth
                  value={this.state.asset}
                  onChange={this.handleChange}
                >
                  {assets.map((asset) => (
                    <MenuItem key={asset.uuid} value={asset.uuid}>
                      {asset.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* SECTION 2 - OTHER DETAILS */}
          <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
            <Typography variant="h6" fontWeight={600}>
              其他信息
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="实际开始时间"
                  type="datetime-local"
                  name="started_at"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={this.state.started_at}
                  onChange={this.handleDateChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="实际完成时间"
                  type="datetime-local"
                  name="finished_at"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={this.state.finished_at}
                  onChange={this.handleDateChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="类型"
                  name="type"
                  select
                  fullWidth
                  value={this.state.type}
                  onChange={this.handleChange}
                >
                  <MenuItem value="Planned">计划内</MenuItem>
                  <MenuItem value="UnPlanned">计划外</MenuItem>
                  <MenuItem value="Other">其他</MenuItem>
                  <MenuItem value="Corrective">纠正性</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="优先级"
                  name="priority"
                  select
                  fullWidth
                  value={this.state.priority}
                  onChange={this.handleChange}
                >
                  <MenuItem value="Low">低</MenuItem>
                  <MenuItem value="Medium">中</MenuItem>
                  <MenuItem value="High">高</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="状态"
                  name="status"
                  select
                  fullWidth
                  value={this.state.status}
                  onChange={this.handleChange}
                >
                  <MenuItem value="Pending">待处理</MenuItem>
                  <MenuItem value="In Progress">进行中</MenuItem>
                    <MenuItem value="Completed">已完成</MenuItem>
                    <MenuItem value="Cancelled">已取消</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="预估成本"
                  name="estimated_cost"
                  type="number"
                  fullWidth
                  value={this.state.estimated_cost}
                  onChange={this.handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button variant="outlined" component="label">
                  上传说明文档
                  <input type="file" hidden onChange={this.handleFileChange} />
                </Button>

                {this.state.instructions && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    已选择: {this.state.instructions.name}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Drawer>
    );
  }
}

MaintenanceRecordForm.contextType = AuthContext;
export default MaintenanceRecordForm;
