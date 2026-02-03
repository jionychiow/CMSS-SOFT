import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import StableSearchInput from '../../Components/StableSearchInput';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  TextField,
  InputAdornment,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Chip,
  FormControlLabel,
  Switch,
  Tooltip,
  useMediaQuery,
  useTheme,
  Toolbar,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import CheckIcon from '@mui/icons-material/Check';
import BuildIcon from '@mui/icons-material/Build';
import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { url as url_base } from '../../../Config';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../../../AuthProvider/AuthContext';
import TaskPlanForm from '../TaskPlanForm/TaskPlanForm';

const TaskPlanTable = () => {
  const { state: authState } = useContext(AuthContext);
  const { token } = authState;

  const [taskPlans, setTaskPlans] = useState([]);
  const [filteredTaskPlans, setFilteredTaskPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editingTaskPlan, setEditingTaskPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all'); // 月份选择状态
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false); // 下载对话框状态

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // 定义样式组件
  const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: isMobile ? 8 : 16,
    boxShadow: isMobile ? '0 4px 16px rgba(0, 0, 0, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.9) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  }));

  const HeaderCard = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
    color: 'white',
    borderRadius: isMobile ? '8px' : '16px',
    padding: isMobile ? '12px' : '24px',
    marginBottom: isMobile ? '12px' : '32px',
    boxShadow: isMobile ? '0 4px 16px rgba(25, 118, 210, 0.3)' : '0 8px 32px rgba(25, 118, 210, 0.3)',
  }));

  useEffect(() => {
    fetchTaskPlans();
  }, []);

  // 添加事件监听器以响应来自父组件的新增请求
  useEffect(() => {
    const handleOpenNewForm = () => {
      setEditingTaskPlan(null);
      setOpenForm(true);
    };

    window.addEventListener('openNewTaskPlanForm', handleOpenNewForm);

    // 清理函数
    return () => {
      window.removeEventListener('openNewTaskPlanForm', handleOpenNewForm);
    };
  }, []);



  const fetchTaskPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url_base}/api/db/task-plans/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      const newTaskPlans = response.data;
      setTaskPlans(newTaskPlans);
      
      // 根据当前搜索词重新过滤任务计划
      if (searchInput.trim() === '') {
        // 如果没有搜索词，显示所有任务计划
        setFilteredTaskPlans(newTaskPlans);
      } else {
        // 如果有搜索词，重新应用过滤
        const term = searchInput.toLowerCase();
        const filtered = newTaskPlans.filter(taskPlan =>
          taskPlan.task_description.toLowerCase().includes(term) ||
          taskPlan.assigned_users.some(user => 
            user.username.toLowerCase().includes(term)
          ) ||
          (taskPlan.phase_name || '').toLowerCase().includes(term) ||
          (taskPlan.process_name || '').toLowerCase().includes(term) ||
          (taskPlan.production_line_name || '').toLowerCase().includes(term)
        );
        setFilteredTaskPlans(filtered);
      }
    } catch (error) {
      console.error('获取任务计划失败:', error);
      toast.error('获取任务计划失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索输入变化 - 不执行自动搜索
  const handleSearchInputChange = useCallback((event) => {
    const value = event.target.value;
    searchInputRef.current = value;  // 更新 ref 的值
    setSearchInput(value);  // 同时更新状态以确保 UI 同步
  }, []); // 不依赖任何外部变量

  // 执行搜索 - 按钮触发
  const handleTaskPlanSearch = useCallback((searchValue) => {
    const searchTerm = searchValue !== undefined ? searchValue : (searchInputRef.current || searchInput); // 优先使用传入的值
    if (searchTerm.trim() === '') {
      setFilteredTaskPlans(taskPlans);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = taskPlans.filter(taskPlan =>
        taskPlan.task_description.toLowerCase().includes(term) ||
        taskPlan.assigned_users.some(user => 
          user.username.toLowerCase().includes(term)
        ) ||
        (taskPlan.phase_name || '').toLowerCase().includes(term) ||
        (taskPlan.process_name || '').toLowerCase().includes(term) ||
        (taskPlan.production_line_name || '').toLowerCase().includes(term)
      );
      setFilteredTaskPlans(filtered);
    }
  }, [searchInput, taskPlans]); // 使用 useCallback 并添加依赖

  const filterTaskPlans = () => {
    const filtered = taskPlans.filter(taskPlan =>
      taskPlan.task_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taskPlan.assigned_users.some(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (taskPlan.phase_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (taskPlan.process_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (taskPlan.production_line_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTaskPlans(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个任务计划吗？')) {
      try {
        await axios.delete(`${url_base}/api/db/task-plans/${id}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        toast.success('任务计划已删除');
        fetchTaskPlans();
      } catch (error) {
        console.error('删除任务计划失败:', error);
        toast.error('删除任务计划失败');
      }
    }
  };

  const handleFormSubmit = () => {
    setOpenForm(false);
    setEditingTaskPlan(null);
    fetchTaskPlans(); // 重新获取数据
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleCompleteTask = async (taskPlan) => {
    try {
      await axios.patch(`${url_base}/api/db/task-plans/${taskPlan.uuid}/`, {
        ...taskPlan,
        status: 'completed',
        progress: 100
      }, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      toast.success('任务已完成');
      fetchTaskPlans(); // 重新获取数据
    } catch (error) {
      console.error('更新任务状态失败:', error);
      toast.error('更新任务状态失败');
    }
  };

  const handleProcessTask = async (taskPlan) => {
    try {
      await axios.patch(`${url_base}/api/db/task-plans/${taskPlan.uuid}/`, {
        ...taskPlan,
        status: 'in_progress',
        progress: Math.min(taskPlan.progress + 25, 75) // 简单地增加25%进度，最多到75%
      }, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      toast.success('任务状态已更新为进行中');
      fetchTaskPlans(); // 重新获取数据
    } catch (error) {
      console.error('更新任务状态失败:', error);
      toast.error('更新任务状态失败');
    }
  };

  // 处理下载记录
  const handleDownloadRecords = async () => {
    try {
      // 准备筛选参数
      const filtersToSend = { 
        month: selectedMonth  // 添加月份筛选参数
      };
      
      console.log('DEBUG: Sending download request with filters:', filtersToSend);
      
      const response = await axios.post(`${url_base}/api/db/task-plan-excel/download-task-plans/`, filtersToSend, {
        headers: {
          Authorization: `Token ${token}`,  // 修复：使用Token认证而不是Bearer
          'Content-Type': 'application/json',
        },
        responseType: 'blob' // 重要：指定响应类型为blob
      });
      
      console.log('DEBUG: Download response received, status:', response.status);
      
      // 创建下载链接
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '任务计划数据.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('任务计划数据下载成功', 'success');
      setOpenDownloadDialog(false);
    } catch (error) {
      console.error('下载任务计划数据失败:', error);
      toast.error('下载任务计划数据失败');
    }
  };

  return (
    <Box sx={{ width: '100%', p: isMobile ? 1 : 3 }}>
      <StyledPaper>
        {/* 头部卡片 */}


        {/* 搜索和工具栏 */}
        <Box sx={{ p: isMobile ? 1 : 2, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, alignItems: 'center' }}>
          <StableSearchInput
            onSearch={handleTaskPlanSearch}
            placeholder="搜索任务计划..."
            sx={{
              width: { xs: '100%', sm: '300px' }
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: isMobile ? 0 : 'auto' }}>
            <Button
              variant="outlined"
              onClick={() => {
                // 下载模板
                window.open(`${url_base}/api/db/task-plan-excel/download-template/`, '_blank');
              }}
              sx={{
                borderRadius: '8px',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              下载模板
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenDownloadDialog(true)}
              sx={{
                borderRadius: '8px',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              导出数据
            </Button>
            <input
              accept=".xlsx,.xls"
              id="upload-task-plan-file"
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  // 上传文件
                  axios.post(`${url_base}/api/db/task-plan-excel/upload-task-plans/`, formData, {
                    headers: {
                      'Authorization': `Token ${token}`,
                      'Content-Type': 'multipart/form-data'
                    }
                  })
                  .then(response => {
                    toast.success('文件上传成功！');
                    fetchTaskPlans(); // 重新获取数据
                  })
                  .catch(error => {
                    toast.error('文件上传失败：' + (error.response?.data?.message || error.message));
                  });
                }
              }}
            />
            <label htmlFor="upload-task-plan-file">
              <Button variant="outlined" component="span" sx={{
                borderRadius: '8px',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                },
              }}>
                导入数据
              </Button>
            </label>
          </Box>
        </Box>

        {/* 表格容器 */}
         <Box sx={{ 
           p: isMobile ? 0.5 : 2,
           maxHeight: isMobile ? '60vh' : '70vh',
           '&::-webkit-scrollbar': {
             height: '8px',
             width: '8px'
           },
           '&::-webkit-scrollbar-track': {
             background: '#f1f1f1',
             borderRadius: '4px'
           },
           '&::-webkit-scrollbar-thumb': {
             background: '#c1c1c1',
             borderRadius: '4px'
           },
           '&::-webkit-scrollbar-thumb:hover': {
             background: '#a8a8a8'
           }
         }}>
          <TableContainer 
              sx={{ 
                maxHeight: '100%',
                '& .MuiTableCell-root': {
                  fontSize: isMobile ? '0.7rem' : '0.875rem',
                  padding: isMobile ? '4px 2px' : '12px 8px',
                }
              }}
            >
              <Table stickyHeader size={isMobile ? "small" : "medium"} sx={{
                minWidth: isMobile ? '1000px' : 'auto', // 移动端允许水平滚动
                '& .MuiTableCell-root': {
                  padding: isMobile ? '4px 2px' : '12px 8px',
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }
              }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa', position: 'sticky', top: 0, zIndex: 10, '& > th': { borderRight: '1px solid #e0e0e0' } }}>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#e3f2fd',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '6px 4px' : '12px 8px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minWidth: '80px',
                      maxWidth: isMobile ? '120px' : '160px',
                      verticalAlign: 'top',
                      borderRight: '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                    title="日期"
                  >
                    <Box sx={{
                      wordWrap: 'break-word',
                      lineHeight: 1.3,
                      pr: 0.5
                    }}>
                      日期
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#e3f2fd',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '6px 4px' : '12px 8px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minWidth: '120px',
                      maxWidth: isMobile ? '120px' : '160px',
                      verticalAlign: 'top',
                      borderRight: '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                    title="任务计划"
                  >
                    <Box sx={{
                      wordWrap: 'break-word',
                      lineHeight: 1.3,
                      pr: 0.5
                    }}>
                      任务计划
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#e3f2fd',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '6px 4px' : '12px 8px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minWidth: '100px',
                      maxWidth: isMobile ? '120px' : '160px',
                      verticalAlign: 'top',
                      borderRight: '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                    title="任务实施人"
                  >
                    <Box sx={{
                      wordWrap: 'break-word',
                      lineHeight: 1.3,
                      pr: 0.5
                    }}>
                      任务实施人
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#e3f2fd',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '6px 4px' : '12px 8px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minWidth: '60px',
                      maxWidth: isMobile ? '120px' : '160px',
                      verticalAlign: 'top',
                      borderRight: '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                    title="人数"
                  >
                    <Box sx={{
                      wordWrap: 'break-word',
                      lineHeight: 1.3,
                      pr: 0.5
                    }}>
                      人数
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#e3f2fd',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '6px 4px' : '12px 8px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minWidth: '80px',
                      maxWidth: isMobile ? '120px' : '160px',
                      verticalAlign: 'top',
                      borderRight: '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                    title="期别"
                  >
                    <Box sx={{
                      wordWrap: 'break-word',
                      lineHeight: 1.3,
                      pr: 0.5
                    }}>
                      期别
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#e3f2fd',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '6px 4px' : '12px 8px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minWidth: '80px',
                      maxWidth: isMobile ? '120px' : '160px',
                      verticalAlign: 'top',
                      borderRight: '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                    title="工序"
                  >
                    <Box sx={{
                      wordWrap: 'break-word',
                      lineHeight: 1.3,
                      pr: 0.5
                    }}>
                      工序
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#e3f2fd',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '6px 4px' : '12px 8px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minWidth: '80px',
                      maxWidth: isMobile ? '120px' : '160px',
                      verticalAlign: 'top',
                      borderRight: '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                    title="产线"
                  >
                    <Box sx={{
                      wordWrap: 'break-word',
                      lineHeight: 1.3,
                      pr: 0.5
                    }}>
                      产线
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#e3f2fd',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '6px 4px' : '12px 8px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minWidth: '80px',
                      maxWidth: isMobile ? '120px' : '160px',
                      verticalAlign: 'top',
                      borderRight: '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                    title="状态"
                  >
                    <Box sx={{
                      wordWrap: 'break-word',
                      lineHeight: 1.3,
                      pr: 0.5
                    }}>
                      状态
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#e3f2fd',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '6px 4px' : '12px 8px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minWidth: '100px',
                      maxWidth: isMobile ? '120px' : '160px',
                      verticalAlign: 'top',
                      borderRight: '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                    title="完成进度"
                  >
                    <Box sx={{
                      wordWrap: 'break-word',
                      lineHeight: 1.3,
                      pr: 0.5
                    }}>
                      完成进度
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#e3f2fd',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '6px 4px' : '12px 8px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minWidth: '120px',
                      maxWidth: isMobile ? '120px' : '160px',
                      verticalAlign: 'top',
                      borderRight: '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                    title="创建时间"
                  >
                    <Box sx={{
                      wordWrap: 'break-word',
                      lineHeight: 1.3,
                      pr: 0.5
                    }}>
                      创建时间
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: '#e3f2fd',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      padding: isMobile ? '6px 4px' : '12px 8px',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      minWidth: '100px',
                      maxWidth: isMobile ? '120px' : '160px',
                      verticalAlign: 'top',
                      position: 'relative'
                    }}
                    title="操作"
                  >
                    <Box sx={{
                      wordWrap: 'break-word',
                      lineHeight: 1.3,
                      pr: 0.5
                    }}>
                      操作
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTaskPlans.length > 0 ? (
                  filteredTaskPlans.map((taskPlan) => (
                    <TableRow 
                      key={taskPlan.uuid}
                      hover 
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(25, 118, 210, 0.05)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                        },
                        '&:nth-of-type(even)': {
                          backgroundColor: isMobile ? 'transparent' : 'rgba(0, 0, 0, 0.02)'
                        },
                        '& > td': { borderRight: '1px solid #e0e0e0' }
                      }}
                    >
                      <TableCell sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{formatDate(taskPlan.date)}</TableCell>
                      <TableCell sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: isMobile ? '100px' : '200px'
                      }}>{taskPlan.task_description}</TableCell>
                      <TableCell sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {taskPlan.assigned_users.map(user => (
                          <Chip 
                            key={user.id} 
                            label={user.username} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ))}
                      </TableCell>
                      <TableCell sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{taskPlan.planned_people_count}</TableCell>
                      <TableCell sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{taskPlan.phase_name || '未指定'}</TableCell>
                      <TableCell sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{taskPlan.process_name || '未指定'}</TableCell>
                      <TableCell sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{taskPlan.production_line_name || '未指定'}</TableCell>
                      <TableCell sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        <Chip 
                          label={
                            taskPlan.status === 'pending' ? '待处理' :
                            taskPlan.status === 'in_progress' ? '进行中' :
                            taskPlan.status === 'completed' ? '已完成' :
                            taskPlan.status === 'cancelled' ? '已取消' : taskPlan.status
                          }
                          color={getStatusColor(taskPlan.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={taskPlan.progress} 
                            sx={{ width: '100px' }} 
                          />
                          <span>{taskPlan.progress}%</span>
                        </Box>
                      </TableCell>
                      <TableCell sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{formatDateTime(taskPlan.created_at)}</TableCell>
                      <TableCell sx={{
                        wordBreak: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: isMobile ? '140px' : '120px'
                      }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'nowrap' }}>
                          <IconButton
                            color="primary"
                            size={isMobile ? "small" : "medium"}
                            title="编辑"
                            onClick={() => {
                              setEditingTaskPlan(taskPlan);
                              setOpenForm(true);
                            }}
                            sx={{
                              padding: isMobile ? '4px' : '8px'
                            }}
                          >
                            <EditIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                          <IconButton
                            color="success"
                            size={isMobile ? "small" : "medium"}
                            title="处理任务"
                            onClick={() => handleProcessTask(taskPlan)}
                            sx={{
                              padding: isMobile ? '4px' : '8px'
                            }}
                          >
                            <BuildIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            size={isMobile ? "small" : "medium"}
                            title="完成任务"
                            onClick={() => handleCompleteTask(taskPlan)}
                            sx={{
                              padding: isMobile ? '4px' : '8px'
                            }}
                          >
                            <CheckIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                          <IconButton
                            color="error"
                            size={isMobile ? "small" : "medium"}
                            title="删除"
                            onClick={() => handleDelete(taskPlan.uuid)}
                            sx={{
                              padding: isMobile ? '4px' : '8px'
                            }}
                          >
                            <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                  <TableCell 
                    colSpan={11} 
                    align="center" 
                    sx={{ 
                      py: isMobile ? 3 : 6,
                      fontSize: isMobile ? '0.9rem' : 'inherit',
                      minHeight: isMobile ? '300px' : '400px'
                    }}
                  >
                    <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">
                        没有找到匹配的任务计划
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </StyledPaper>

      {/* 任务计划表单对话框 */}
      <TaskPlanForm
        show={openForm}
        handleClose={() => {
          setOpenForm(false);
          setEditingTaskPlan(null);
        }}
        taskPlan={editingTaskPlan}
        onUpdate={handleFormSubmit}
      />

      {/* 月份选择导出对话框 */}
      <Dialog
        open={openDownloadDialog}
        onClose={() => setOpenDownloadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>导出任务计划数据</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1 }}>
            <TextField
              select
              label="选择月份"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 1 }}
            >
              <MenuItem value="all">全部</MenuItem>
              {(() => {
                // 生成最近12个月的选项
                const months = [];
                const today = new Date();
                for (let i = 0; i < 12; i++) {
                  const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const monthStr = `${year}-${month}`;
                  const displayText = `${year}年${date.getMonth() + 1}月`;
                  months.push(
                    <MenuItem key={monthStr} value={monthStr}>
                      {displayText}
                    </MenuItem>
                  );
                }
                return months.reverse(); // 最近的月份在前面
              })()}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDownloadDialog(false)}>取消</Button>
          <Button 
            variant="contained" 
            onClick={handleDownloadRecords}
            disabled={!selectedMonth}
          >
            确认导出
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskPlanTable;