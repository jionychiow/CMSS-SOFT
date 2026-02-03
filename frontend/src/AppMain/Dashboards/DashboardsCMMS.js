import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { url } from '../../Config';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Box,
  CircularProgress,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  ListItem,
  List,
  Chip,
  LinearProgress,
  Fab
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import AuthContext from '../../AuthProvider/AuthContext';
import { Person, Logout, Settings, AdminPanelSettings, AccessTime, People, Engineering, LibraryBooks, Warning, Dashboard, Assignment, Build, Category, Add, CalendarToday, Notifications, TrendingUp } from '@mui/icons-material';



const StatCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: '12px',
  },
}));

const ModernCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: '12px',
    transform: 'none',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    '&:hover': {
      transform: 'none',
    },
  },
  [theme.breakpoints.down('xs')]: {
    borderRadius: '8px',
    margin: '4px',
  },
}));

function DashboardsCMMS() {
  const [stats, setStats] = useState({
    maintenanceRecords: { total: 0, phase1: 0, phase2: 0 },
    maintenanceManuals: 0,
    faultCases: 0, // 故障案例数量 - 今日任务计划
    incompleteTasks: 0, // 未完成任务数量
    inProgressTasks: 0, // 进行中任务数量
    todayPendingTasks: 0, // 今日待处理任务数
    todayCompletedTasks: 0, // 今日已完成任务数
    todayCancelledTasks: 0, // 今日已取消任务数
    todayOverdueTasks: 0, // 今日逾期任务数
    assets: 0,
    activeUsers: 0,
    todayVisits: 0,
    loading: true,
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [weeklyVisitsData, setWeeklyVisitsData] = useState([]);
  const [weeklyActivityStatsData, setWeeklyActivityStatsData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  // Fetch user profile and stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = authContext.state.token;
        
        // 并行获取所有统计数据以提高性能
        const [
          assetsResponse,
          phase1Response,
          phase2Response,
          manualsResponse,
          todayTasksResponse,
          incompleteTasksResponse,
          inProgressTasksResponse
        ] = await Promise.all([
          // 获取资产数量
          axios.get(`${url}/api/db/stats/assets-count/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          }).catch(error => {
            console.error('获取资产数量失败:', error);
            return { data: { count: 0 } }; // 返回默认对象作为fallback
          }),
          
          // 获取一期维修记录数量
          axios.get(`${url}/api/db/stats/maintenance-records-count-phase1/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          }).catch(error => {
            console.error('获取一期维修记录失败:', error);
            return { data: { count: 0 } }; // 返回默认对象作为fallback
          }),
          
          // 获取二期维修记录数量
          axios.get(`${url}/api/db/stats/maintenance-records-count-phase2/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          }).catch(error => {
            console.error('获取二期维修记录失败:', error);
            return { data: { count: 0 } }; // 返回默认对象作为fallback
          }),
          
          // 获取维修手册数量
          axios.get(`${url}/api/db/stats/maintenance-manuals-count/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          }).catch(error => {
            console.error('获取维修手册数量失败:', error);
            return { data: { count: 0 } }; // 返回默认对象作为fallback
          }),
          
          // 获取今日任务计划数量
          axios.get(`${url}/api/db/task-plans/today-tasks/`, {
            headers: {
              'Authorization': `Token ${token}`
            }
          }).catch(error => {
            console.error('获取今日任务计划数据失败:', error);
            return { data: { count: 0 } }; // 返回默认对象作为fallback
          }),
          
          // 获取未完成任务数量
          axios.get(`${url}/api/db/task-plans/incomplete-tasks/`, {
            headers: {
              'Authorization': `Token ${token}`
            }
          }).catch(error => {
            console.error('获取未完成任务数据失败:', error);
            return { data: { count: 0 } }; // 返回默认对象作为fallback
          }),
          
          // 获取进行中任务数量
          axios.get(`${url}/api/db/task-plans/in-progress-tasks/`, {
            headers: {
              'Authorization': `Token ${token}`
            }
          }).catch(error => {
            console.error('获取进行中任务数据失败:', error);
            return { data: { count: 0 } }; // 返回默认对象作为fallback
          })
        ]);

        const assetsCount = assetsResponse.data?.count || 0;
        // 获取确切的一期和二期维修记录数
        const phase1Records = phase1Response.data?.count || 0;
        const phase2Records = phase2Response.data?.count || 0;
        const totalMaintenanceRecords = phase1Records + phase2Records;
        // 获取实时统计数据
        const [
          activeUsersResponse,
          todayVisitsResponse,
          taskStatusDistributionResponse,
          recentActivitiesResponse,
          weeklyVisitsResponse,
          weeklyActivityStatsResponse
        ] = await Promise.all([
          // 获取活跃用户数
          axios.get(`${url}/api/db/stats/active-users/`, {
            headers: {
              'Authorization': `Token ${token}`
            }
          }).catch(error => {
            console.error('获取活跃用户数据失败:', error);
            return { data: { count: 0 } }; // 返回默认对象作为fallback
          }),
          
          // 获取今日访问量
          axios.get(`${url}/api/db/stats/today-visits/`, {
            headers: {
              'Authorization': `Token ${token}`
            }
          }).catch(error => {
            console.error('获取今日访问量数据失败:', error);
            return { data: { count: 0 } }; // 返回默认对象作为fallback
          }),
          
          // 获取任务状态分布
          axios.get(`${url}/api/db/task-plans/status-distribution/`, {
            headers: {
              'Authorization': `Token ${token}`
            }
          }).catch(error => {
            console.error('获取任务状态分布数据失败:', error);
            return { data: { status_distribution: { pending: 0, in_progress: 0, completed: 0, cancelled: 0, overdue: 0 } } }; // 返回默认对象作为fallback
          }),
          
          // 获取最近活动
          axios.get(`${url}/api/db/stats/recent-activities/`, {
            headers: {
              'Authorization': `Token ${token}`
            }
          }).catch(error => {
            console.error('获取最近活动数据失败:', error);
            return { data: { activities: [] } }; // 返回默认对象作为fallback
          }),
          
          // 获取本周访问趋势
          axios.get(`${url}/api/db/stats/weekly-trends/`, {
            headers: {
              'Authorization': `Token ${token}`
            }
          }).catch(error => {
            console.error('获取本周访问趋势数据失败:', error);
            return { data: { trends: [] } }; // 返回默认对象作为fallback
          }),
          
          // 获取本周活动统计
          axios.get(`${url}/api/db/stats/weekly-activity-stats/`, {
            headers: {
              'Authorization': `Token ${token}`
            }
          }).catch(error => {
            console.error('获取本周活动统计数据失败:', error);
            return { data: { activity_stats: [] } }; // 返回默认对象作为fallback
          })
        ]);

        const manualsCount = manualsResponse.data?.count || 0;
        const todayTasksCount = todayTasksResponse.data?.count || 0;
        const incompleteTasksCount = incompleteTasksResponse.data?.count || 0;
        const inProgressTasksCount = inProgressTasksResponse.data?.count || 0;
        const activeUsersCount = activeUsersResponse.data?.count || 0;
        const todayVisitsCount = todayVisitsResponse.data?.count || 0;
        const taskStatusDistribution = taskStatusDistributionResponse.data?.status_distribution || {};
        const todayPendingTasks = taskStatusDistribution.pending || 0;
        const todayInProgressTasks = taskStatusDistribution.in_progress || 0;
        const todayCompletedTasks = taskStatusDistribution.completed || 0;
        const todayCancelledTasks = taskStatusDistribution.cancelled || 0;
        const todayOverdueTasks = taskStatusDistribution.overdue || 0;
        const recentActivitiesData = recentActivitiesResponse.data?.activities || [];
        const weeklyVisitsData = weeklyVisitsResponse.data?.trends || [];
        const weeklyActivityStats = weeklyActivityStatsResponse.data?.activity_stats || [];

        // 设置统计数据
        setStats({
          maintenanceRecords: { 
            total: totalMaintenanceRecords, 
            phase1: phase1Records, 
            phase2: phase2Records 
          },
          maintenanceManuals: manualsCount,
          faultCases: todayTasksCount,
          incompleteTasks: incompleteTasksCount,
          inProgressTasks: todayInProgressTasks, // 使用实时任务状态数据
          todayPendingTasks: todayPendingTasks,
          todayCompletedTasks: todayCompletedTasks,
          todayCancelledTasks: todayCancelledTasks,
          todayOverdueTasks: todayOverdueTasks,
          assets: assetsCount,
          activeUsers: activeUsersCount, // 使用实时活跃用户数
          todayVisits: todayVisitsCount, // 使用今日访问量
          loading: false
        });
        
        // 设置最近活动数据
        setRecentActivities(recentActivitiesData);
        
        // 设置本周访问趋势数据
        // 将后端返回的trends数据格式转换为图表所需的格式
        const formattedWeeklyVisitsData = weeklyVisitsData.map(item => ({
          day: item.formatted_date,  // 使用mm/dd格式的日期
          访问量: item.visit_count    // 访问量
        }));
        setWeeklyVisitsData(formattedWeeklyVisitsData);
        
        // 设置本周活动统计数据
        // 将后端返回的activity_stats数据格式转换为图表所需的格式
        const formattedWeeklyActivityStatsData = weeklyActivityStats.map(item => ({
          name: item.day_chinese,  // 中文星期名称
          记录数: item.records_count,  // 维修记录数
          手册数: item.manuals_count,  // 手册更新数
          未完成任务数: item.pending_tasks_count  // 未完成任务数
        }));
        setWeeklyActivityStatsData(formattedWeeklyActivityStatsData);
      } catch (error) {
        console.error('获取统计数据失败:', error);
        // 如果出现严重错误，回退到默认值
        setStats({
          maintenanceRecords: { total: 0, phase1: 0, phase2: 0 },
          maintenanceManuals: 0,
          faultCases: 0,
          incompleteTasks: 0,
          inProgressTasks: 0,
          todayPendingTasks: 0,
          todayCompletedTasks: 0,
          todayCancelledTasks: 0,
          todayOverdueTasks: 0,
          assets: 0,
          activeUsers: 0,
          todayVisits: 0,
          loading: false
        });
      }
    };

    fetchStats();
  }, [authContext.state.token]);

  // Update currentUser when authContext.user_profile changes
  useEffect(() => {
    if (authContext.state.user_profile) {
      setCurrentUser({
        username: authContext.state.user_profile.username || 'user',
        email: authContext.state.user_profile.email || '',
        firstName: authContext.state.user_profile.first_name || authContext.state.user_profile.username || '',
        lastName: '',
        role: authContext.state.user_profile.type === 'Admin' ? 'admin' : 'user'
      });
    }
  }, [authContext.state.user_profile]);

  const allPieData = [
    { name: '待处理', value: stats.todayPendingTasks || 0, color: '#f44336' },
    { name: '进行中', value: stats.inProgressTasks || 0, color: '#ff9800' },
    { name: '已完成', value: stats.todayCompletedTasks || 0, color: '#4caf50' },
    { name: '已取消', value: stats.todayCancelledTasks || 0, color: '#9e9e9e' },
    { name: '逾期', value: stats.todayOverdueTasks || 0, color: '#f50057' },
  ];
  // 如果所有值都是0，显示一条提示信息，否则显示实际数据
  const pieData = allPieData.some(item => item.value > 0) ? allPieData.filter(item => item.value > 0) : [{ name: '无数据', value: 1, color: '#cccccc' }];

  const statItems = [
    {
      title: '设备总数',
      value: stats.assets,
      subtitle: '在线设备数量',
      color: '#7b1fa2',
      link: '/cmms/assets',
      icon: '🏭'
    },
    {
      title: '维修记录',
      value: stats.maintenanceRecords.total,
      subtitle: `一期: ${stats.maintenanceRecords.phase1}, 二期: ${stats.maintenanceRecords.phase2}`,
      color: '#1976d2',
      link: '/cmms/maintenance/records',
      icon: '🔧'
    },
    {
      title: '维修手册',
      value: stats.maintenanceManuals,
      subtitle: '可用维护指南',
      color: '#388e3c',
      link: '/cmms/maintenance/manuals',
      icon: '📖'
    },
    {
      title: '今日任务计划',
      value: stats.faultCases,
      subtitle: '今日待办任务',
      color: '#f57c00',
      link: '/cmms/task-plan',
      icon: '📋'
    }
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authContext.logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    // Navigate to profile page
    navigate('/profile');
    handleMenuClose();
  };

  const handlePasswordChange = () => {
    setOpenPasswordDialog(true);
    handleMenuClose();
  };

  const handleAddUser = () => {
    handleMenuClose();
    navigate('/admin/users');  // 导航到用户管理页面
  };

  const handlePasswordSubmit = () => {
    // Handle password change
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('新密码与确认密码不匹配');
      return;
    }
    // In a real app, this would call the API
    setOpenPasswordDialog(false);
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };



  if (stats.loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 8, px: { xs: 1, sm: 2 } }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid size={{ xs: 8, sm: 10 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              color: '#333', 
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              backgroundClip: 'text',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
            }}
          >
            生产维修资料系统
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            全面管理生产维修资料，优化维护流程，提升生产效率
          </Typography>
        </Grid>
        <Grid size={{ xs: 4, sm: 2 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={handleMenuOpen}
            size="large"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{ 
              width: 40, 
              height: 40,
              [`@media (min-width:600px)`]: {
                width: 48,
                height: 48,
              },
              [`@media (max-width:599px)`]: {
                width: 36,
                height: 36,
              }
            }}
          >
            <Avatar sx={{ 
              bgcolor: '#1976d2',
              width: 36,
              height: 36,
              [`@media (min-width:600px)`]: {
                width: 40,
                height: 40,
              },
              [`@media (max-width:599px)`]: {
                width: 32,
                height: 32,
              }
            }}>
              {currentUser.firstName?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
                [`@media (max-width:599px)`]: {
                  mt: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>个人资料</ListItemText>
            </MenuItem>
            <MenuItem onClick={handlePasswordChange}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>修改密码</ListItemText>
            </MenuItem>
            {authContext.state.user_profile?.type === 'Admin' && [
              <Divider key="divider-admin" />,
              <MenuItem key="add-user" onClick={handleAddUser}>
                <ListItemIcon>
                  <AdminPanelSettings fontSize="small" />
                </ListItemIcon>
                <ListItemText>用户管理</ListItemText>
              </MenuItem>,
              <MenuItem key="advanced-management" component="a" href="/admin/advanced" onClick={handleMenuClose}>
                <ListItemIcon>
                  <AdminPanelSettings fontSize="small" />
                </ListItemIcon>
                <ListItemText>高级管理</ListItemText>
              </MenuItem>
            ]}
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>退出登录</ListItemText>
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
      
      {/* Welcome Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GradientPaper>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } }}>
              <Dashboard sx={{ verticalAlign: 'middle', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }} />
              欢迎使用生产维修资料系统
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
              本系统提供全面的生产维修资料管理功能，包括设备信息、维修记录、维护手册、任务计划等。
              通过系统化的管理，帮助您优化维护流程，提升生产效率，降低运营成本。
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="设备管理" icon={<Category />} color="default" variant="outlined" size="small" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }} />
              <Chip label="维修记录" icon={<Assignment />} color="default" variant="outlined" size="small" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }} />
              <Chip label="维护手册" icon={<LibraryBooks />} color="default" variant="outlined" size="small" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }} />
              <Chip label="任务管理" icon={<Assignment />} color="default" variant="outlined" size="small" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }} />
              <Chip label="统计分析" icon={<TrendingUp />} color="default" variant="outlined" size="small" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }} />
            </Box>
          </GradientPaper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModernCard>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
                系统概览
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' } }}>
                  数据完整性
                </Typography>
                <LinearProgress variant="determinate" value={85} sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' } }}>
                  系统可用性
                </Typography>
                <LinearProgress variant="determinate" value={98} sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' } }}>
                  用户活跃度
                </Typography>
                <LinearProgress variant="determinate" value={72} />
              </Box>
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

      {/* Stats Cards Row 1 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statItems.map((item, index) => (
          <Grid size={{ xs: 6, sm: 6, md: 3 }} key={index}>
            <RouterLink 
              to={item.link} 
              style={{ 
                textDecoration: 'none', 
                color: 'inherit' 
              }}
            >
              <ModernCard>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: item.color + '20', color: item.color, width: 36, height: 36, [`@media (max-width:599px)`]: { width: 32, height: 32 } }}>
                      {item.icon}
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: item.color, fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>
                      {item.title}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>
                      {item.value}
                    </Typography>
                  }
                  sx={{ pb: 1 }}
                />
                <StatCardContent>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' } }}
                  >
                    {item.subtitle}
                  </Typography>
                </StatCardContent>
              </ModernCard>
            </RouterLink>
          </Grid>
        ))}
      </Grid>

      {/* Stats Cards Row 2 - Real-time stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <ModernCard sx={{ textAlign: 'center', height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <AccessTime sx={{ fontSize: { xs: 24, sm: 30, md: 40 }, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                {stats.activeUsers}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' } }}>
                当前活跃用户
              </Typography>
            </CardContent>
          </ModernCard>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <ModernCard sx={{ textAlign: 'center', height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <People sx={{ fontSize: { xs: 24, sm: 30, md: 40 }, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                {stats.todayVisits}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' } }}>
                今日访问量
              </Typography>
            </CardContent>
          </ModernCard>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <ModernCard sx={{ textAlign: 'center', height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Engineering sx={{ fontSize: { xs: 24, sm: 30, md: 40 }, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                {stats.inProgressTasks}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' } }}>
                实时维护任务
              </Typography>
            </CardContent>
          </ModernCard>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <ModernCard sx={{ textAlign: 'center', height: '100%', background: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', color: 'white' }}>
            <CardContent sx={{ p: 2 }}>
              <Warning sx={{ fontSize: { xs: 24, sm: 30, md: 40 }, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
                {stats.incompleteTasks}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' } }}>
                未完成任务
              </Typography>
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <ModernCard>
            <CardContent sx={{ p: 2, height: { xs: 320, sm: 380, md: 450 }, minHeight: 280 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                <Assignment sx={{ verticalAlign: 'middle', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                本周活动统计
              </Typography>
              <ResponsiveContainer width="100%" height={280} minHeight={220} minWidth={300}>
                <BarChart
                  data={weeklyActivityStatsData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 30,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={14} />
                  <YAxis fontSize={14} />
                  <Tooltip wrapperStyle={{ fontSize: 14 }} />
                  <Legend wrapperStyle={{ fontSize: 14 }} />
                  <Bar dataKey="记录数" fill="#1976d2" name="维修记录" />
                  <Bar dataKey="手册数" fill="#388e3c" name="手册更新" />
                  <Bar dataKey="未完成任务数" fill="#f57c00" name="未完成任务" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </ModernCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModernCard>
            <CardContent sx={{ p: 2, height: { xs: 380, sm: 480, md: 530 }, minHeight: 320 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                <Build sx={{ verticalAlign: 'middle', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                维修状态分布
              </Typography>
              <ResponsiveContainer width="100%" height={300} minHeight={300} minWidth={300}>
                  <PieChart margin={{ top: 50, right: 50, left: 50, bottom: 30 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d2"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ fontSize: 18 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

      {/* Additional Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ModernCard>
            <CardContent sx={{ p: 2, height: { xs: 280, sm: 310, md: 330 }, minHeight: 220 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                <CalendarToday sx={{ verticalAlign: 'middle', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                本周访问趋势
              </Typography>
              <ResponsiveContainer width="100%" height={200} minHeight={200} minWidth={300}>
                  <LineChart
                  data={weeklyVisitsData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip wrapperStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="访问量" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </ModernCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ModernCard>
            <CardContent sx={{ p: 2, height: { xs: 250, sm: 280, md: 300 } }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2, fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                <Notifications sx={{ verticalAlign: 'middle', mr: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                最近活动
              </Typography>
              <List dense sx={{ maxHeight: '80%', overflow: 'auto' }}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {activity.activity_type === '维修任务' || activity.activity_type === 'maintenance_task' ? <Engineering /> :
                         activity.activity_type === '设备警报' || activity.activity_type === 'equipment_alert' ? <Warning /> :
                         activity.activity_type === '维护手册' || activity.activity_type === 'maintenance_manual' ? <LibraryBooks /> :
                         activity.activity_type === '登录' || activity.activity_type === 'login' ? <Person /> :
                         <Notifications />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${activity.username}: ${activity.description}`} 
                        secondary={activity.formatted_timestamp} 
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="暂无最近活动" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

      {/* User Management Dialogs */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>修改密码</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="当前密码"
              type="password"
              fullWidth
              variant="outlined"
              value={passwordData.oldPassword}
              onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
            />
            <TextField
              margin="dense"
              label="新密码"
              type="password"
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            />
            <TextField
              margin="dense"
              label="确认新密码"
              type="password"
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>取消</Button>
          <Button onClick={handlePasswordSubmit}>提交</Button>
        </DialogActions>
      </Dialog>


      {/* Developer Info */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 10, 
        left: 10, 
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        开发者: jionychiow-韦
      </Box>
    </Container>
  );
}

export default DashboardsCMMS;