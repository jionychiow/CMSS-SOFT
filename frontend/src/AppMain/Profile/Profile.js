import React, { useContext } from 'react';
import { Container, Typography, Card, CardContent, Grid, Box, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import AuthContext from '../../AuthProvider/AuthContext';

const Profile = () => {
  const authContext = useContext(AuthContext);
  const userProfile = authContext.state.user_profile;

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* 渐变头部 */}
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
              个人资料
            </Typography>
            <Typography variant="h6" component="p" sx={{ color: 'rgba(255, 255, 255, 0.9)', mt: 1 }}>
              查看和管理您的账户信息
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<HomeIcon />}
            href="/cmms/dashboards"
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

      {/* 主要内容卡片 */}
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.95) 100%)', borderRadius: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
        {userProfile ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: 3, border: '1px solid rgba(25, 118, 210, 0.1)' }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  基本信息
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1.5 }}><strong>账户名:</strong> {userProfile.username || '未设置'}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}><strong>邮箱:</strong> {userProfile.email || '未设置'}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}><strong>真实姓名:</strong> {userProfile.username || '未设置'}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}><strong>角色:</strong> {userProfile.type === 'Admin' ? '管理员' : userProfile.type === 'Operator' ? '操作员' : userProfile.type || '未设置'}</Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, backgroundColor: 'rgba(33, 150, 243, 0.05)', borderRadius: 3, border: '1px solid rgba(33, 150, 243, 0.1)' }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                  工厂权限
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1.5 }}><strong>管理员设置的期别:</strong> {userProfile.plant_phase === 'phase_1' ? '一期' : userProfile.plant_phase === 'phase_2' ? '二期' : userProfile.plant_phase === 'both' ? '全部' : userProfile.plant_phase || '未设置'}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}><strong>管理员设置的班次:</strong> {userProfile.shift_type === 'long_day_shift' ? '长白班' : userProfile.shift_type === 'rotating_shift' ? '倒班' : userProfile.shift_type === 'both' ? '全部' : userProfile.shift_type || '未设置'}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}><strong>可访问分期:</strong> {userProfile.type === 'Admin' ? '全部' : userProfile.can_access_both_phases ? '全部' : userProfile.plant_phase === 'phase_1' ? '一期' : userProfile.plant_phase === 'phase_2' ? '二期' : userProfile.plant_phase || '未设置'}</Typography>
                  <Typography variant="body1" sx={{ mb: 1.5 }}><strong>可访问班次:</strong> {userProfile.type === 'Admin' ? '全部' : userProfile.can_access_both_shifts ? '全部' : userProfile.shift_type === 'long_day_shift' ? '长白班' : userProfile.shift_type === 'rotating_shift' ? '倒班' : userProfile.shift_type || '未设置'}</Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ p: 3, backgroundColor: 'rgba(255, 152, 0, 0.05)', borderRadius: 3, border: '1px solid rgba(255, 152, 0, 0.1)' }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                  功能权限
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1.5 }}><strong>资产-添加:</strong> {userProfile.can_add_assets ? '是' : '否'}</Typography>
                      <Typography variant="body1" sx={{ mb: 1.5 }}><strong>资产-编辑:</strong> {userProfile.can_edit_assets ? '是' : '否'}</Typography>
                      <Typography variant="body1" sx={{ mb: 1.5 }}><strong>资产-删除:</strong> {userProfile.can_delete_assets ? '是' : '否'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1.5 }}><strong>维修记录-添加:</strong> {userProfile.can_add_maintenance_records ? '是' : '否'}</Typography>
                      <Typography variant="body1" sx={{ mb: 1.5 }}><strong>维修记录-编辑:</strong> {userProfile.can_edit_maintenance_records ? '是' : '否'}</Typography>
                      <Typography variant="body1" sx={{ mb: 1.5 }}><strong>维修记录-删除:</strong> {userProfile.can_delete_maintenance_records ? '是' : '否'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">正在加载用户信息...</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Profile;