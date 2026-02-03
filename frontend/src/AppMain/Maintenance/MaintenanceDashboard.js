import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Box
} from '@mui/material';
import { Assignment as RecordIcon, Book as ManualIcon, Warning as CaseIcon } from '@mui/icons-material';
import { blue, green, orange } from '@mui/material/colors';
import axios from 'axios';

const MaintenanceDashboard = () => {
  const [stats, setStats] = useState({
    recordsCount: 0,
    manualsCount: 0,
    casesCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [recordsRes, manualsRes, taskPlansRes] = await Promise.all([
        axios.get('/api/db/maintenance-records/'),
        axios.get('/api/db/maintenance-manuals/'),
        axios.get('/api/db/task-plans/')
      ]);

      setStats({
        recordsCount: recordsRes.data.length,
        manualsCount: manualsRes.data.length,
        casesCount: taskPlansRes.data.length
      });
      setLoading(false);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          维修系统仪表板
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          生产维修资料系统的综合监控面板
        </Typography>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: blue[500] }}>
                  <RecordIcon />
                </Avatar>
              }
              title="维修记录总数"
              subheader={loading ? '加载中...' : stats.recordsCount}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                包含一期、二期所有生产线的维修记录
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: green[500] }}>
                  <ManualIcon />
                </Avatar>
              }
              title="维修手册数量"
              subheader={loading ? '加载中...' : stats.manualsCount}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                各设备维修步骤、参数、图解说明文档
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: orange[500] }}>
                  <CaseIcon />
                </Avatar>
              }
              title="任务计划数量"
              subheader={loading ? '加载中...' : stats.casesCount}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                历史故障处理经验与解决方案
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 功能模块入口 */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: blue[500], width: 64, height: 64, mx: 'auto' }}>
                <RecordIcon fontSize="large" />
              </Avatar>
            </Box>
            <Typography variant="h6" gutterBottom>
              维修记录
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              记录设备维修历史，按一期二期、长白班倒班分类
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {stats.recordsCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: green[500], width: 64, height: 64, mx: 'auto' }}>
                <ManualIcon fontSize="large" />
              </Avatar>
            </Box>
            <Typography variant="h6" gutterBottom>
              维修手册
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              设备维修步骤、参数、图解说明文档
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {stats.manualsCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: orange[500], width: 64, height: 64, mx: 'auto' }}>
                <CaseIcon fontSize="large" />
              </Avatar>
            </Box>
            <Typography variant="h6" gutterBottom>
              任务计划
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              历史故障处理经验与解决方案
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {stats.casesCount}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MaintenanceDashboard;