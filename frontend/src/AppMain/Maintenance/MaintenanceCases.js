import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import StableSearchInput from '../Components/StableSearchInput';
import {
  Container, 
  Typography, 
  Grid, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify'; // 导入toast通知组件
import 'react-toastify/dist/ReactToastify.css'; // 导入toast样式
import axios from 'axios';

const MaintenanceCases = () => {
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef('');
  const [searchInput, setSearchInput] = useState(''); // 保留这个状态用于显示，但使用ref来处理输入
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCase, setCurrentCase] = useState({
    id: null,
    process: '',
    equipment_name: '',
    fault_reason: '',
    fault_phenomenon: '',
    fault_handling_method: ''
  });
  const [loading, setLoading] = useState(true);

  // 工段选项
  const processes = [
    { value: 'molding', label: '成型工段' },
    { value: 'assembly', label: '装配工段' },
    { value: 'packaging', label: '包装工段' },
    { value: 'quality_control', label: '质量控制' },
    { value: 'maintenance', label: '维修工段' },
    { value: 'other', label: '其他' }
  ];

  // 获取维修案例列表
  useEffect(() => {
    fetchCases();
  }, []);

  // 处理搜索输入变化 - 不执行自动搜索
  const handleSearchInputChange = useCallback((event) => {
    const value = event.target.value;
    searchInputRef.current = value;  // 更新 ref 的值
    setSearchInput(value);  // 同时更新状态以确保 UI 同步
  }, []); // 不依赖任何外部变量

  // 执行搜索 - 按钮触发
  const handleCasesSearch = useCallback((searchValue) => {
    const searchTerm = searchValue !== undefined ? searchValue : (searchInputRef.current || searchInput); // 优先使用传入的值
    if (searchTerm.trim() === '') {
      setFilteredCases(cases);
    } else {
      const term = searchTerm.toLowerCase();
      const results = cases.filter(c => 
        c.equipment_name.toLowerCase().includes(term) ||
        c.fault_reason.toLowerCase().includes(term) ||
        c.fault_phenomenon.toLowerCase().includes(term) ||
        c.fault_handling_method.toLowerCase().includes(term)
      );
      setFilteredCases(results);
    }
  }, [searchInput, cases]); // 使用 useCallback 并添加依赖

  const fetchCases = async () => {
    try {
      const response = await axios.get('/api/db/maintenance-cases/');
      const newCases = response.data;
      setCases(newCases);
      
      // 根据当前搜索词重新过滤故障案例
      if (searchInput.trim() === '') {
        // 如果没有搜索词，显示所有故障案例
        setFilteredCases(newCases);
      } else {
        // 如果有搜索词，重新应用过滤
        const term = searchInput.toLowerCase();
        const results = newCases.filter(c => 
          c.equipment_name.toLowerCase().includes(term) ||
          c.fault_reason.toLowerCase().includes(term) ||
          c.fault_phenomenon.toLowerCase().includes(term) ||
          c.fault_handling_method.toLowerCase().includes(term)
        );
        setFilteredCases(results);
      }
    } catch (error) {
      console.error('获取故障案例失败:', error);
      toast.error('获取故障案例失败');
    }
  };

  const handleOpenDialog = (caseItem = null) => {
    if (caseItem) {
      setCurrentCase({
        ...caseItem
      });
    } else {
      setCurrentCase({
        id: null,
        process: '',
        equipment_name: '',
        fault_reason: '',
        fault_phenomenon: '',
        fault_handling_method: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCase({
      id: null,
      process: '',
      equipment_name: '',
      fault_reason: '',
      fault_phenomenon: '',
      fault_handling_method: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCase(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCase.id) {
        // 更新现有案例
        await axios.put(`/api/db/maintenance-cases/${currentCase.id}/`, currentCase);
      } else {
        // 创建新案例
        await axios.post('/api/db/maintenance-cases/', currentCase);
      }
      fetchCases();
      handleCloseDialog();
    } catch (error) {
      console.error('保存维修案例失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个维修案例吗？')) {
      try {
        await axios.delete(`/api/db/maintenance-cases/${id}/`);
        fetchCases();
      } catch (error) {
        console.error('删除维修案例失败:', error);
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          维修故障案例
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          特殊故障案例及处理方法的详细记录
        </Typography>
      </Box>

      <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StableSearchInput
            onSearch={handleCasesSearch}
            placeholder="搜索故障案例..."
            sx={{
              width: { xs: '100%', sm: '300px' }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} textAlign="right">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            添加故障案例
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Typography>加载中...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>工段</TableCell>
                <TableCell>设备名称</TableCell>
                <TableCell>故障原因</TableCell>
                <TableCell>故障现象</TableCell>
                <TableCell>处理方法</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {processes.find(p => p.value === c.process)?.label || c.process}
                  </TableCell>
                  <TableCell>{c.equipment_name}</TableCell>
                  <TableCell>{c.fault_reason?.substring(0, 30)}...</TableCell>
                  <TableCell>{c.fault_phenomenon?.substring(0, 30)}...</TableCell>
                  <TableCell>{c.fault_handling_method?.substring(0, 30)}...</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleOpenDialog(c)}
                      sx={{ mr: 1 }}
                    >
                      编辑
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small" 
                      onClick={() => handleDelete(c.id)}
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 添加/编辑维修案例对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentCase.id ? '编辑故障案例' : '添加故障案例'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>工段</InputLabel>
                  <Select
                    name="process"
                    value={currentCase.process}
                    onChange={handleInputChange}
                  >
                    {processes.map(process => (
                      <MenuItem key={process.value} value={process.value}>
                        {process.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="设备名称"
                  name="equipment_name"
                  value={currentCase.equipment_name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="故障原因"
                  name="fault_reason"
                  value={currentCase.fault_reason}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="故障现象"
                  name="fault_phenomenon"
                  value={currentCase.fault_phenomenon}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="故障处理方法"
                  name="fault_handling_method"
                  value={currentCase.fault_handling_method}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  placeholder="详细描述故障处理方法，可以包含图片或视频的说明..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>取消</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentCase.id ? '更新' : '创建'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default MaintenanceCases;