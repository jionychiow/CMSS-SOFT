import React, { Component } from 'react';
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
  CircularProgress,
  Chip,
  Autocomplete
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../../AuthProvider/AuthContext';

class TaskPlanForm extends Component {
  constructor(props) {
    super(props);
    const { taskPlan } = props;

    this.state = {
      is_loading: false,
      users: [],

      // 任务计划信息
      date: taskPlan?.date || "",
      task_description: taskPlan?.task_description || "",
      assigned_user_ids: taskPlan?.assigned_users?.map(u => u.id) || [],
      status: taskPlan?.status || "pending",
      progress: taskPlan?.progress || 0,
      selectedUsers: taskPlan?.assigned_users?.map(u => ({
        id: u.id,
        username: u.username
      })) || [],
      // 关联字段
      phase: taskPlan?.phase || "",
      process: taskPlan?.process || "",
      production_line: taskPlan?.production_line || "",
      phases: [],
      processes: [],
      production_lines: [],
      filtered_production_lines: [] // 用于存储根据期别过滤的产线
    };
  }

  componentDidMount() {
    this.fetchUsers();
    this.fetchPhases();
    this.fetchProcesses();
    this.fetchProductionLines();
  }

  fetchUsers = async () => {
    try {
      const response = await axios.get(`${url_base}/api/db/users/`, {
        headers: {
          'Authorization': `Token ${this.context.state.token}`
        }
      });
      this.setState({ users: response.data });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('获取用户列表失败');
    }
  };

  fetchPhases = async () => {
    try {
      const response = await axios.get(`${url_base}/api/db/phases/`, {
        headers: {
          'Authorization': `Token ${this.context.state.token}`
        }
      });
      this.setState({ phases: response.data });
    } catch (error) {
      console.error('获取期别列表失败:', error);
      toast.error('获取期别列表失败');
    }
  };

  fetchProcesses = async () => {
    try {
      const response = await axios.get(`${url_base}/api/db/processes/`, {
        headers: {
          'Authorization': `Token ${this.context.state.token}`
        }
      });
      this.setState({ processes: response.data });
    } catch (error) {
      console.error('获取工序列表失败:', error);
      toast.error('获取工序列表失败');
    }
  };

