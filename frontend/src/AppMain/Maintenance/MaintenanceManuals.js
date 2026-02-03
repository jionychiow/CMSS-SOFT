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
  Box,
  Toolbar,
  Chip,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../AuthProvider/AuthContext'; // 导入认证上下文
import { url } from '../../Config'; // 导入配置文件中的URL
import { ToastContainer, toast } from 'react-toastify'; // 导入toast通知组件
import 'react-toastify/dist/ReactToastify.css'; // 导入toast样式

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

const MaintenanceManuals = () => {
  const authContext = useContext(AuthContext);
  const [manuals, setManuals] = useState([]);
  const [filteredManuals, setFilteredManuals] = useState([]);
  const searchInputRef = useRef('');
  const [searchInput, setSearchInput] = useState(''); // 保留这个状态用于显示，但使用ref来处理输入
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openStepsDialog, setOpenStepsDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState({
    id: null,
    step_number: 1,
    title: '',
    description: '',
    image: null,
    video: null
  });
  const [openAddStepDialog, setOpenAddStepDialog] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 当前选中的步骤索引
  const [currentManual, setCurrentManual] = useState({
    id: null,
    title: '',
    phase: '', // 添加期数字段
    production_line: '',
    process: '',
    equipment_name: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [configData, setConfigData] = useState({
    phases: [],
    productionLines: [],
    processes: []
  });

  // 获取维修手册列表
  const fetchManuals = useCallback(async () => {
    try {
      const token = authContext?.state?.token;
      const response = await axios.get(`${url}/api/db/maintenance-manuals/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      const newManuals = response.data;
      console.log('DEBUG: Fetched manuals with steps:', newManuals.map(m => ({ 
        title: m.title, 
        stepsCount: m.steps?.length || 0,
        stepsWithImages: m.steps?.filter(s => s.image).length || 0,
        stepsWithVideos: m.steps?.filter(s => s.video).length || 0
      })));
      setManuals(newManuals);
      
      // 更新过滤后的数据，相当于执行一次空搜索
      if (searchInputRef.current && searchInputRef.current.trim() !== '') {
        const term = searchInputRef.current.toLowerCase();
        const results = newManuals.filter(manual =>
          manual.title.toLowerCase().includes(term) ||
          manual.equipment_name.toLowerCase().includes(term) ||
          manual.description.toLowerCase().includes(term)
        );
        setFilteredManuals(results);
      } else {
        // 如果没有搜索条件，显示所有手册
        setFilteredManuals(newManuals);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('获取维修手册失败:', error);
      setLoading(false);
    }
  }, [authContext]); // 移除了searchInput依赖，避免每次输入都重新定义函数

  // 获取配置数据
  const fetchConfigData = useCallback(async () => {
    try {
      console.log('开始获取配置数据...');
      const token = authContext?.state?.token; // 从认证上下文获取token
      console.log('Token:', token ? '存在' : '不存在');
      
      const response = await axios.get(`${url}/api/maintenance/config/get-config-data/`, {
              headers: {
                'Authorization': `Token ${token}`
              }
            });
      
      console.log('API响应数据:', response.data);
      
      setConfigData({
        phases: response.data.phases || [],
        productionLines: response.data.productionLines || [],
        processes: response.data.processes || []
      });
      
      console.log('配置数据设置完成:', {
        phasesCount: response.data.phases?.length || 0,
        productionLinesCount: response.data.productionLines?.length || 0,
        processesCount: response.data.processes?.length || 0
      });
    } catch (error) {
      console.error('获取配置数据失败:', error);
      // 添加更详细的错误信息
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request data:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    }
  }, [authContext]); // url是常量，不需要作为依赖

  // 获取维修手册列表和配置数据
  useEffect(() => {
    fetchManuals();
    fetchConfigData();
  }, [fetchManuals, fetchConfigData]);

  // 处理搜索输入变化 - 不执行自动搜索
  const handleSearchInputChange = useCallback((event) => {
    const value = event.target.value;
    searchInputRef.current = value;  // 更新 ref 的值
    setSearchInput(value);  // 同时更新状态以确保 UI 同步
  }, []); // 不依赖任何外部变量

  // 执行搜索 - 按钮触发
  const handleManualsSearch = useCallback((searchValue) => {
    const searchTerm = searchValue !== undefined ? searchValue : (searchInputRef.current || searchInput); // 优先使用传入的值
    if (searchTerm.trim() === '') {
      setFilteredManuals(manuals);
    } else {
      const term = searchTerm.toLowerCase();
      const results = manuals.filter(manual =>
        manual.title.toLowerCase().includes(term) ||
        manual.equipment_name.toLowerCase().includes(term) ||
        manual.description.toLowerCase().includes(term)
      );
      setFilteredManuals(results);
    }
  }, [manuals]); // 使用 useCallback 包装搜索函数，使用ref来获取最新的搜索值

  const handleOpenDialog = (manual = null) => {
    if (manual) {
      // 编辑现有手册
      setCurrentManual({
        id: manual.uuid,  // 使用uuid作为ID
        uuid: manual.uuid,
        title: manual.title,
        production_line: manual.production_line,
        process: manual.process,
        equipment_name: manual.equipment_name,
        description: manual.description
      });
    } else {
      // 创建新手册
      setCurrentManual({
        id: null,
        uuid: null,
        title: '',
        production_line: '',
        process: '',
        equipment_name: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleManageSteps = (manual) => {
    setCurrentManual(manual);
    setOpenStepsDialog(true);
  };

  const handleCloseStepsDialog = () => {
    setOpenStepsDialog(false);
    // 重新获取数据以显示最新步骤
    fetchManuals();
  };

  const handleOpenAddStepDialog = (stepToEdit = null) => {
    if (stepToEdit) {
      // 编辑现有步骤 - 保留现有文件URL，但文件对象设为null（因为不能从URL重建File对象）
      setCurrentStep({
        id: stepToEdit.id,
        step_number: stepToEdit.step_number,
        title: stepToEdit.title,
        description: stepToEdit.description,
        image: stepToEdit.image || null,  // 保留现有图片URL
        video: stepToEdit.video || null   // 保留现有视频URL
      });
    } else {
      // 添加新步骤
      setCurrentStep({
        id: null,
        step_number: currentManual.steps ? Math.max(...currentManual.steps.map(step => step.step_number), 0) + 1 : 1,
        title: '',
        description: '',
        image: null,
        video: null
      });
    }
    setOpenAddStepDialog(true);
  };

  const handleCloseAddStepDialog = () => {
    setOpenAddStepDialog(false);
    setCurrentStep({
      id: null,
      step_number: 1,
      title: '',
      description: '',
      image: null,
      video: null
    });
  };

  const handleStepInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStep(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepImageChange = (e) => {
    const file = e.target.files[0];
    console.log('DEBUG: handleStepImageChange - Selected file:', file);
    if (file) {
      console.log('DEBUG: File details - Name:', file.name, 'Size:', file.size, 'Type:', file.type);
    }
    setCurrentStep(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleStepVideoChange = (e) => {
    const file = e.target.files[0];
    console.log('DEBUG: handleStepVideoChange - Selected file:', file);
    if (file) {
      console.log('DEBUG: File details - Name:', file.name, 'Size:', file.size, 'Type:', file.type);
    }
    setCurrentStep(prev => ({
      ...prev,
      video: file
    }));
  };

  const handleSaveStep = async (e) => {
    e?.preventDefault();  // 添加可选链以处理可能的事件参数
    console.log('DEBUG: handleSaveStep called, currentStep:', JSON.stringify(currentStep, null, 2));
    console.log('DEBUG: Checking if files exist - image:', !!currentStep.image, 'video:', !!currentStep.video);
    if (currentStep.image) {
      console.log('DEBUG: Image details - name:', currentStep.image.name, 'size:', currentStep.image.size, 'type:', currentStep.image.type);
    }
    if (currentStep.video) {
      console.log('DEBUG: Video details - name:', currentStep.video.name, 'size:', currentStep.video.size, 'type:', currentStep.video.type);
    }
    
    try {
      const token = authContext?.state?.token;
      const formData = new FormData();
      formData.append('manual', currentManual.uuid);
      formData.append('step_number', currentStep.step_number);
      formData.append('title', currentStep.title);
      formData.append('description', currentStep.description);
      
      console.log('DEBUG: About to append files to formData...');
      
      if (currentStep.image && typeof currentStep.image !== 'string') {
        // 如果image是一个File对象（新上传的文件），则添加到formData
        formData.append('image', currentStep.image);
        console.log('DEBUG: Appended image file to formData:', currentStep.image.name, currentStep.image.size, 'bytes');
      } else if (currentStep.image && typeof currentStep.image === 'string' && currentStep.id) {
        // 如果在编辑现有步骤时，image是字符串（URL），则不发送image字段，让后端保留原文件
        console.log('DEBUG: Keeping existing image for update');
      }
      
      if (currentStep.video && typeof currentStep.video !== 'string') {
        // 如果video是一个File对象（新上传的文件），则添加到formData
        formData.append('video', currentStep.video);
        console.log('DEBUG: Appended video file to formData:', currentStep.video.name, currentStep.video.size, 'bytes');
      } else if (currentStep.video && typeof currentStep.video === 'string' && currentStep.id) {
        // 如果在编辑现有步骤时，video是字符串（URL），则不发送video字段，让后端保留原文件
        console.log('DEBUG: Keeping existing video for update');
      }

      // 检查formData的内容
      for (let pair of formData.entries()) {
        console.log('DEBUG: FormData entry - ', pair[0], ':', pair[1]);
      }
      
      if (currentStep.id) {
        // 更新现有步骤
        console.log('DEBUG: Updating step with ID:', currentStep.id);
        var response = await axios.put(`${url}/api/db/maintenance-steps/${currentStep.id}/`, formData, {
          headers: {
            'Authorization': `Token ${token}`,
            // 注意：不要手动设置 'Content-Type'，让浏览器自动设置 multipart/form-data 及 boundary
          }
        });
      } else {
        // 创建新步骤
        console.log('DEBUG: Creating new step');
        var response = await axios.post(`${url}/api/db/maintenance-steps/`, formData, {
          headers: {
            'Authorization': `Token ${token}`,
            // 注意：不要手动设置 'Content-Type'，让浏览器自动设置 multipart/form-data 及 boundary
          }
        });
      }
      
      toast.success(currentStep.id ? '步骤更新成功' : '步骤添加成功');
      handleCloseAddStepDialog();
      // 重新获取数据以显示最新步骤
      fetchManuals();
      // 同时更新当前手册的步骤信息
      if (!currentStep.id) {
        // 如果是新增步骤
        setCurrentManual(prevManual => ({
          ...prevManual,
          steps: prevManual.steps ? [...prevManual.steps, response.data] : [response.data]
        }));
      } else {
        // 如果是更新步骤，我们需要获取更新后的步骤数据
        const updatedStepResponse = await axios.get(`${url}/api/db/maintenance-steps/${currentStep.id}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setCurrentManual(prevManual => ({
          ...prevManual,
          steps: prevManual.steps ? 
            prevManual.steps.map(step => step.id === currentStep.id ? updatedStepResponse.data : step) 
            : [updatedStepResponse.data]
        }));
      }
    } catch (error) {
      console.error('保存步骤失败:', error);
      console.error('错误详情:', error.response?.data);
      const errorMessage = error.response?.data ? 
        Object.values(error.response.data).flat().join(', ') : 
        '保存步骤失败';
      toast.error(`保存步骤失败: ${errorMessage}`);
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (window.confirm('确定要删除这个步骤吗？')) {
      try {
        const token = authContext?.state?.token;
        await axios.delete(`${url}/api/db/maintenance-steps/${stepId}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        toast.success('步骤删除成功');
        // 重新获取数据以显示最新步骤
        fetchManuals();
        // 同时更新当前手册的步骤信息
        setCurrentManual(prevManual => ({
          ...prevManual,
          steps: prevManual.steps ? prevManual.steps.filter(step => step.id !== stepId) : []
        }));
      } catch (error) {
        console.error('删除步骤失败:', error);
        console.error('错误详情:', error.response?.data);
        const errorMessage = error.response?.data ? 
          Object.values(error.response.data).flat().join(', ') : 
          '删除步骤失败';
        toast.error(`删除步骤失败: ${errorMessage}`);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentManual({
      id: null,
      title: '',
      production_line: '',
      process: '',
      equipment_name: '',
      description: ''
    });
  };

  const handleOpenDetailDialog = (manual) => {
    setCurrentManual(manual);
    // 如果有步骤，默认显示第一个步骤；如果没有步骤，则显示手册描述
    setCurrentStepIndex(manual.steps && manual.steps.length > 0 ? 0 : -1);
    setOpenDetailDialog(true);
  };

  const handleViewSteps = (manual) => {
    handleOpenDetailDialog(manual);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentManual(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = authContext?.state?.token;
      console.log('DEBUG: Token exists:', !!token);
      
      // 准备要发送的数据，移除不必要的字段
      const manualData = {
        title: currentManual.title,
        phase: currentManual.phase,
        production_line: currentManual.production_line,
        process: currentManual.process,
        equipment_name: currentManual.equipment_name,
        description: currentManual.description
      };
      
      console.log('DEBUG: Submitting manual data:', manualData);

      if (currentManual.id) {
        // 更新现有手册 (使用uuid)
        console.log('DEBUG: Updating manual with ID:', currentManual.id);
        await axios.put(`${url}/api/db/maintenance-manuals/${currentManual.id}/`, manualData, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
      } else {
        // 创建新手册
        console.log('DEBUG: Creating new manual');
        const response = await axios.post(`${url}/api/db/maintenance-manuals/`, manualData, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        console.log('DEBUG: Manual creation response:', response);
      }
      fetchManuals();
      handleCloseDialog();
      toast.success(currentManual.id ? '维修手册更新成功' : '维修手册创建成功');
    } catch (error) {
      console.error('保存维修手册失败:', error);
      console.error('错误详情:', error.response?.data);
      let errorMessage = '保存维修手册失败';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          errorMessage = Object.values(error.response.data)
            .flat()
            .join(', ');
        } else {
          errorMessage = String(error.response.data);
        }
      }
      toast.error(`保存维修手册失败: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个维修手册吗？')) {
      console.log('DEBUG: Attempting to delete manual with ID:', id);
      try {
        const token = authContext?.state?.token;
        // 使用uuid作为标识符
        const response = await axios.delete(`${url}/api/db/maintenance-manuals/${id}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        console.log('DEBUG: Delete response:', response);
        fetchManuals();
        toast.success('维修手册删除成功');
      } catch (error) {
        console.error('删除维修手册失败:', error);
        console.error('错误详情:', error.response?.data);
        console.error('错误状态码:', error.response?.status);
        let errorMessage = '删除维修手册失败';
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (typeof error.response.data === 'object') {
            errorMessage = Object.values(error.response.data)
              .flat()
              .join(', ');
          } else {
            errorMessage = String(error.response.data);
          }
        }
        toast.error(`删除维修手册失败: ${errorMessage}`);
      }
    }
  };



  return (
    <div style={{ flexGrow: 1, overflow: 'hidden' }}>
      <Container maxWidth="xl" style={{ paddingTop: '20px' }}>
        {/* 页面头部 */}
        <HeaderCard>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                维修手册管理系统
              </Typography>
              <Typography variant="h6" component="p" sx={{ opacity: 0.9 }}>
                设备维修指导文档中心
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                label="维修手册"
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
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
                维修手册
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <StableSearchInput
                onSearch={handleManualsSearch}
                placeholder="搜索维修手册..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'white',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&.Mui-focused': {
                      color: 'white',
                    },
                  },
                  width: { xs: '100%', sm: '300px' }
                }}
              />
              
              <ActionButton 
                variant="contained"
                color="inherit"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ 
                  px: 2,
                  color: '#1976d2',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: '#f0f4f8'
                  }
                }}
              >
                添加手册
              </ActionButton>
            </Box>
          </Toolbar>
        </HeaderCard>

      {loading ? (
        <Typography>加载中...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>标题</TableCell>
                <TableCell>期数</TableCell>
                <TableCell>生产线</TableCell>
                <TableCell>工段</TableCell>
                <TableCell>设备名称</TableCell>
                <TableCell>描述</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredManuals.map((manual) => (
                <TableRow key={manual.uuid || manual.id}>
                  <TableCell>
                    <Button 
                      variant="text" 
                      size="small"
                      onClick={() => handleViewSteps(manual)}
                      sx={{ 
                        textTransform: 'none',
                        fontSize: 'inherit',
                        color: 'inherit',
                        padding: 0,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {manual.title}
                    </Button>
                  </TableCell>
                  <TableCell>{manual.phase || '-'}</TableCell>
                  <TableCell>{manual.production_line}</TableCell>
                  <TableCell>
                    {configData.processes.find(p => p.code === manual.process)?.name || manual.process}
                  </TableCell>
                  <TableCell>{manual.equipment_name}</TableCell>
                  <TableCell>{manual.description?.substring(0, 50)}...</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleOpenDialog(manual)}
                      sx={{ mr: 1 }}
                    >
                      编辑手册
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleManageSteps(manual)}
                      sx={{ mr: 1 }}
                    >
                      编辑步骤
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small" 
                      onClick={() => handleDelete(manual.uuid)}
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

      {/* 添加/编辑维修手册对话框 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentManual.id ? '编辑维修手册' : '添加维修手册'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="手册标题"
                  name="title"
                  value={currentManual.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>期数</InputLabel>
                  <Select
                    name="phase"
                    value={currentManual.phase || ''}
                    onChange={handleInputChange}
                  >
                    {configData.phases.map(phase => (
                      <MenuItem key={phase.code} value={phase.name}>{phase.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>生产线</InputLabel>
                  <Select
                    name="production_line"
                    value={currentManual.production_line || ''}
                    onChange={handleInputChange}
                    disabled={!currentManual.phase} // 当没有选择期数时禁用产线选择
                  >
                    {configData.productionLines
                      .filter(line => 
                        !currentManual.phase || 
                        configData.phases.find(p => p.name === currentManual.phase)?.code === line.phase_code
                      )
                      .map(line => (
                        <MenuItem key={line.code} value={line.name}>{line.name}</MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>工段</InputLabel>
                  <Select
                    name="process"
                    value={currentManual.process || ''}
                    onChange={handleInputChange}
                  >
                    {configData.processes.map(process => (
                      <MenuItem key={process.code} value={process.code}>{process.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="设备名称"
                  name="equipment_name"
                  value={currentManual.equipment_name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="手册描述"
                  name="description"
                  value={currentManual.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="维修步骤"
                  name="repair_steps"
                  value={currentManual.repair_steps}
                  onChange={handleInputChange}
                  multiline
                  rows={6}
                  placeholder="详细描述维修步骤，可以包含图片或视频的说明..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>取消</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentManual.id ? '更新' : '创建'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* 维修手册详情对话框 - 类似CHM布局 */}
      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDetailDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          style: {
            width: '80vw',
            height: '80vh',
            maxWidth: 'none'
          }
        }}
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6" component="div">
              {currentManual.title}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary" component="div">
              {currentManual.equipment_name} - {currentManual.production_line} - {currentManual.process}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          padding: 0,
          flex: 1
        }}>
          {/* 左侧步骤导航栏 */}
          <Box 
            sx={{ 
              minWidth: { xs: '100%', sm: 200 }, 
              maxWidth: { xs: '100%', sm: 250 },
              borderRight: { xs: 'none', sm: '1px solid #e0e0e0' },
              borderBottom: { xs: '1px solid #e0e0e0', sm: 'none' },
              overflowY: 'auto',
              height: { xs: '200px', sm: 'auto' }
            }}
          >
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="手册描述" 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontWeight: currentStepIndex === -1 ? 'bold' : 'normal',
                      cursor: 'pointer',
                      color: currentStepIndex === -1 ? '#1976d2' : 'inherit'
                    }
                  }}
                  onClick={() => setCurrentStepIndex(-1)}
                />
              </ListItem>
              <Divider />
              {currentManual.steps && currentManual.steps.length > 0 ? (
                currentManual.steps
                  .sort((a, b) => a.step_number - b.step_number)
                  .map((step, index) => (
                    <React.Fragment key={step.id}>
                      <ListItem 
                        component="div"
                        selected={currentStepIndex === index}
                        onClick={() => setCurrentStepIndex(index)}
                        sx={{
                          backgroundColor: currentStepIndex === index ? '#e3f2fd' : 'transparent',
                          '&:hover': {
                            backgroundColor: '#f5f5f5'
                          },
                          cursor: 'pointer'
                        }}
                      >
                        <ListItemText 
                          primary={`步骤 ${step.step_number}: ${step.title}`}
                          secondary={`第${index + 1}步`}
                          sx={{ 
                            '& .MuiListItemText-primary': {
                              fontSize: '0.9rem'
                            },
                            '& .MuiListItemText-secondary': {
                              fontSize: '0.8rem'
                            }
                          }}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
              ) : (
                <ListItem>
                  <ListItemText primary="暂无步骤" />
                </ListItem>
              )}
            </List>
          </Box>
          
          {/* 右侧内容显示区 */}
          <Box 
            sx={{ 
              flex: 1, 
              padding: 2, 
              overflowY: 'auto',
              maxHeight: 'calc(80vh - 120px)' // 减去标题和底部按钮的高度
            }}
          >
            {currentStepIndex === -1 ? (
              // 显示手册描述
              <Box>
                <Typography variant="h6" color="primary" gutterBottom>
                  手册描述
                </Typography>
                <Typography variant="body1" paragraph>
                  {currentManual.description}
                </Typography>
              </Box>
            ) : currentManual.steps && currentManual.steps.length > 0 && currentStepIndex < currentManual.steps.length ? (
              // 显示当前选中的步骤
              (() => {
                const step = currentManual.steps.sort((a, b) => a.step_number - b.step_number)[currentStepIndex];
                return (
                  <Box>
                    <Typography variant="h6" color="primary" gutterBottom>
                      步骤 {step.step_number}: {step.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {step.description}
                    </Typography>
                    {step.image && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" display="block" gutterBottom>
                          步骤图片 ({step.image}):
                        </Typography>
                        <img 
                          src={step.image.startsWith('http') ? step.image : `${url}${step.image}`} 
                          alt={`Step ${step.step_number}`}
                          style={{ 
                            maxWidth: '100%', 
                            height: 'auto',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            border: '1px solid #ddd'
                          }}
                          onError={(e) => {
                            console.error('图片加载失败:', step.image, '| Full URL:', step.image.startsWith('http') ? step.image : `${url}${step.image}`);
                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"><rect width="200" height="100" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="%23666">图片无法加载</text></svg>';
                          }}
                          onLoad={(e) => {
                            console.log('图片加载成功:', step.image, '| Full URL:', step.image.startsWith('http') ? step.image : `${url}${step.image}`);
                          }}
                        />
                      </Box>
                    )}
                    {step.video && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" display="block" gutterBottom>
                          步骤视频 ({step.video}):
                        </Typography>
                        <video 
                          controls
                          style={{ 
                            maxWidth: '100%', 
                            height: 'auto',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            border: '1px solid #ddd'
                          }}
                          onError={(e) => {
                            console.error('视频加载失败:', step.video, '| Full URL:', step.video.startsWith('http') ? step.video : `${url}${step.video}`);
                          }}
                        >
                          <source src={step.video.startsWith('http') ? step.video : `${url}${step.video}`} type="video/mp4" />
                          您的浏览器不支持视频播放。
                        </video>
                      </Box>
                    )}
                  </Box>
                );
              })()
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  请选择一个步骤查看详细内容。
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>关闭</Button>
        </DialogActions>
      </Dialog>
      
      {/* 步骤管理对话框 */}
      <Dialog 
        open={openStepsDialog} 
        onClose={handleCloseStepsDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          style: {
            minHeight: '70vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6" component="div">
              管理维修步骤 - {currentManual.title}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary" component="div">
              {currentManual.equipment_name} - {currentManual.production_line} - {currentManual.process}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box>
            {currentManual.steps && currentManual.steps.length > 0 ? (
              <Box>
                {currentManual.steps.sort((a, b) => a.step_number - b.step_number).map((step) => (
                  <Box key={step.id} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" color="primary" component="div">
                          步骤 {step.step_number}: {step.title}
                        </Typography>
                      </Box>
                      <Box>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleOpenAddStepDialog(step)}
                          sx={{ mr: 1 }}
                        >
                          编辑
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteStep(step.id)}
                        >
                          删除
                        </Button>
                      </Box>
                    </Box>
                    <Typography variant="body2" paragraph>
                      {step.description}
                    </Typography>
                    {step.image && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" display="block">
                          步骤图片 ({step.image}):
                        </Typography>
                        <img 
                          src={step.image.startsWith('http') ? step.image : `${url}${step.image}`} 
                          alt={`Step ${step.step_number}`}
                          style={{ 
                            maxWidth: '200px', 
                            height: 'auto',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            console.error('图片加载失败:', step.image, '| Full URL:', step.image.startsWith('http') ? step.image : `${url}${step.image}`);
                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"><rect width="200" height="100" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="%23666">图片无法加载</text></svg>';
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                此手册暂无维修步骤信息。
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStepsDialog}>关闭</Button>
          <Button 
              variant="contained" 
              onClick={handleOpenAddStepDialog}
            >
              添加步骤
            </Button>
        </DialogActions>
      </Dialog>
      
      {/* 添加/编辑步骤对话框 */}
      <Dialog 
        open={openAddStepDialog} 
        onClose={handleCloseAddStepDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {currentStep.id ? '编辑步骤' : '添加步骤'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="步骤序号"
                name="step_number"
                type="number"
                value={currentStep.step_number}
                onChange={handleStepInputChange}
                margin="normal"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="步骤标题"
                name="title"
                value={currentStep.title}
                onChange={handleStepInputChange}
                margin="normal"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="步骤描述"
                name="description"
                value={currentStep.description}
                onChange={handleStepInputChange}
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <label htmlFor="step-image-upload">
                <input
                  accept="image/*"
                  id="step-image-upload"
                  type="file"
                  capture="environment"  /* 移动设备上直接调用后置摄像头 */
                  style={{ display: 'none' }}
                  onChange={handleStepImageChange}
                />
                <Button 
                  variant="outlined" 
                  component="span"
                  fullWidth
                >
                  {currentStep.image ? '已选择图片' : '上传步骤图片'}
                </Button>
              </label>
              {currentStep.image && (
                <Typography variant="caption" color="textSecondary">
                  {typeof currentStep.image === 'string' ? currentStep.image.split('/').pop() : currentStep.image.name}
                </Typography>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <label htmlFor="step-video-upload">
                <input
                  accept="video/*"
                  id="step-video-upload"
                  type="file"
                  capture="environment"  /* 移动设备上直接调用后置摄像头 */
                  style={{ display: 'none' }}
                  onChange={handleStepVideoChange}
                />
                <Button 
                  variant="outlined" 
                  component="span"
                  fullWidth
                >
                  {currentStep.video ? '已选择视频' : '上传步骤视频'}
                </Button>
              </label>
              {currentStep.video && (
                <Typography variant="caption" color="textSecondary">
                  {typeof currentStep.video === 'string' ? currentStep.video.split('/').pop() : currentStep.video.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddStepDialog}>取消</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveStep}
          >
            {currentStep.id ? '更新' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </Container>
    </div>
  );
};

export default MaintenanceManuals;