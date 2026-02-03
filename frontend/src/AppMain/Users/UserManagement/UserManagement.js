import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Container,
  Paper,
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  IconButton,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormGroup,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import AuthContext from '../../../AuthProvider/AuthContext';

import { url } from '../../../Config';

// 自定义样式组件
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.9) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-1px)',
  },
}));

const PermissionSection = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(25, 118, 210, 0.05)',
  borderRadius: 8,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const UserManagement = () => {
  const { state: authState } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // 用于跟踪正在编辑的用户
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    plant_phase: '',
    shift_type: '',
    type: 'Operator', // 改为Operator
    // 权限字段
    can_add_assets: true,
    can_edit_assets: true,
    can_delete_assets: false,
    can_add_maintenance_records: true,
    can_edit_maintenance_records: true,
    can_delete_maintenance_records: false,
    can_add_manuals: false,
    can_edit_manuals: false,
    can_delete_manuals: false,
    can_add_cases: false,
    can_edit_cases: false,
    can_delete_cases: false
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, userId: null });
  
  // 检查用户是否为管理员
  const isAdmin = authState.user_profile?.type === 'Admin';
  
  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
  }, [setSnackbar]);

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/user-management/list-users/`, {
        headers: {
          'Authorization': `Token ${authState.token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      showSnackbar('获取用户列表失败', 'error');
    }
  }, [authState.token, showSnackbar]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [authState.token, isAdmin, fetchUsers]); // 添加fetchUsers作为依赖

  // 如果不是管理员，显示权限不足的信息
  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            权限不足
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            您没有权限访问用户管理功能。请联系管理员。
          </Typography>
        </Paper>
      </Container>
    );
  }

  const validateForm = () => {
    const newErrors = {};

    // 验证用户名（必须包含中文）
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else {
      const chineseRegex = /[\u4e00-\u9fff]/;
      if (!chineseRegex.test(formData.username)) {
        newErrors.username = '用户名必须包含中文字符';
      }
    }

    // 验证密码（编辑时不强制要求）
    if (!editingUser && !formData.password) {
      newErrors.password = '密码不能为空';
    } else if (!editingUser && formData.password.length < 6) {
      newErrors.password = '密码长度至少6位';
    }

    // 验证工厂分期
    if (!formData.plant_phase) {
      newErrors.plant_phase = '请选择工厂分期';
    }

    // 验证班次类型
    if (!formData.shift_type) {
      newErrors.shift_type = '请选择班次类型';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      let response;
      if (editingUser) {
        // 编辑用户
        const updateData = { ...formData };
        // 如果没有输入新密码，则从原用户数据中移除password字段
        if (!formData.password) {
          delete updateData.password;
        }
        response = await axios.put(`${url}/api/user-management/update-user/${editingUser.id}/`, updateData, {
          headers: {
            'Authorization': `Token ${authState.token}`,
            'Content-Type': 'application/json'
          }
        });
        showSnackbar('用户信息更新成功', 'success');
      } else {
        response = await axios.post(`${url}/api/user-management/create-user/`, formData, {
          headers: {
            'Authorization': `Token ${authState.token}`,
            'Content-Type': 'application/json'
          }
        });
        showSnackbar('用户创建成功', 'success');
      }

      setShowCreateForm(false);
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        plant_phase: '',
        shift_type: '',
        type: 'Operator', // 改为Operator
        // 权限字段
        can_add_assets: true,
        can_edit_assets: true,
        can_delete_assets: false,
        can_add_maintenance_records: true,
        can_edit_maintenance_records: true,
        can_delete_maintenance_records: false,
        can_add_manuals: false,
        can_edit_manuals: false,
        can_delete_manuals: false,
        can_add_cases: false,
        can_edit_cases: false,
        can_delete_cases: false
      });
      fetchUsers(); // 重新获取用户列表
    } catch (error) {
      console.error('操作用户失败:', error);
      const errorMessage = error.response?.data?.error || '操作用户失败';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDelete.userId) return;

    try {
      await axios.delete(`${url}/api/user-management/delete-user/${confirmDelete.userId}/`, {
        headers: {
          'Authorization': `Token ${authState.token}`
        }
      });

      showSnackbar('用户删除成功', 'success');
      fetchUsers(); // 重新获取用户列表
    } catch (error) {
      console.error('删除用户失败:', error);
      const errorMessage = error.response?.data?.error || '删除用户失败';
      showSnackbar(errorMessage, 'error');
    } finally {
      setConfirmDelete({ open: false, userId: null });
    }
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCreateFormToggle = () => {
    setShowCreateForm(!showCreateForm);
    if (!showCreateForm) {
      setFormData({
        username: '',
        password: '',
        plant_phase: '',
        shift_type: '',
        type: 'Operator', // 改为Operator
        // 权限字段
        can_add_assets: true,
        can_edit_assets: true,
        can_delete_assets: false,
        can_add_maintenance_records: true,
        can_edit_maintenance_records: true,
        can_delete_maintenance_records: false,
        can_add_manuals: false,
        can_edit_manuals: false,
        can_delete_manuals: false,
        can_add_cases: false,
        can_edit_cases: false,
        can_delete_cases: false
      });
      setErrors({});
      setEditingUser(null);
    }
  };

  // 转换显示值的辅助函数
  const getPhaseDisplay = (phase) => {
    switch (phase) {
      case 'phase_1': return '一期';
      case 'phase_2': return '二期';
      case 'both': return '全部';
      default: return phase || '未设置';
    }
  };

  const getShiftDisplay = (shift) => {
    switch (shift) {
      case 'long_day_shift': return '长白班';
      case 'rotating_shift': return '倒班';
      case 'both': return '全部';
      default: return shift || '未设置';
    }
  };

  const getTypeDisplay = (type) => {
    return type === 'Admin' ? '管理员' : '操作员'; // 显示"操作员"而不是"报告员"
  };

  // 权限显示函数
  const getPermissionDisplay = (perm) => perm ? '✓' : '✗';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
          elevation={0} 
          sx={{ 
            p: 0, 
            background: 'transparent',
            boxShadow: 'none'
          }}
        >
        {/* 主要内容卡片 */}
        <Box sx={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
        {/* 页面头部 */}
        <Box sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          color: 'white',
          borderRadius: '16px 16px 0 0',
          padding: '24px',
          mb: 3
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                <SecurityIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.5em' }} />
                用户权限管理
              </Typography>
              <Typography variant="h6" component="p" sx={{ color: 'rgba(255, 255, 255, 0.9)', mt: 1 }}>
                管理系统用户及其权限设置
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="inherit"
              startIcon={<HomeIcon />}
              href="/cmms/dashboard"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              返回主页
            </Button>
          </Box>
        </Box>

        {/* 添加用户按钮 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, px: 3 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleCreateFormToggle}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {showCreateForm ? '取消' : '添加新用户'}
          </Button>
        </Box>

        {/* 创建/编辑用户表单 */}
        {showCreateForm && (
          <Paper 
            elevation={4} 
            sx={{ 
              p: 3, 
              mx: 3,
              mb: 3, 
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 3,
              border: '1px solid rgba(25, 118, 210, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ fontSize: 28, color: '#1976d2', mr: 1 }} />
              <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                {editingUser ? '编辑用户' : '创建新用户'}
              </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* 基本信息部分 */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                    基本信息
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="用户名（必须包含中文）"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    error={!!errors.username}
                    helperText={errors.username}
                    required
                  />
                </Grid>
                {!editingUser ? (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="密码"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      required
                    />
                  </Grid>
                ) : (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="密码（留空表示不更改密码）"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="留空表示不更改密码"
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!errors.plant_phase}>
                    <InputLabel>工厂分期</InputLabel>
                    <Select
                      name="plant_phase"
                      value={formData.plant_phase}
                      onChange={handleInputChange}
                      label="工厂分期"
                    >
                      <MenuItem value="">请选择</MenuItem>
                      <MenuItem value="phase_1">一期</MenuItem>
                      <MenuItem value="phase_2">二期</MenuItem>
                      <MenuItem value="both">全部</MenuItem>
                    </Select>
                  </FormControl>
                  {errors.plant_phase && (
                    <Typography color="error" variant="caption">
                      {errors.plant_phase}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!!errors.shift_type}>
                    <InputLabel>班次类型</InputLabel>
                    <Select
                      name="shift_type"
                      value={formData.shift_type}
                      onChange={handleInputChange}
                      label="班次类型"
                    >
                      <MenuItem value="">请选择</MenuItem>
                      <MenuItem value="long_day_shift">长白班</MenuItem>
                      <MenuItem value="rotating_shift">倒班</MenuItem>
                      <MenuItem value="both">全部</MenuItem>
                    </Select>
                  </FormControl>
                  {errors.shift_type && (
                    <Typography color="error" variant="caption">
                      {errors.shift_type}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>用户类型</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      label="用户类型"
                    >
                      <MenuItem value="Operator">操作员</MenuItem>
                      <MenuItem value="Admin">管理员</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* 权限设置部分 */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                    权限设置
                  </Typography>
                </Grid>

                {/* 第一行权限 */}
                <Grid item xs={12} md={6} lg={3}>
                  <Paper sx={{ p: 2, height: '100%', backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2', fontWeight: 'bold' }}>
                      设备管理权限
                    </Typography>
                    <FormGroup>
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_add_assets" 
                            checked={formData.can_add_assets} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="添加设备" 
                      />
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_edit_assets" 
                            checked={formData.can_edit_assets} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="编辑设备" 
                      />
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_delete_assets" 
                            checked={formData.can_delete_assets} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="删除设备" 
                      />
                    </FormGroup>
                  </Paper>
                </Grid>

                {/* 维修记录权限 */}
                <Grid item xs={12} md={6} lg={3}>
                  <Paper sx={{ p: 2, height: '100%', backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2', fontWeight: 'bold' }}>
                      维修记录权限
                    </Typography>
                    <FormGroup>
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_add_maintenance_records" 
                            checked={formData.can_add_maintenance_records} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="添加记录" 
                      />
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_edit_maintenance_records" 
                            checked={formData.can_edit_maintenance_records} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="编辑记录" 
                      />
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_delete_maintenance_records" 
                            checked={formData.can_delete_maintenance_records} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="删除记录" 
                      />
                    </FormGroup>
                  </Paper>
                </Grid>

                {/* 维修手册权限 */}
                <Grid item xs={12} md={6} lg={3}>
                  <Paper sx={{ p: 2, height: '100%', backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2', fontWeight: 'bold' }}>
                      维修手册权限
                    </Typography>
                    <FormGroup>
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_add_manuals" 
                            checked={formData.can_add_manuals} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="添加手册" 
                      />
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_edit_manuals" 
                            checked={formData.can_edit_manuals} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="编辑手册" 
                      />
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_delete_manuals" 
                            checked={formData.can_delete_manuals} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="删除手册" 
                      />
                    </FormGroup>
                  </Paper>
                </Grid>

                {/* 今日任务计划权限 */}
                <Grid item xs={12} md={6} lg={3}>
                  <Paper sx={{ p: 2, height: '100%', backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2', fontWeight: 'bold' }}>
                      任务计划权限
                    </Typography>
                    <FormGroup>
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_add_cases" 
                            checked={formData.can_add_cases} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="添加任务" 
                      />
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_edit_cases" 
                            checked={formData.can_edit_cases} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="编辑任务" 
                      />
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            name="can_delete_cases" 
                            checked={formData.can_delete_cases} 
                            onChange={handleInputChange} 
                          />
                        } 
                        label="删除任务" 
                      />
                    </FormGroup>
                  </Paper>
                </Grid>

                {/* 提交按钮 */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                    <Button 
                      type="button" 
                      onClick={handleCreateFormToggle}
                      variant="outlined"
                      color="secondary"
                    >
                      取消
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="success"
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      {editingUser ? '更新用户' : '创建用户'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        )}

        {/* 用户列表表格 */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 2,
            mx: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            borderRadius: 2,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Table 
            sx={{ 
              minWidth: { xs: 300, sm: 650 },
              '& .MuiTableCell-root': {
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                py: 2
              }
            }} 
            aria-label="用户列表"
          >
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>用户名</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>用户类型</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>工厂分期</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>班次类型</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>设备权限</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>维修记录权限</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>维修手册权限</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>任务计划权限</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow 
                    key={user.id} 
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.05)',
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease-in-out',
                      },
                      transition: 'all 0.2s ease-in-out',
                      borderRadius: 1,
                    }}
                  >
                    <TableCell component="th" scope="row">{user.username}</TableCell>
                    <TableCell>{getTypeDisplay(user.type)}</TableCell>
                    <TableCell>{getPhaseDisplay(user.plant_phase)}</TableCell>
                    <TableCell>{getShiftDisplay(user.shift_type)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span>添{getPermissionDisplay(user.can_add_assets)}</span>
                        <span>编{getPermissionDisplay(user.can_edit_assets)}</span>
                        <span>删{getPermissionDisplay(user.can_delete_assets)}</span>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span>添{getPermissionDisplay(user.can_add_maintenance_records)}</span>
                        <span>编{getPermissionDisplay(user.can_edit_maintenance_records)}</span>
                        <span>删{getPermissionDisplay(user.can_delete_maintenance_records)}</span>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span>添{getPermissionDisplay(user.can_add_manuals)}</span>
                        <span>编{getPermissionDisplay(user.can_edit_manuals)}</span>
                        <span>删{getPermissionDisplay(user.can_delete_manuals)}</span>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span>添{getPermissionDisplay(user.can_add_cases)}</span>
                        <span>编{getPermissionDisplay(user.can_edit_cases)}</span>
                        <span>删{getPermissionDisplay(user.can_delete_cases)}</span>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            ...user,
                            password: '' // 编辑时不显示密码
                          });
                          setShowCreateForm(true);
                        }}
                        title="编辑用户"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setConfirmDelete({ open: true, userId: user.id })}
                        title="删除用户"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    暂无用户数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box> {/* 关闭主要内容卡片 */}
    </Paper> {/* 关闭外层纸片容器 */}

      {/* 删除确认对话框 */}
      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, userId: null })}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要删除这个用户吗？此操作不可撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, userId: null })}>取消</Button>
          <Button onClick={handleDeleteUser} color="error">删除</Button>
        </DialogActions>
      </Dialog>

      {/* 提示框 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Container>
  );
};

export default UserManagement;