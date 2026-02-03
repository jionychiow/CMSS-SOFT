import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Box,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
  Chip,
  Toolbar,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Home as HomeIcon, Factory as FactoryIcon, Schedule as ScheduleIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import AuthContext from '../../AuthProvider/AuthContext';

const StyledCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  border: '2px solid transparent',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.9) 100%)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    borderColor: '#1976d2'
  },
  '&.selected': {
    borderColor: '#1976d2',
    backgroundColor: 'rgba(25, 118, 210, 0.05)',
    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.2)'
  }
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

const HeaderCard = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
  color: 'white',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '32px',
  boxShadow: '0 6px 24px rgba(25, 118, 210, 0.4)',
}));

const MaintenanceSelection = () => {
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [autoRedirect, setAutoRedirect] = useState(false);

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 检查用户权限并自动跳转
  useEffect(() => {
    if (authContext?.state?.user_profile) {
      const userProfile = authContext.state.user_profile;
      const userCanAccessBothPhases = userProfile.can_access_both_phases;
      const userCanAccessBothShifts = userProfile.can_access_both_shifts;
      
      // 如果用户不能访问所有分期和班次，则自动跳转到其权限范围内的页面
      if (!userCanAccessBothPhases || !userCanAccessBothShifts) {
        let autoPhase = '';
        let autoShift = '';

        // 根据用户权限确定期别
        if (userProfile.plant_phase === 'phase_1') {
          autoPhase = 'phase_1';
        } else if (userProfile.plant_phase === 'phase_2') {
          autoPhase = 'phase_2';
        } else if (userProfile.plant_phase === 'both' || userCanAccessBothPhases) {
          // 如果用户可以访问多个分期，则不自动跳转
          autoPhase = '';
        }

        // 根据用户权限确定班次
        if (userProfile.shift_type === 'long_day_shift') {
          autoShift = 'long_day_shift';
        } else if (userProfile.shift_type === 'rotating_shift') {
          autoShift = 'rotating_shift';
        } else if (userProfile.shift_type === 'both' || userCanAccessBothShifts) {
          // 如果用户可以访问多个班次，则不自动跳转
          autoShift = '';
        }

        // 如果确定了唯一的期别和班次，则自动跳转
        if (autoPhase && autoShift) {
          setAutoRedirect(true);
          navigate(`/cmms/maintenance/phase-shift-records?phase=${autoPhase}&shift_type=${autoShift}`);
          return;
        }
      }
    }
  }, [authContext, navigate]);

  const handlePhaseSelect = (phase) => {
    setSelectedPhase(phase);
    setSelectedShift(''); // Reset shift selection when phase changes
  };

  const handleShiftSelect = (shift) => {
    setSelectedShift(shift);
  };

  const handleConfirm = () => {
    if (selectedPhase && selectedShift) {
      navigate(`/cmms/maintenance/phase-shift-records?phase=${selectedPhase}&shift_type=${selectedShift}`);
    }
  };

  const handleBack = () => {
    if (selectedShift) {
      setSelectedShift('');
    } else if (selectedPhase) {
      setSelectedPhase('');
    }
  };

  // 如果正在自动跳转，显示加载指示器
  if (autoRedirect) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          正在根据您的权限自动跳转...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 0, background: 'transparent' }}>
        {/* 页面头部 */}
        <HeaderCard>
          <Typography variant="h4" component="h1" gutterBottom align={isMobile ? 'center' : 'left'}>
            <HomeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            维修记录管理系统
          </Typography>
          <Typography variant="h6" component="p" sx={{ opacity: 0.9 }}>
            请选择工厂分期和班次类型以开始管理维修记录
          </Typography>
        </HeaderCard>

        <Paper 
          elevation={3} 
          sx={{ 
            p: isMobile ? 2 : 4, 
            borderRadius: 4, 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Box sx={{ mt: 1 }}>
            {!selectedPhase ? (
              <React.Fragment>
                <Typography variant="h5" align="center" gutterBottom sx={{ color: '#1976d2', mb: 4, fontWeight: 600 }}>
                  请选择工厂分期
                </Typography>
                <Grid container spacing={isMobile ? 2 : 4} justifyContent="center">
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <StyledCard 
                      onClick={() => handlePhaseSelect('phase_1')}
                      className={selectedPhase === 'phase_1' ? 'selected' : ''}
                      sx={{ height: isMobile ? '140px' : '180px' }}
                    >
                      <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <FactoryIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                        <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                          一期
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          选择一期工厂
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <StyledCard 
                      onClick={() => handlePhaseSelect('phase_2')}
                      className={selectedPhase === 'phase_2' ? 'selected' : ''}
                      sx={{ height: isMobile ? '140px' : '180px' }}
                    >
                      <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <FactoryIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                        <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                          二期
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          选择二期工厂
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
              </React.Fragment>
            ) : !selectedShift ? (
              <React.Fragment>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
                  <Chip 
                    label="已选择分期" 
                    color="primary" 
                    variant="filled"
                    sx={{ mr: 2, fontWeight: 600 }}
                  />
                  <Chip 
                    label={selectedPhase === 'phase_1' ? '一期' : '二期'} 
                    color="secondary" 
                    variant="outlined"
                    size="large"
                    sx={{ fontWeight: 600, fontSize: '1.1rem' }}
                  />
                </Box>
                
                <Typography variant="h5" align="center" gutterBottom sx={{ color: '#1976d2', mb: 4, fontWeight: 600 }}>
                  请选择班次类型
                </Typography>
                
                <Grid container spacing={isMobile ? 2 : 4} justifyContent="center">
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <StyledCard 
                      onClick={() => handleShiftSelect('long_day_shift')}
                      className={selectedShift === 'long_day_shift' ? 'selected' : ''}
                      sx={{ height: isMobile ? '140px' : '180px' }}
                    >
                      <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <ScheduleIcon sx={{ fontSize: 48, color: '#ff9800', mb: 1 }} />
                        <Typography variant="h5" color="#ff9800" gutterBottom sx={{ fontWeight: 'bold' }}>
                          长白班
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          选择长白班
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <StyledCard 
                      onClick={() => handleShiftSelect('rotating_shift')}
                      className={selectedShift === 'rotating_shift' ? 'selected' : ''}
                      sx={{ height: isMobile ? '140px' : '180px' }}
                    >
                      <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <ScheduleIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
                        <Typography variant="h5" color="#4caf50" gutterBottom sx={{ fontWeight: 'bold' }}>
                          倒班
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          选择倒班
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Grid>
                
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <ActionButton 
                    variant="outlined" 
                    onClick={handleBack}
                    startIcon={<ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />}
                  >
                    返回选择分期
                  </ActionButton>
                </Box>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 3 }}>
                  <Chip 
                    label="已选择分期" 
                    color="primary" 
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip 
                    label={selectedPhase === 'phase_1' ? '一期' : '二期'} 
                    color="secondary" 
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip 
                    label="班次类型" 
                    color="primary" 
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip 
                    label={selectedShift === 'long_day_shift' ? '长白班' : '倒班'} 
                    color="secondary" 
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
                <Typography variant="h5" align="center" gutterBottom sx={{ color: '#424242', mb: 4, fontWeight: 600 }}>
                  确认选择后进入维修记录管理
                </Typography>
                
                <Box sx={{ textAlign: 'center', mt: 2, mb: 1 }}>
                  <ActionButton 
                    variant="contained" 
                    color="primary" 
                    size={isMobile ? "large" : "large"}
                    onClick={handleConfirm}
                    startIcon={<ArrowForwardIcon />}
                    sx={{ 
                      mr: 2, 
                      px: 4, 
                      py: 1.5,
                      minWidth: isMobile ? '200px' : '240px',
                      fontSize: '1.1rem'
                    }}
                  >
                    进入维修记录
                  </ActionButton>
                  <ActionButton 
                    variant="outlined" 
                    onClick={handleBack}
                    sx={{ minWidth: isMobile ? '140px' : '160px' }}
                  >
                    重新选择
                  </ActionButton>
                </Box>
              </React.Fragment>
            )}
          </Box>
        </Paper>
      </Paper>
    </Container>
  );
};

export default MaintenanceSelection;