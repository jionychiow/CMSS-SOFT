import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Chip,
  TextField
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import axios from 'axios';
import { url } from '../../Config';
import AuthContext from '../../AuthProvider/AuthContext';

const MaintenanceRateStatsDialog = ({ open, onClose, phaseId, processId, productionLineId }) => {
  const { state: authState } = useContext(AuthContext);
  const [statsData, setStatsData] = useState(null);
  const [lineProcessData, setLineProcessData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // month, quarter, year
  const [selectedTab, setSelectedTab] = useState(0); // 新增tab状态
  const [selectedPhase, setSelectedPhase] = useState(phaseId || ''); // 使用传入的phaseId作为默认值
  const [selectedProcess, setSelectedProcess] = useState('');
  const [selectedProductionLine, setSelectedProductionLine] = useState('');

  // 获取可用的筛选选项
  const [availableOptions, setAvailableOptions] = useState({
    phases: [],
    processes: [],
    productionLines: []
  });

  // 获取配置数据
  const fetchConfigData = async () => {
    try {
      const response = await axios.get(`${url}/api/maintenance/config/get-config-data/`, {
        headers: {
          'Authorization': `Token ${authState.token}`
        }
      });
      setAvailableOptions(response.data);
    } catch (error) {
      console.error('获取配置数据失败:', error);
    }
  };

  useEffect(() => {
    if (open) {
      // 获取配置数据
      fetchConfigData();
      
      // 如果有传入的phaseId，优先使用传入的值
      if (phaseId) {
        setSelectedPhase(phaseId);
      }
      fetchStatsData();
      fetchLineProcessData(); // 获取产线和工序数据
    }
  }, [open, selectedPeriod, selectedPhase, selectedProcess, selectedProductionLine, phaseId]);

  const fetchStatsData = async () => {
    setLoading(true);
    try {
      const params = {
        period: selectedPeriod
      };
      
      if (selectedPhase) params.phase_id = selectedPhase;
      if (selectedProcess) params.process_id = selectedProcess;
      if (selectedProductionLine) params.production_line_id = selectedProductionLine;

      const response = await axios.get(`${url}/api/maintenance/maintenance-rate-stats/`, {
        headers: {
          'Authorization': `Token ${authState.token}`
        },
        params: params
      });

      setStatsData(response.data);
      setAvailableOptions(response.data.available_options);
    } catch (error) {
      console.error('获取维修率统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取按产线和工序分组的维修数量数据
  const fetchLineProcessData = async () => {
    try {
      const params = {
        period: selectedPeriod
      };
      
      if (selectedPhase) params.phase_id = selectedPhase;
      if (selectedProcess) params.process_id = selectedProcess;
      if (selectedProductionLine) params.production_line_id = selectedProductionLine;

      const response = await axios.get(`${url}/api/maintenance/maintenance-by-line-process/`, {
        headers: {
          'Authorization': `Token ${authState.token}`
        },
        params: params
      });

      setLineProcessData(response.data);
    } catch (error) {
      console.error('获取产线和工序维修数据失败:', error);
    }
  };

  const handlePeriodChange = (event, newValue) => {
    setSelectedPeriod(newValue);
  };

  const handleClose = () => {
    onClose();
    // 重置状态
    setSelectedPeriod('month');
    setSelectedPhase('');
    setSelectedProcess('');
    setSelectedProductionLine('');
    setSelectedTab(0); // 重置标签页
  };

  // 处理折线图数据格式转换
  const formatLineChartData = () => {
    if (!statsData || !statsData.line_chart_data) return [];
    
    return statsData.line_chart_data.map(item => ({
      name: item.date,
      维修次数: item.count
    }));
  };

  // 处理柱状图数据格式转换
  const formatBarChartData = () => {
    if (!statsData || !statsData.bar_chart_data) return [];
    
    return statsData.bar_chart_data.slice(0, 10).map(item => ({
      name: `${item.process}-${item.production_line}`,
      维修次数: item.count,
      期别: item.phase
    }));
  };

  // 格式化产线维修数据
  const formatProductionLineData = () => {
    if (!lineProcessData || !lineProcessData.production_line_stats) return [];
    
    return lineProcessData.production_line_stats.map(item => ({
      name: item.name,
      维修次数: item.count
    }));
  };

  // 格式化工序维修数据
  const formatProcessData = () => {
    if (!lineProcessData || !lineProcessData.process_stats) return [];
    
    return lineProcessData.process_stats.map(item => ({
      name: item.name,
      维修次数: item.count
    }));
  };

  // Tab切换处理
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        style: {
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" flexDirection="column">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">设备维修故障维修率统计</Typography>
            <Box display="flex" gap={1}>
              <Chip 
                label={`总维修记录: ${statsData?.total_maintenance_count || 0}`} 
                color="primary" 
                size="small" 
              />
            </Box>
          </Box>
          {/* 添加标签页 */}
          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mt: 2 }}>
            <Tab label="综合统计" />
            <Tab label="产线统计" />
            <Tab label="工序统计" />
          </Tabs>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* 筛选器 */}
        <Box mb={3} display="flex" gap={2} flexWrap="wrap" alignItems="flex-end">
          <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
            <InputLabel>时间周期</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="时间周期"
            >
              <MenuItem value="month">一个月</MenuItem>
              <MenuItem value="quarter">一个季度</MenuItem>
              <MenuItem value="year">一年</MenuItem>
            </Select>
          </FormControl>
          
          {/* 如果传入了固定的期别，则显示固定的期别标签，否则显示下拉选择器 */}
          {!phaseId && (
            <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
              <InputLabel>期别</InputLabel>
              <Select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                label="期别"
              >
                <MenuItem value="">
                  <em>全部</em>
                </MenuItem>
                {availableOptions.phases.map(phase => (
                  <MenuItem key={phase.id} value={phase.id}>
                    {phase.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          {/* 如果传入了固定的期别，则显示期别信息 */}
          {phaseId && (
            <Box 
              p={1} 
              border={1} 
              borderColor="grey.300" 
              borderRadius={1}
              bgcolor="lightblue"
              minWidth={150}
            >
              <Typography variant="body2" align="center">
                期别: {
                  // 首先尝试从可用选项中查找
                  availableOptions.phases.find(p => p.id === phaseId)?.name ||
                  // 如果找不到，根据phaseId的值直接显示对应的中文名称
                  (phaseId === 'phase_1' ? '一期' : 
                   phaseId === 'phase_2' ? '二期' : 
                   phaseId)
                }
              </Typography>
            </Box>
          )}
          
          <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
            <InputLabel>工段</InputLabel>
            <Select
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(e.target.value)}
              label="工段"
            >
              <MenuItem value="">
                <em>全部</em>
              </MenuItem>
              {availableOptions.processes?.map(process => (
                <MenuItem key={process.id} value={process.id}>
                  {process.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
            <InputLabel>产线</InputLabel>
            <Select
              value={selectedProductionLine}
              onChange={(e) => setSelectedProductionLine(e.target.value)}
              label="产线"
            >
              <MenuItem value="">
                <em>全部</em>
              </MenuItem>
              {/* 根据选中的期别过滤产线 */}
              {availableOptions.productionLines?.filter(line => 
                !selectedPhase || line.phase_code === selectedPhase
              ).map(line => (
                <MenuItem key={line.id} value={line.id}>
                  {line.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 根据选中的标签页显示不同的内容 */}
        {selectedTab === 0 && (
          <Grid container spacing={3}>
            {/* 折线图 - 维修趋势 */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    维修趋势图 ({selectedPeriod === 'month' ? '每日' : selectedPeriod === 'quarter' ? '每周' : '每月'})
                  </Typography>
                  <Box height={300} minHeight={300} minWidth={0} sx={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                      <LineChart
                        data={formatLineChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="维修次数" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* 柱状图 - 各工段产线维修统计 */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    工段-产线维修统计图
                  </Typography>
                  <Box height={300} minHeight={300} minWidth={0} sx={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={300} minWidth={0}>
                      <BarChart
                        data={formatBarChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="维修次数" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* 更多统计信息卡片 */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    维修详情统计
                  </Typography>
                  <Grid container spacing={2}>
                    {statsData?.bar_chart_data?.slice(0, 6).map((item, index) => (
                      <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                        <Box 
                          p={2} 
                          border={1} 
                          borderColor="grey.300" 
                          borderRadius={1}
                          bgcolor="grey.50"
                        >
                          <Typography variant="subtitle2">{item.process} - {item.production_line}</Typography>
                          <Typography variant="h6" color="primary">{item.count} 次维修</Typography>
                          <Typography variant="caption" color="textSecondary">期别: {item.phase}</Typography>
                        </Box>
                      </Grid>
                    )) || (
                      <Grid size={{ xs: 12 }}>
                        <Typography align="center" color="textSecondary">
                          暂无数据
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {selectedTab === 1 && (
          <Grid container spacing={3}>
            {/* 产线维修数量柱形图 */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    各产线维修数量统计
                  </Typography>
                  <Box height={400} minHeight={400} minWidth={0} sx={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={400} minWidth={0}>
                      <BarChart
                        data={formatProductionLineData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="维修次数" fill="#ff7300" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {selectedTab === 2 && (
          <Grid container spacing={3}>
            {/* 工序维修数量柱形图 */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    各工序维修数量统计
                  </Typography>
                  <Box height={400} minHeight={400} minWidth={0} sx={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={400} minWidth={0}>
                      <BarChart
                        data={formatProcessData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="维修次数" fill="#0088fe" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenanceRateStatsDialog;