import React, { useState, useEffect, useContext } from 'react';
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
  Alert,
  IconButton,
  useMediaQuery,
  useTheme,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../../../AuthProvider/AuthContext';

import { url } from '../../../Config';

const AdvancedManagement = () => {
  const { state: authState } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [configurations, setConfigurations] = useState({
    phases: [],
    processes: [],
    production_lines: []
  });
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [showProductionLineForm, setShowProductionLineForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [editingProcess, setEditingProcess] = useState(null);
  const [editingProductionLine, setEditingProductionLine] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, type: '', id: null });
  const [formData, setFormData] = useState({
    phase_code: '',
    phase_name: '',
    process_code: '',
    process_name: '',
    production_line_code: '',
    production_line_name: '',
    phase_id: ''
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 检查用户是否为管理员
  const isAdmin = authState.user_profile?.type === 'Admin';

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // 获取所有配置信息
  const fetchConfigurations = async () => {
    try {
      const response = await axios.get(`${url}/api/db/advanced-management/configurations/`, {
        headers: {
          'Authorization': `Token ${authState.token}`
        }
      });
      setConfigurations(response.data);
    } catch (error) {
      console.error('获取配置信息失败:', error);
      showSnackbar('获取配置信息失败', 'error');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchConfigurations();
    }
  }, [authState.token, isAdmin]);

  // 表单处理函数
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 验证表单数据
  const validateForm = (type) => {
    const newErrors = {};

    if (type === 'phase') {
      if (!formData.phase_code.trim()) {
        newErrors.phase_code = '期数代码不能为空';
      }
      if (!formData.phase_name.trim()) {
        newErrors.phase_name = '期数名称不能为空';
      }
    } else if (type === 'process') {
      if (!formData.process_code.trim()) {
        newErrors.process_code = '工序代码不能为空';
      }
      if (!formData.process_name.trim()) {
        newErrors.process_name = '工序名称不能为空';
      }
    } else if (type === 'production_line') {
      if (!formData.production_line_code.trim()) {
        newErrors.production_line_code = '产线代码不能为空';
      }
      if (!formData.production_line_name.trim()) {
        newErrors.production_line_name = '产线名称不能为空';
      }
      if (!formData.phase_id) {
        newErrors.phase_id = '请选择期数';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === 0) { // 期数
      if (!validateForm('phase')) return;

      try {
        if (editingPhase) {
          // 更新期数
          await axios.put(
            `${url}/api/db/advanced-management/phases/${editingPhase.id}/`,
            {
              code: formData.phase_code,
              name: formData.phase_name
            },
            {
              headers: {
                'Authorization': `Token ${authState.token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          showSnackbar('期数更新成功', 'success');
        } else {
          // 添加期数
          await axios.post(
            `${url}/api/db/advanced-management/phases/`,
            {
              code: formData.phase_code,
              name: formData.phase_name
            },
            {
              headers: {
                'Authorization': `Token ${authState.token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          showSnackbar('期数添加成功', 'success');
        }
        resetForms();
        fetchConfigurations();
      } catch (error) {
        console.error('保存期数失败:', error);
        const errorMsg = error.response?.data?.error || '保存期数失败';
        showSnackbar(errorMsg, 'error');
      }
    } else if (activeTab === 1) { // 工序
      if (!validateForm('process')) return;

      try {
        if (editingProcess) {
          // 更新工序
          await axios.put(
            `${url}/api/db/advanced-management/processes/${editingProcess.id}/`,
            {
              code: formData.process_code,
              name: formData.process_name
            },
            {
              headers: {
                'Authorization': `Token ${authState.token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          showSnackbar('工序更新成功', 'success');
        } else {
          // 添加工序
          await axios.post(
            `${url}/api/db/advanced-management/processes/`,
            {
              code: formData.process_code,
              name: formData.process_name
            },
            {
              headers: {
                'Authorization': `Token ${authState.token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          showSnackbar('工序添加成功', 'success');
        }
        resetForms();
        fetchConfigurations();
      } catch (error) {
        console.error('保存工序失败:', error);
        const errorMsg = error.response?.data?.error || '保存工序失败';
        showSnackbar(errorMsg, 'error');
      }
    } else if (activeTab === 2) { // 产线
      if (!validateForm('production_line')) return;

      try {
        if (editingProductionLine) {
          // 更新产线
          await axios.put(
            `${url}/api/db/advanced-management/production-lines/${editingProductionLine.id}/`,
            {
              code: formData.production_line_code,
              name: formData.production_line_name,
              phase_id: parseInt(formData.phase_id)
            },
            {
              headers: {
                'Authorization': `Token ${authState.token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          showSnackbar('产线更新成功', 'success');
        } else {
          // 添加产线
          await axios.post(
            `${url}/api/db/advanced-management/production-lines/`,
            {
              code: formData.production_line_code,
              name: formData.production_line_name,
              phase_id: parseInt(formData.phase_id)
            },
            {
              headers: {
                'Authorization': `Token ${authState.token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          showSnackbar('产线添加成功', 'success');
        }
        resetForms();
        fetchConfigurations();
      } catch (error) {
        console.error('保存产线失败:', error);
        const errorMsg = error.response?.data?.error || '保存产线失败';
        showSnackbar(errorMsg, 'error');
      }
    }
  };

  // 重置表单
  const resetForms = () => {
    setShowPhaseForm(false);
    setShowProcessForm(false);
    setShowProductionLineForm(false);
    setEditingPhase(null);
    setEditingProcess(null);
    setEditingProductionLine(null);
    setFormData({
      phase_code: '',
      phase_name: '',
      process_code: '',
      process_name: '',
      production_line_code: '',
      production_line_name: '',
      phase_id: ''
    });
    setErrors({});
  };

  // 编辑期数
  const handleEditPhase = (phase) => {
    setEditingPhase(phase);
    setFormData({
      ...formData,
      phase_code: phase.code,
      phase_name: phase.name
    });
    setShowPhaseForm(true);
  };

  // 编辑工序
  const handleEditProcess = (process) => {
    setEditingProcess(process);
    setFormData({
      ...formData,
      process_code: process.code,
      process_name: process.name
    });
    setShowProcessForm(true);
  };

  // 编辑产线
  const handleEditProductionLine = (line) => {
    setEditingProductionLine(line);
    setFormData({
      ...formData,
      production_line_code: line.code,
      production_line_name: line.name,
      phase_id: line.phase_id.toString()
    });
    setShowProductionLineForm(true);
  };

  // 删除确认
  const handleDeleteConfirm = (type, id) => {
    setConfirmDelete({ open: true, type, id });
  };

  // 执行删除
  const handleDelete = async () => {
    const { type, id } = confirmDelete;

    try {
      if (type === 'phase') {
        await axios.delete(
          `${url}/api/db/advanced-management/phases/${id}/delete/`,
          {
            headers: {
              'Authorization': `Token ${authState.token}`
            }
          }
        );
        showSnackbar('期数删除成功', 'success');
      } else if (type === 'process') {
        await axios.delete(
          `${url}/api/db/advanced-management/processes/${id}/delete/`,
          {
            headers: {
              'Authorization': `Token ${authState.token}`
            }
          }
        );
        showSnackbar('工序删除成功', 'success');
      } else if (type === 'production_line') {
        await axios.delete(
          `${url}/api/db/advanced-management/production-lines/${id}/delete/`,
          {
            headers: {
              'Authorization': `Token ${authState.token}`
            }
          }
        );
        showSnackbar('产线删除成功', 'success');
      }

      setConfirmDelete({ open: false, type: '', id: null });
      fetchConfigurations();
    } catch (error) {
      console.error(`删除${type}失败:`, error);
      const errorMsg = error.response?.data?.error || `删除${type}失败`;
      showSnackbar(errorMsg, 'error');
      setConfirmDelete({ open: false, type: '', id: null });
    }
  };

  // 取消删除
  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, type: '', id: null });
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            权限不足
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            您没有权限访问高级管理功能。请联系管理员。
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: 0, 
          background: 'transparent',
          boxShadow: 'none'
        }}
      >
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
                高级管理
              </Typography>
              <Typography variant="h6" component="p" sx={{ color: 'rgba(255, 255, 255, 0.9)', mt: 1 }}>
                管理期数、工序和产线配置
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

        <Box sx={{ p: 3, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.95) 100%)', borderRadius: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          {/* 选项卡 */}
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => {
              setActiveTab(newValue);
              resetForms();
            }}
            sx={{ mb: 3 }}
          >
            <Tab label="期数管理" />
            <Tab label="工序管理" />
            <Tab label="产线管理" />
          </Tabs>

          {/* 期数管理 */}
          {activeTab === 0 && (
            <Box>
              {/* 添加期数按钮 */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setShowPhaseForm(true);
                    setEditingPhase(null);
                    setFormData({
                      ...formData,
                      phase_code: '',
                      phase_name: ''
                    });
                  }}
                >
                  添加期数
                </Button>
              </Box>

              {/* 添加/编辑期数表单 */}
              {showPhaseForm && (
                <Paper elevation={4} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: 3, border: '1px solid rgba(25, 118, 210, 0.1)' }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    {editingPhase ? '编辑期数' : '添加期数'}
                  </Typography>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="期数代码"
                          name="phase_code"
                          value={formData.phase_code}
                          onChange={handleInputChange}
                          error={!!errors.phase_code}
                          helperText={errors.phase_code}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="期数名称"
                          name="phase_name"
                          value={formData.phase_name}
                          onChange={handleInputChange}
                          error={!!errors.phase_name}
                          helperText={errors.phase_name}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <Button 
                            type="button" 
                            onClick={resetForms}
                            variant="outlined"
                            color="secondary"
                          >
                            取消
                          </Button>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                          >
                            {editingPhase ? '更新期数' : '添加期数'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              )}

              {/* 期数列表表格 */}
              <TableContainer 
                component={Paper} 
                sx={{ 
                  mt: 2,
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
                  aria-label="期数列表"
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>期数代码</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>期数名称</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {configurations.phases.length > 0 ? (
                      configurations.phases.map((phase) => (
                        <TableRow 
                          key={phase.id} 
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
                          <TableCell component="th" scope="row">{phase.code}</TableCell>
                          <TableCell>{phase.name}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="primary"
                              onClick={() => handleEditPhase(phase)}
                              title="编辑期数"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteConfirm('phase', phase.id)}
                              title="删除期数"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          暂无期数数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* 工序管理 */}
          {activeTab === 1 && (
            <Box>
              {/* 添加工序按钮 */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setShowProcessForm(true);
                    setEditingProcess(null);
                    setFormData({
                      ...formData,
                      process_code: '',
                      process_name: ''
                    });
                  }}
                >
                  添加工序
                </Button>
              </Box>

              {/* 添加/编辑工序表单 */}
              {showProcessForm && (
                <Paper elevation={4} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: 3, border: '1px solid rgba(25, 118, 210, 0.1)' }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    {editingProcess ? '编辑工序' : '添加工序'}
                  </Typography>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="工序代码"
                          name="process_code"
                          value={formData.process_code}
                          onChange={handleInputChange}
                          error={!!errors.process_code}
                          helperText={errors.process_code}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="工序名称"
                          name="process_name"
                          value={formData.process_name}
                          onChange={handleInputChange}
                          error={!!errors.process_name}
                          helperText={errors.process_name}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <Button 
                            type="button" 
                            onClick={resetForms}
                            variant="outlined"
                            color="secondary"
                          >
                            取消
                          </Button>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                          >
                            {editingProcess ? '更新工序' : '添加工序'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              )}

              {/* 工序列表表格 */}
              <TableContainer 
                component={Paper} 
                sx={{ 
                  mt: 2,
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
                  aria-label="工序列表"
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>工序代码</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>工序名称</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {configurations.processes.length > 0 ? (
                      configurations.processes.map((process) => (
                        <TableRow 
                          key={process.id} 
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
                          <TableCell component="th" scope="row">{process.code}</TableCell>
                          <TableCell>{process.name}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="primary"
                              onClick={() => handleEditProcess(process)}
                              title="编辑工序"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteConfirm('process', process.id)}
                              title="删除工序"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          暂无工序数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* 产线管理 */}
          {activeTab === 2 && (
            <Box>
              {/* 添加产线按钮 */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setShowProductionLineForm(true);
                    setEditingProductionLine(null);
                    setFormData({
                      ...formData,
                      production_line_code: '',
                      production_line_name: '',
                      phase_id: ''
                    });
                  }}
                >
                  添加产线
                </Button>
              </Box>

              {/* 添加/编辑产线表单 */}
              {showProductionLineForm && (
                <Paper elevation={4} sx={{ p: 3, mb: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: 3, border: '1px solid rgba(25, 118, 210, 0.1)' }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    {editingProductionLine ? '编辑产线' : '添加产线'}
                  </Typography>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="产线代码"
                          name="production_line_code"
                          value={formData.production_line_code}
                          onChange={handleInputChange}
                          error={!!errors.production_line_code}
                          helperText={errors.production_line_code}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="产线名称"
                          name="production_line_name"
                          value={formData.production_line_name}
                          onChange={handleInputChange}
                          error={!!errors.production_line_name}
                          helperText={errors.production_line_name}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth error={!!errors.phase_id}>
                          <InputLabel>所属期数</InputLabel>
                          <Select
                            name="phase_id"
                            value={formData.phase_id}
                            onChange={handleInputChange}
                            label="所属期数"
                          >
                            <MenuItem value="">请选择期数</MenuItem>
                            {configurations.phases.map((phase) => (
                              <MenuItem key={phase.id} value={phase.id.toString()}>
                                {phase.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.phase_id && (
                            <Typography color="error" variant="caption">
                              {errors.phase_id}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <Button 
                            type="button" 
                            onClick={resetForms}
                            variant="outlined"
                            color="secondary"
                          >
                            取消
                          </Button>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                          >
                            {editingProductionLine ? '更新产线' : '添加产线'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              )}

              {/* 产线列表表格 */}
              <TableContainer 
                component={Paper} 
                sx={{ 
                  mt: 2,
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
                  aria-label="产线列表"
                >
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>产线代码</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>产线名称</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>所属期数</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {configurations.production_lines.length > 0 ? (
                      configurations.production_lines.map((line) => (
                        <TableRow 
                          key={line.id} 
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
                          <TableCell component="th" scope="row">{line.code}</TableCell>
                          <TableCell>{line.name}</TableCell>
                          <TableCell>{line.phase__name}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="primary"
                              onClick={() => handleEditProductionLine(line)}
                              title="编辑产线"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteConfirm('production_line', line.id)}
                              title="删除产线"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          暂无产线数据
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Paper>

      {/* 删除确认对话框 */}
      <Dialog
        open={confirmDelete.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要删除此项吗？此操作不可撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>取消</Button>
          <Button onClick={handleDelete} color="error">删除</Button>
        </DialogActions>
      </Dialog>

      {/* 消息提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdvancedManagement;