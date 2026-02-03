import React, { useState, useEffect, useCallback } from 'react';
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
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import AuthContext from '../../AuthProvider/AuthContext';
import { url } from '../../Config';

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

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.9) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  overflow: 'hidden',
}));

const ConfigurationManagement = () => {
  const { state: authState } = React.useContext(AuthContext);
  const { token } = authState;

  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // 配置数据状态
  const [phases, setPhases] = useState([]);
  const [productionLines, setProductionLines] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [shiftTypes, setShiftTypes] = useState([]);

  // 表单状态
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addForm, setAddForm] = useState({});

  // 获取配置数据
  const fetchConfigData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/maintenance/config/get-config-data/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setPhases(response.data.phases || []);
      setProductionLines(response.data.productionLines || []);
      setProcesses(response.data.processes || []);
      setShiftTypes(response.data.shiftTypes || []);
    } catch (error) {
      console.error('获取配置数据失败:', error);
      showSnackbar('获取配置数据失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConfigData();
  }, [fetchConfigData]);

  // 显示通知
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 处理表单输入变化
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const handleAddInputChange = (event) => {
    const { name, value } = event.target;
    setAddForm({
      ...addForm,
      [name]: value,
    });
  };

  // 编辑项目
  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setEditForm({ ...item });
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      if (!editingItem) return;

      let response;
      switch (editingItem.type) {
        case 'phase':
          response = await axios.put(`${url}/api/maintenance/config/update-phase/${editingItem.id}/`, editForm, {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          setPhases(prev => prev.map(p => p.id === editingItem.id ? response.data : p));
          break;
        case 'process':
          response = await axios.put(`${url}/api/maintenance/config/update-process/${editingItem.id}/`, editForm, {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          setProcesses(prev => prev.map(p => p.id === editingItem.id ? response.data : p));
          break;
        case 'shift_type':
          response = await axios.put(`${url}/api/maintenance/config/update-shift-type/${editingItem.id}/`, editForm, {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          setShiftTypes(prev => prev.map(p => p.id === editingItem.id ? response.data : p));
          break;
        default:
          showSnackbar('未知配置类型', 'error');
          return;
      }

      showSnackbar('更新成功', 'success');
      setEditingItem(null);
      setEditForm({});
    } catch (error) {
      console.error('更新配置失败:', error);
      showSnackbar('更新失败', 'error');
    }
  };

  // 删除项目
  const handleDelete = async (id, type) => {
    if (!window.confirm('确定要删除此项吗？')) return;

    try {
      switch (type) {
        case 'phase':
          await axios.delete(`${url}/api/maintenance/config/delete-phase/${id}/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
          setPhases(prev => prev.filter(p => p.id !== id));
          break;
        case 'process':
          await axios.delete(`${url}/api/maintenance/config/delete-process/${id}/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
          setProcesses(prev => prev.filter(p => p.id !== id));
          break;
        case 'shift_type':
          await axios.delete(`${url}/api/maintenance/config/delete-shift-type/${id}/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
          setShiftTypes(prev => prev.filter(p => p.id !== id));
          break;
        default:
          showSnackbar('未知配置类型', 'error');
          return;
      }

      showSnackbar('删除成功', 'success');
    } catch (error) {
      console.error('删除配置失败:', error);
      showSnackbar('删除失败', 'error');
    }
  };

  // 添加新项目
  const handleAdd = async (type) => {
    try {
      if (!addForm.code || !addForm.name) {
        showSnackbar('请输入代码和名称', 'error');
        return;
      }

      let response;
      switch (type) {
        case 'phase':
          response = await axios.post(`${url}/api/maintenance/config/create-phase/`, addForm, {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          setPhases(prev => [...prev, response.data]);
          break;
        case 'process':
          response = await axios.post(`${url}/api/maintenance/config/create-process/`, addForm, {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          setProcesses(prev => [...prev, response.data]);
          break;
        case 'shift_type':
          response = await axios.post(`${url}/api/maintenance/config/create-shift-type/`, addForm, {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          setShiftTypes(prev => [...prev, response.data]);
          break;
        default:
          showSnackbar('未知配置类型', 'error');
          return;
      }

      showSnackbar('添加成功', 'success');
      setAddForm({});
    } catch (error) {
      console.error('添加配置失败:', error);
      showSnackbar('添加失败', 'error');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  // 渲染期数管理
  const renderPhasesTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>添加新期数</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="期数代码"
                  name="code"
                  value={addForm.code || ''}
                  onChange={handleAddInputChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="期数名称"
                  name="name"
                  value={addForm.name || ''}
                  onChange={handleAddInputChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="描述"
                  name="description"
                  value={addForm.description || ''}
                  onChange={handleAddInputChange}
                  multiline
                  rows={2}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleAdd('phase')}
                >
                  添加期数
                </ActionButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>期数列表</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>代码</TableCell>
                    <TableCell>名称</TableCell>
                    <TableCell>描述</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {phases.map((phase) => (
                    <TableRow key={phase.id}>
                      <TableCell>{phase.code}</TableCell>
                      <TableCell>{phase.name}</TableCell>
                      <TableCell>{phase.description || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(phase, 'phase')}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(phase.id, 'phase')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // 渲染工序管理
  const renderProcessesTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>添加新工序</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="工序代码"
                  name="code"
                  value={addForm.code || ''}
                  onChange={handleAddInputChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="工序名称"
                  name="name"
                  value={addForm.name || ''}
                  onChange={handleAddInputChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="描述"
                  name="description"
                  value={addForm.description || ''}
                  onChange={handleAddInputChange}
                  multiline
                  rows={2}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleAdd('process')}
                >
                  添加工序
                </ActionButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>工序列表</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>代码</TableCell>
                    <TableCell>名称</TableCell>
                    <TableCell>描述</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processes.map((process) => (
                    <TableRow key={process.id}>
                      <TableCell>{process.code}</TableCell>
                      <TableCell>{process.name}</TableCell>
                      <TableCell>{process.description || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(process, 'process')}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(process.id, 'process')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // 渲染班次类型管理
  const renderShiftTypesTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>添加新班次类型</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="班次代码"
                  name="code"
                  value={addForm.code || ''}
                  onChange={handleAddInputChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="班次名称"
                  name="name"
                  value={addForm.name || ''}
                  onChange={handleAddInputChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="描述"
                  name="description"
                  value={addForm.description || ''}
                  onChange={handleAddInputChange}
                  multiline
                  rows={2}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleAdd('shift_type')}
                >
                  添加班次类型
                </ActionButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>班次类型列表</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>代码</TableCell>
                    <TableCell>名称</TableCell>
                    <TableCell>描述</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shiftTypes.map((shiftType) => (
                    <TableRow key={shiftType.id}>
                      <TableCell>{shiftType.code}</TableCell>
                      <TableCell>{shiftType.name}</TableCell>
                      <TableCell>{shiftType.description || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(shiftType, 'shift_type')}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(shiftType.id, 'shift_type')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // 渲染产线管理
  const renderProductionLinesTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info">
          产线管理功能将在后续版本中实现。产线与期数关联，可通过期数管理间接配置。
        </Alert>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <StyledPaper elevation={0} sx={{ p: 0, background: 'transparent' }}>
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              配置数据管理
            </Typography>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="期数管理" />
              <Tab label="工序管理" />
              <Tab label="产线管理" />
              <Tab label="班次类型管理" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && renderPhasesTab()}
            {activeTab === 1 && renderProcessesTab()}
            {activeTab === 2 && renderProductionLinesTab()}
            {activeTab === 3 && renderShiftTypesTab()}
          </Box>
        </Paper>
      </StyledPaper>

      {/* 编辑对话框 */}
      {editingItem && (
        <Dialog open={!!editingItem} onClose={handleCancelEdit}>
          <DialogTitle>编辑 {editingItem.type === 'phase' ? '期数' : editingItem.type === 'process' ? '工序' : '配置'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={editingItem.type === 'phase' ? '期数代码' : '工序代码'}
                  name="code"
                  value={editForm.code || ''}
                  onChange={handleInputChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={editingItem.type === 'phase' ? '期数名称' : '工序名称'}
                  name="name"
                  value={editForm.name || ''}
                  onChange={handleInputChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="描述"
                  name="description"
                  value={editForm.description || ''}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  size="small"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <ActionButton onClick={handleCancelEdit} startIcon={<CancelIcon />}>
              取消
            </ActionButton>
            <ActionButton onClick={handleSaveEdit} variant="contained" startIcon={<SaveIcon />}>
              保存
            </ActionButton>
          </DialogActions>
        </Dialog>
      )}

      {/* 通知消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConfigurationManagement;