import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Toolbar,
  Chip,
  useMediaQuery,
  useTheme,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add as AddIcon, Home as HomeIcon } from '@mui/icons-material';
import { url as url_base } from '../../Config';
import axios from 'axios';
import AuthContext from '../../AuthProvider/AuthContext';
import TaskPlanTable from './TaskPlanTable/TaskPlanTable';

const TaskPlanDashboard = () => {
  const { state: authState } = useContext(AuthContext);
  const { token } = authState;

  const [todayTasksCount, setTodayTasksCount] = useState(0);
  const [incompleteTasksCount, setIncompleteTasksCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

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
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '16px' : '24px',
    marginBottom: isMobile ? '16px' : '32px',
    boxShadow: isMobile ? '0 4px 16px rgba(25, 118, 210, 0.3)' : '0 8px 32px rgba(25, 118, 210, 0.3)',
  }));

  useEffect(() => {
    fetchTaskStats();
  }, []);

  const fetchTaskStats = async () => {
    try {
      setLoadingStats(true);
      
      // 获取今天任务数量
      const todayResponse = await axios.get(`${url_base}/api/db/task-plans/today-tasks/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setTodayTasksCount(todayResponse.data.count || 0);

      // 获取未完成任务数量
      const incompleteResponse = await axios.get(`${url_base}/api/db/task-plans/incomplete-tasks/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setIncompleteTasksCount(incompleteResponse.data.count || 0);
    } catch (error) {
      console.error('获取任务统计失败:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <Container maxWidth={isMobile ? "xs" : "xl"} sx={{ mt: isMobile ? 1 : 2, mb: 4, px: isMobile ? 1 : undefined }}>
      {/* 页面头部 */}
      <HeaderCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              任务计划管理系统
            </Typography>
            <Typography variant="h6" component="p" sx={{ opacity: 0.9 }}>
              任务计划管理
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={`任务计划`} 
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
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={<HomeIcon />}
              onClick={() => window.location.href = '/'} 
              sx={{ 
                px: 2,
                minWidth: 'auto',
                ml: 1
              }}
            >
              返回主页
            </Button>
          </Box>
        </Box>
      </HeaderCard>

      <StyledPaper elevation={0} sx={{ p: 0, background: 'transparent' }}>
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: isMobile ? 2 : 4, 
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* 操作工具栏 */}
          <Toolbar sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: isMobile ? 1 : 2,
            borderBottom: '1px solid #e0e0e0',
            bgcolor: 'rgba(25, 118, 210, 0.05)',
            flexWrap: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: isMobile ? 1 : 0, order: isMobile ? 2 : 'initial' }}>
              <Chip 
                label={`今日任务: ${loadingStats ? '加载中...' : todayTasksCount}`} 
                color="primary" 
                variant="filled"
                sx={{ 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  height: isMobile ? '28px' : '32px'
                }}
              />
              <Chip 
                label={`未完成: ${loadingStats ? '加载中...' : incompleteTasksCount}`} 
                color="warning" 
                variant="filled"
                sx={{ 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  height: isMobile ? '28px' : '32px'
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, order: isMobile ? 1 : 'initial' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  // 触发TaskPlanTable中的新增表单
                  window.dispatchEvent(new CustomEvent('openNewTaskPlanForm'));
                }}
                sx={{ 
                  px: isMobile ? 1 : 2,
                  minWidth: isMobile ? 'auto' : '120px',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {isExtraSmall ? '+' : isMobile ? '新增' : '新增任务计划'}
              </Button>
            </Box>
          </Toolbar>

          {/* 任务计划表格 */}
          <Box sx={{ p: isMobile ? 0.5 : 2 }}>
            <TaskPlanTable />
          </Box>
        </Paper>
      </StyledPaper>
    </Container>
  );
};

export default TaskPlanDashboard;