  fetchProductionLines = async () => {
    try {
      const response = await axios.get(`${url_base}/api/db/production-lines/`, {
        headers: {
          'Authorization': `Token ${this.context.state.token}`
        }
      });
      // 为每个产线添加关联的期别信息
      const linesWithPhase = response.data.map(line => ({
        ...line,
        phase: line.phase // 假设后端返回的数据中包含phase字段
      }));
      this.setState({ 
        production_lines: linesWithPhase,
        filtered_production_lines: linesWithPhase // 初始化时显示所有产线
      });
    } catch (error) {
      console.error('获取产线列表失败:', error);
      toast.error('获取产线列表失败');
    }
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phase') {
      // 当期别改变时，更新过滤后的产线列表
      const filteredLines = this.state.production_lines.filter(line => 
        line.phase && line.phase.toString() === value.toString()
      );
      
      this.setState({ 
        [name]: value,
        filtered_production_lines: filteredLines,
        production_line: '' // 清空产线选择，因为之前的产线可能不属于新的期别
      });
    } else {
      this.setState({ [name]: value });
    }
  };

  handleUserChange = (event, value) => {
    // 更新选择的用户
    this.setState({
      selectedUsers: value,
      assigned_user_ids: value.map(user => user.id)
    });
  };

  isBadForm() {
    const { date, task_description, assigned_user_ids, phase, process, production_line } = this.state;

    if (!date || !task_description || assigned_user_ids.length === 0 || !phase || !process || !production_line) {
      toast.error("请填写所有必填字段（日期、任务计划、任务实施人、期别、工序、产线）");
      return true;
    }

    return false;
  }

  handleRegister = async () => {
    if (this.isBadForm()) return;

    this.setState({ is_loading: true });

    const { date, task_description, assigned_user_ids, status, progress, phase, process, production_line } = this.state;
    const { taskPlan } = this.props;

    try {
      const payload = {
        date,
        task_description,
        assigned_user_ids,
        status,
        progress: parseFloat(progress),
        phase: phase || null,
        process: process || null,
        production_line: production_line || null
      };

      const method = taskPlan ? "patch" : "post";
      const url = `${url_base}/api/db/task-plans/${taskPlan ? `${taskPlan.uuid}/` : ""}`;

      await axios({
        method,
        url,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + this.context.state.token
        }
      });

      toast.success(`任务计划 ${taskPlan ? "已更新" : "已创建"}`);

      if (this.props.onUpdate) this.props.onUpdate();
    } catch (error) {
      console.error('API错误详情:', error);
      toast.error("错误：" + (error?.response?.data?.detail || error?.message || "请重试。"));
    } finally {
      this.setState({ is_loading: false });
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.taskPlan !== this.props.taskPlan) {
      const tp = this.props.taskPlan || {};
      const phase = tp?.phase || "";
      const production_line = tp?.production_line || "";
      
      // 如果选择了期别，过滤出该期别的产线
      let filteredLines = this.state.production_lines;
      if (phase) {
        filteredLines = this.state.production_lines.filter(line => 
          line.phase && line.phase.toString() === phase.toString()
        );
      }
      
      this.setState({
        date: tp?.date || "",
        task_description: tp?.task_description || "",
        assigned_user_ids: tp?.assigned_users?.map(u => u.id) || [],
        status: tp?.status || "pending",
        progress: tp?.progress || 0,
        selectedUsers: tp?.assigned_users?.map(u => ({
          id: u.id,
          username: u.username
        })) || [],
        phase: phase,
        process: tp?.process || "",
        production_line: production_line,
        filtered_production_lines: filteredLines
      });
    }
  }

  render() {
    const { taskPlan } = this.props;
    const { users, selectedUsers } = this.state;

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
              {taskPlan ? "编辑任务计划" : "新建任务计划"}
            </Typography>

            <Button variant="contained" onClick={this.handleRegister}>
              {taskPlan ? "保存" : "创建"}
            </Button>
          </Toolbar>
        </AppBar>

        {/* CONTENT */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>

          {/* 任务计划信息 */}
          <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
            <Typography variant="h6" fontWeight={600}>
              任务计划信息
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="日期"
                  type="date"
                  name="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={this.state.date}
                  onChange={this.handleChange}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="任务计划"
                  name="task_description"
                  fullWidth
                  multiline
                  rows={3}
                  value={this.state.task_description}
                  onChange={this.handleChange}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  multiple
                  options={users}
                  getOptionLabel={(option) => option.username}
                  value={selectedUsers}
                  onChange={this.handleUserChange}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        {option.username}
                      </li>
                    );
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          variant="outlined"
                          label={option.username}
                          size="small"
                          key={key}
                          {...tagProps}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="任务实施人"
                      placeholder="选择实施人"
                      required
                    />
                  )}
                />
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
                  <MenuItem value="pending">待处理</MenuItem>
                  <MenuItem value="in_progress">进行中</MenuItem>
                  <MenuItem value="completed">已完成</MenuItem>
                  <MenuItem value="cancelled">已取消</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="完成进度(%)"
                  name="progress"
                  type="number"
                  fullWidth
                  value={this.state.progress}
                  onChange={this.handleChange}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="期别"
                  name="phase"
                  select
                  fullWidth
                  value={this.state.phase}
                  onChange={this.handleChange}
                  required
                >
                  {this.state.phases.map((phase) => (
                    <MenuItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="工序"
                  name="process"
                  select
                  fullWidth
                  value={this.state.process}
                  onChange={this.handleChange}
                  required
                >
                  {this.state.processes.map((process) => (
                    <MenuItem key={process.id} value={process.id}>
                      {process.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="产线"
                  name="production_line"
                  select
                  fullWidth
                  value={this.state.production_line}
                  onChange={this.handleChange}
                  required
                  disabled={!this.state.phase} // 如果没有选择期别，则禁用产线选择
                >
                  {this.state.filtered_production_lines.map((line) => (
                    <MenuItem key={line.id} value={line.id}>
                      {line.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Drawer>
    );
  }
}

TaskPlanForm.contextType = AuthContext;
export default TaskPlanForm;