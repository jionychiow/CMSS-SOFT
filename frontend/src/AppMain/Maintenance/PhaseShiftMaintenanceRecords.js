import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import StableSearchInput from '../Components/StableSearchInput';
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
  Snackbar,
  Alert,
  InputAdornment,
  MenuItem,
  useMediaQuery,
  useTheme,
  Chip,
  Toolbar,
  Tooltip,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import zhCN from 'date-fns/locale/zh-CN';
import { Add as AddIcon, FilterList as FilterIcon, Download as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { url } from '../../Config';
import AuthContext from '../../AuthProvider/AuthContext';
import MaintenanceRateStatsDialog from './MaintenanceRateStatsDialog';

// 定义字段配置
const FIELD_CONFIG = {
  long_day_shift: [
    { key: 'serial_number', label: '序号', required: true },
    { key: 'month', label: '月份', required: true },
    { key: 'production_line', label: '产线', required: true },
    { key: 'process', label: '工序', required: true },
    { key: 'equipment_name', label: '设备或工装名称', required: true },
    { key: 'equipment_number', label: '设备编号', required: true },
    { key: 'equipment_part', label: '设备零部件/部位', required: true },
    { key: 'change_reason', label: '变更原因', required: true },
    { key: 'before_change', label: '变更前(现状)', required: true },
    { key: 'after_change', label: '变更后（变了什么）', required: true },
    { key: 'start_date_time', label: '开始日期及时间', required: true },
    { key: 'end_date_time', label: '结束日期及时间', required: true },
    { key: 'duration', label: '耗用时长', required: false },
    { key: 'parts_consumables', label: '零件耗材', required: true },
    { key: 'implementer', label: '实施人', required: true },
    { key: 'acceptor', label: '验收人', required: false },
    { key: 'remarks', label: '备注', required: false }
  ],
  rotating_shift: [
    { key: 'serial_number', label: '序号', required: true },
    { key: 'month', label: '月份', required: true },
    { key: 'production_line', label: '产线', required: true },
    { key: 'process', label: '工序', required: true },
    { key: 'equipment_name', label: '设备或工装名称', required: true },
    { key: 'equipment_number', label: '设备编号', required: true },
    { key: 'equipment_part', label: '设备零部件/部位', required: true },
    { key: 'change_reason', label: '变更原因', required: true },
    { key: 'before_change', label: '变更前(现状)', required: true },
    { key: 'after_change', label: '变更后（变了什么）', required: true },
    { key: 'start_date_time', label: '开始日期及时间', required: true },
    { key: 'end_date_time', label: '结束日期及时间', required: true },
    { key: 'duration', label: '耗用时长', required: false },
    { key: 'parts_consumables', label: '零件耗材', required: true },
    { key: 'implementer', label: '实施人', required: true },
    { key: 'acceptor', label: '验收人', required: false },
    { key: 'remarks', label: '备注', required: false }
  ]
};

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

const PhaseShiftMaintenanceRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({});

  const searchInputRef = useRef('');
  const [searchInput, setSearchInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [showFilters, setShowFilters] = useState(true);
  const [openStatsDialog, setOpenStatsDialog] = useState(false);

  const { state: authState } = useContext(AuthContext);
  const { token, user_profile } = authState;
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlPhase = searchParams.get('phase');
  const urlShiftType = searchParams.get('shift_type');

  // 辅助函数：为特定字段设置最小宽度
 const getMinWidthForField = (fieldKey) => {
  switch (fieldKey) {
    case 'serial_number':      // 序号
      return '80px';
    case 'month':              // 月份
      return '30px';
    case 'production_line':    // 产线
      return '40px';
    case 'process':            // 工序
      return '30px';
    case 'equipment_name':     // 设备或工装名称
      return '180px';
    case 'equipment_number':   // 设备编号
      return '100px';
    case 'equipment_part':     // 设备零部件/部位
      return '180px';
    case 'change_reason':      // 变更原因
      return '40px';
    case 'before_change':      // 变更前(现状)
      return '200px';
    case 'after_change':       // 变更后（变了什么）
      return '200px';
    case 'start_date_time':    // 开始日期及时间
      return '120px';
    case 'end_date_time':      // 结束日期及时间
      return '120px';
    case 'duration':           // 耗用时长
      return '40px';
    case 'parts_consumables':  // 零件耗材
      return '180px';
    case 'implementer':        // 实施人
      return '80px';
    case 'acceptor':           // 验收人
      return '80px';
    case 'remarks':            // 备注
      return '250px';
    default:
      return '90px';
  }
};

  // 根据用户权限确定当前的工厂分期和班次类型
  const getUserPhase = () => {
    if (user_profile && user_profile.plant_phase) {
      // 如果用户类型是Admin，允许访问所有阶段
      if (user_profile.type === 'Admin') {
        // 如果URL参数为空，返回默认值；否则返回URL参数
        return effectivePhase || 'phase_1'; 
      }
      return user_profile.plant_phase;
    }
    // 默认返回一期，如果没有权限信息
    return 'phase_1';
  };

  const getUserShiftType = () => {
    if (user_profile && user_profile.shift_type) {
      // 如果用户类型是Admin，允许访问所有班次
      if (user_profile.type === 'Admin') {
        // 如果URL参数为空，返回默认值；否则返回URL参数
        return effectiveShiftType || 'long_day_shift';
      }
      return user_profile.shift_type;
    }
    // 默认返回长白班，如果没有权限信息
    return 'long_day_shift';
  };

  // 如果URL参数不存在，则使用用户权限确定的值
  const effectivePhase = urlPhase || getUserPhase();
  const effectiveShiftType = urlShiftType || getUserShiftType();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // 检查当前用户是否有删除权限
  const hasDeletePermission = user_profile?.type === 'Admin' || user_profile?.can_delete_maintenance_records;

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

  // 获取字段配置
  const getFieldConfig = () => {
    if (!effectiveShiftType) return [];
    return FIELD_CONFIG[effectiveShiftType] || [];
  };

  // 获取表单字段配置（排除序号和月份字段，因为它们在表单中只读显示）
  const getFormFieldsConfig = () => {
    if (!effectiveShiftType) return [];
    const allFields = FIELD_CONFIG[effectiveShiftType] || [];
    // 排除序号和月份字段，因为它们在表单中只读显示
    return allFields.filter(field => field.key !== 'serial_number' && field.key !== 'month');
  };

  // 获取字段值
  const getFieldValue = (record, fieldKey) => {
    if (fieldKey === 'phase_display') {
      return record.phase === 'phase_1' ? '一期' : '二期';
    }
    if (fieldKey === 'shift_type_display') {
      return record.shift_type === 'long_day_shift' ? '长白班' : '倒班';
    }
    // 处理后端字段名与前端显示字段名不匹配的情况
    if (fieldKey === 'serial_number') {
      return record.serial_number || '';
    }
    if (fieldKey === 'month') {
      return record.month || '';
    }
    // 处理变更原因字段的中文显示
    if (fieldKey === 'change_reason') {
      const reasonMap = {
        'maintenance': '维保',
        'repair': '维修',
        'technical_modification': '技改'
      };
      return reasonMap[record[fieldKey]] || record[fieldKey] || '';
    }
    // 格式化时间字段为24小时制
    if (fieldKey === 'start_date_time' || fieldKey === 'end_date_time') {
      // 后端API返回的字段名是 start_datetime 和 end_datetime
      // 前端表单使用的字段名是 start_date_time 和 end_date_time
      const backendFieldName = fieldKey === 'start_date_time' ? 'start_datetime' : 'end_datetime';
      
      // 首先检查前端字段名，然后检查后端字段名
      const fieldValue = record[fieldKey] || record[backendFieldName];
      
      if (fieldValue) {
        const date = new Date(fieldValue);
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
          return fieldValue || '';
        }
        // 格式化为 YYYY-MM-DD HH:mm:ss 格式（24小时制）
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
      return '';
    }
    // 对耗用时长字段进行格式化，保留一位小数
    if (fieldKey === 'duration') {
      const durationValue = record[fieldKey];
      if (durationValue !== undefined && durationValue !== null && durationValue !== '') {
        const numValue = parseFloat(durationValue);
        if (!isNaN(numValue)) {
          return numValue.toFixed(1);
        }
      }
      return durationValue || '';
    }
    return record[fieldKey] || '';
  };

  // 获取表单初始值
  const getInitialFormValues = () => {
    const config = getFormFieldsConfig(); // 使用更新后的表单字段配置
    const initialValues = {};
    
    config.forEach(field => {
      initialValues[field.key] = '';
    });
    
    if (effectivePhase) {
      initialValues['phase'] = effectivePhase;
    }
    if (effectiveShiftType) {
      initialValues['shift_type'] = effectiveShiftType;
    }
    
    return initialValues;
  };

  // 显示通知
  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // 获取记录
  const fetchRecords = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/db/shift-maintenance-records/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
        params: {
          phase: effectivePhase,
          shift_type: effectiveShiftType
        }
      });
      setRecords(response.data);
      setFilteredRecords(response.data);
    } catch (error) {
      console.error('获取记录失败:', error);
      showSnackbar('获取记录失败', 'error');
    }
  }, [token, effectivePhase, effectiveShiftType, showSnackbar]);

  // 获取记录带过滤
  const fetchRecordsWithFilters = useCallback(async (phase, shiftType) => {
    try {
      const response = await axios.get(`${url}/api/db/shift-maintenance-records/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
        params: {
          phase: phase,
          shift_type: shiftType
        }
      });
      setRecords(response.data);
      setFilteredRecords(response.data);
    } catch (error) {
      console.error('获取记录失败:', error);
      showSnackbar('获取记录失败', 'error');
    }
  }, [token, showSnackbar]);

  // 创建记录
  const createRecord = async (data) => {
    try {
      const response = await axios.post(
        `${url}/api/db/shift-maintenance-records/`,
        data,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // 使用函数式更新来避免race condition
      setRecords(prevRecords => [...prevRecords, response.data]);
      setFilteredRecords(prevFilteredRecords => [...prevFilteredRecords, response.data]);
      showSnackbar('记录创建成功', 'success');
    } catch (error) {
      console.error('创建记录失败:', error);
      // 尝试获取更详细的错误信息
      let errorMessage = '创建记录失败';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = `创建记录失败: ${error.response.data}`;
        } else if (typeof error.response.data === 'object') {
          // 获取第一个错误字段的信息
          const firstErrorField = Object.keys(error.response.data)[0];
          if (firstErrorField) {
            const fieldErrors = error.response.data[firstErrorField];
            if (Array.isArray(fieldErrors)) {
              errorMessage = `创建记录失败: ${firstErrorField} - ${fieldErrors[0]}`;
            } else {
              errorMessage = `创建记录失败: ${firstErrorField} - ${fieldErrors}`;
            }
          } else {
            errorMessage = '创建记录失败: 请求数据有误';
          }
        }
      }
      showSnackbar(errorMessage, 'error');
    }
  };

  // 更新记录
  const updateRecord = async (id, data) => {
    try {
      const response = await axios.put(
        `${url}/api/db/shift-maintenance-records/${id}/`,
        data,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // 使用函数式更新来避免race condition
      setRecords(prevRecords => prevRecords.map((record) =>
        record.uuid === id ? response.data : record
      ));
      setFilteredRecords(prevFilteredRecords => prevFilteredRecords.map((record) =>
        record.uuid === id ? response.data : record
      ));
      showSnackbar('记录更新成功', 'success');
    } catch (error) {
      console.error('更新记录失败:', error);
      // 尝试获取更详细的错误信息
      let errorMessage = '更新记录失败';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = `更新记录失败: ${error.response.data}`;
        } else if (typeof error.response.data === 'object') {
          // 获取第一个错误字段的信息
          const firstErrorField = Object.keys(error.response.data)[0];
          if (firstErrorField) {
            const fieldErrors = error.response.data[firstErrorField];
            if (Array.isArray(fieldErrors)) {
              errorMessage = `更新记录失败: ${firstErrorField} - ${fieldErrors[0]}`;
            } else {
              errorMessage = `更新记录失败: ${firstErrorField} - ${fieldErrors}`;
            }
          } else {
            errorMessage = '更新记录失败: 请求数据有误';
          }
        }
      }
      showSnackbar(errorMessage, 'error');
    }
  };

  // 删除记录
  const deleteRecord = async (id) => {
    // 检查ID是否有效
    if (!id) {
      console.error('无效的记录ID:', id);
      showSnackbar('无效的记录ID，无法删除', 'error');
      return;
    }
    
    try {
      await axios.delete(`${url}/api/db/shift-maintenance-records/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      // 使用函数式更新来避免race condition
      setRecords(prevRecords => prevRecords.filter((record) => record.uuid !== id));
      setFilteredRecords(prevFilteredRecords => prevFilteredRecords.filter((record) => record.uuid !== id));
      showSnackbar('记录删除成功', 'success');
    } catch (error) {
      console.error('删除记录失败:', error);
      showSnackbar('删除记录失败', 'error');
    }
  };

  // 处理搜索输入变化 - 不执行自动搜索
  const handleSearchInputChange = useCallback((event) => {
    const value = event.target.value;
    searchInputRef.current = value;  // 更新 ref 的值
    setSearchInput(value);  // 同时更新状态以确保 UI 同步
  }, []); // 不依赖任何外部变量

  // 执行搜索 - 按钮触发
  const handleSearch = useCallback((searchValue) => {
    const searchTerm = searchValue !== undefined ? searchValue : (searchInputRef.current || searchInput); // 优先使用传入的值
    if (searchTerm.trim() === '') {
      setFilteredRecords(records);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = records.filter((record) =>
        Object.values(record).some(
          (value) =>
            value &&
            typeof value === 'string' &&
            value.toLowerCase().includes(term)
        )
      );
      setFilteredRecords(filtered);
    }
  }, [searchInput, records]); // 使用 useCallback 并添加依赖

  // 打开表单
  const handleOpenForm = (record = null) => {
    setCurrentRecord(record);
    if (record) {
      setFormData({ ...record });
      // 同步设置selectedImplementers，如果是字符串则分割
      if (record.implementer) {
        const implementers = typeof record.implementer === 'string' 
          ? record.implementer.split(', ').filter(item => item.trim()) 
          : Array.isArray(record.implementer) ? record.implementer : [record.implementer];
        setSelectedImplementers(implementers);
      } else {
        setSelectedImplementers([]);
      }
    } else {
      setFormData(getInitialFormValues());
    }
    setOpenForm(true);
  };

  // 关闭表单
  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentRecord(null);
    setFormData(getInitialFormValues());
    setSelectedImplementers([]);
  };

  // 提交表单
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // 验证必填字段
    const requiredFields = getFormFieldsConfig().filter(field => field.required);
    for (const field of requiredFields) {
      if (field.key === 'implementer') {
        // 特殊处理实施人字段 - 检查selectedImplementers
        if (!selectedImplementers || selectedImplementers.length === 0) {
          showSnackbar(`请填写${field.label}`, 'error');
          return;
        }
      } else {
        // 处理其他字段
        if (!formData[field.key]) {
          showSnackbar(`请填写${field.label}`, 'error');
          return;
        }
      }
    }
    
    // 准备要提交的数据
    let submitData = {};
    
    // 将前端字段名映射到后端字段名
    Object.keys(formData).forEach(key => {
      if (key === 'start_date_time') {
        // 确保日期时间为本地时间格式，避免时区转换
        if (formData[key]) {
          const date = new Date(formData[key]);
          // 获取本地时间的各部分并格式化为 'YYYY-MM-DD HH:mm:ss' 格式
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          const localDateTimeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          submitData.start_datetime = localDateTimeStr;
        }
      } else if (key === 'end_date_time') {
        // 确保日期时间为本地时间格式，避免时区转换
        if (formData[key]) {
          const date = new Date(formData[key]);
          // 获取本地时间的各部分并格式化为 'YYYY-MM-DD HH:mm:ss' 格式
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          const localDateTimeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
          submitData.end_datetime = localDateTimeStr;
        }
      } else {
        submitData[key] = formData[key];
      }
    });
    
    // 确保implementer字段与selectedImplementers同步
    if (selectedImplementers && selectedImplementers.length > 0) {
      submitData.implementer = selectedImplementers.join(', ');
    }
    
    // 对于新建记录，移除序号和月份字段，让后端自动生成
    if (!currentRecord) {
      const { serial_number, month, ...rest } = submitData;
      submitData = rest;
    }
    
    // 添加phase和shift_type，使用从配置数据中获取的ID
    if (effectivePhase && configData.phases) {
      const phaseObj = configData.phases.find(p => p.code === effectivePhase);
      if (phaseObj) {
        submitData.phase = phaseObj.id;
      }
    }
    
    if (effectiveShiftType && configData.shiftTypes) {
      const shiftObj = configData.shiftTypes.find(s => s.code === effectiveShiftType);
      if (shiftObj) {
        submitData.shift_type = shiftObj.id;
      }
    }
    
    if (currentRecord) {
      await updateRecord(currentRecord.id, submitData);
    } else {
      await createRecord(submitData);
    }
    
    handleCloseForm();
  };


  
  // Excel功能相关状态
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  // 月份选择状态
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' 表示选择全部月份，或者 'YYYY-MM' 格式的具体月份



  // 添加状态变量
  const [assets, setAssets] = useState([]); // 存储设备数据
  const [configData, setConfigData] = useState({ // 存储配置数据
    phases: [],
    productionLines: [],
    processes: [],
    shiftTypes: []
  }); 
  const [implementersOptions, setImplementersOptions] = useState([]); // 实施人选项
  const [selectedImplementers, setSelectedImplementers] = useState([]); // 已选择的实施人

  // 获取配置数据
  const fetchConfigData = useCallback(async () => {
    try {
      console.log('PhaseShiftMaintenanceRecords - 开始获取配置数据...');
      console.log('PhaseShiftMaintenanceRecords - Token:', token ? '存在' : '不存在');
      
      const response = await axios.get(`${url}/api/maintenance/config/get-config-data/`, {
              headers: {
                Authorization: `Token ${token}`,
              },
            });
      
      console.log('PhaseShiftMaintenanceRecords - API响应数据:', response.data);
      setConfigData(response.data);
      
      console.log('PhaseShiftMaintenanceRecords - 配置数据设置完成:', {
        phasesCount: response.data.phases?.length || 0,
        productionLinesCount: response.data.productionLines?.length || 0,
        processesCount: response.data.processes?.length || 0
      });
    } catch (error) {
      console.error('PhaseShiftMaintenanceRecords - 获取配置数据失败:', error);
      // 详细错误信息
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
  }, [token]); // url是常量，不需要作为依赖

  // 获取设备数据
  const fetchAssets = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/db/assets/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setAssets(response.data);
    } catch (error) {
      console.error('获取设备数据失败:', error);
    }
  }, [token]);

  // 获取所有用户作为实施人选项
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/user-management/list-users/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      // 只取用户名作为选项
      // API返回的是用户数组，而不是{users: [...]}结构
      const users = response.data.map(user => user.username);
      setImplementersOptions(users);
    } catch (error) {
      console.error('获取用户数据失败:', error);
    }
  }, [token]);

  // 初始化配置数据、资产和用户数据
  useEffect(() => {
    fetchConfigData();
    fetchAssets();
    fetchUsers();
  }, [fetchConfigData, fetchAssets, fetchUsers]);

  // 当配置数据加载完成后，初始化表单
  useEffect(() => {
    if (configData.phases && configData.phases.length > 0 && 
        configData.productionLines && configData.productionLines.length > 0 && 
        configData.processes && configData.processes.length > 0 && 
        assets && assets.length > 0 && 
        implementersOptions && implementersOptions.length > 0) {
      // 如果是新建记录，设置默认值
      if (!currentRecord && openForm) {
        const currentUser = authState.user_profile?.username || '';
        setFormData(prev => ({
          ...prev,
          start_date_time: new Date(),
          end_date_time: new Date(),
          implementer: currentUser // 默认为当前用户名
        }));
        // 同步设置selectedImplementers
        setSelectedImplementers([currentUser]);
      }
    }
  }, [configData, assets, implementersOptions, currentRecord, openForm, authState.user_profile]);

  // 处理实施人选择变化
  const handleImplementersChange = (newValue) => {
    // 确保第一个实施人始终是当前用户
    const currentUser = authState.user_profile?.username || '';
    let updatedValue = [...newValue]; // 创建副本以避免直接修改
    
    if (newValue.length > 0 && newValue[0] !== currentUser) {
      // 如果当前用户不在第一位，则添加到第一位
      if (newValue.includes(currentUser)) {
        // 如果当前用户在列表中，移到第一位
        const filtered = newValue.filter(name => name !== currentUser);
        updatedValue = [currentUser, ...filtered];
      } else {
        // 如果当前用户不在列表中，添加到第一位
        updatedValue = [currentUser, ...newValue];
      }
    }
    
    setSelectedImplementers(updatedValue);
    
    // 同时更新formData中的implementer字段
    setFormData(prevFormData => ({
      ...prevFormData,
      implementer: updatedValue.join(', ')
    }));
  };

  // 处理表单变化
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 处理日期时间变化
  const handleDateTimeChange = (name, value) => {
    let updatedFormData = {
      ...formData,
      [name]: value,
    };
    
    // 如果是开始时间或结束时间改变，自动计算耗用时长
    if (name === 'start_date_time' || name === 'end_date_time') {
      const startDate = updatedFormData.start_date_time;
      const endDate = updatedFormData.end_date_time;
      
      if (startDate && endDate) {
        // 计算时间差（毫秒）
        const startTime = new Date(startDate).getTime();
        const endTime = new Date(endDate).getTime();
        
        if (!isNaN(startTime) && !isNaN(endTime)) {
          // 计算时间差（小时）
          const durationHours = (endTime - startTime) / (1000 * 60 * 60);
          const roundedDuration = Number(durationHours.toFixed(1)); // 保留一位小数
          
          // 只有当时间差为正数时才设置耗用时长
          if (roundedDuration > 0) {
            updatedFormData = {
              ...updatedFormData,
              duration: roundedDuration.toString() // 转换为字符串以适应TextField
            };
          } else {
            updatedFormData = {
              ...updatedFormData,
              duration: '' // 时间差为负或零时清空耗用时长
            };
          }
        }
      }
    }
    
    setFormData(updatedFormData);
  };

  // 处理实施人多选变化
  const handleMultiSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: Array.isArray(value) ? value.join(', ') : value,
    });
  };

  // 监听URL参数变化
  useEffect(() => {
    if (effectivePhase && effectiveShiftType) {
      fetchRecords();
    }
  }, [effectivePhase, effectiveShiftType, fetchRecords, token]);

  // 自动设置用户权限对应的phase和shift_type（仅当URL参数缺失时）
  useEffect(() => {
    if (!urlPhase || !urlShiftType) {
      // 如果URL中没有参数，且用户有权限信息，则自动重定向到对应的页面
      if (user_profile && user_profile.plant_phase && user_profile.shift_type) {
        // 不需要手动重定向，因为effectivePhase和effectiveShiftType已经基于用户权限设置了
        // 数据获取会自动使用这些值
      }
    }
  }, [urlPhase, urlShiftType, user_profile]);

  // 监听URL参数变化，如果变化则重新获取数据
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newUrlPhase = params.get('phase');
    const newUrlShiftType = params.get('shift_type');
    
    if (newUrlPhase !== urlPhase || newUrlShiftType !== urlShiftType) {
      // 如果URL参数发生变化，重新获取数据
      if (newUrlPhase && newUrlShiftType) {
        fetchRecordsWithFilters(newUrlPhase, newUrlShiftType);
      }
    }
  }, [location.search, fetchRecordsWithFilters, urlPhase, urlShiftType, token]);

  // 处理下载模板
  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(`${url}/api/excel/download-template/`, {
        headers: {
          Authorization: `Token ${token}`,  // 修复：使用Token认证而不是Bearer
        },
        responseType: 'blob' // 重要：指定响应类型为blob
      });
      
      // 创建下载链接
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '维修记录模板.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      showSnackbar('模板下载成功', 'success');
    } catch (error) {
      console.error('下载模板失败:', error);
      showSnackbar('下载模板失败', 'error');
    }
  };

  // 处理下载记录
  const handleDownloadRecords = async () => {
    try {
      // 总是使用页面上下文中的固定值，不管用户类型
      const filtersToSend = { 
        phase: effectivePhase, 
        shift_type: effectiveShiftType,
        month: selectedMonth  // 添加月份筛选参数
      };
      
      console.log('DEBUG: Sending download request with filters:', filtersToSend);
      
      const response = await axios.post(`${url}/api/db/excel/download-records/`, filtersToSend, {
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
      link.setAttribute('download', '维修记录.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      showSnackbar('记录下载成功', 'success');
      setOpenDownloadDialog(false);
    } catch (error) {
      console.error('下载记录失败:', error);
      showSnackbar('下载记录失败', 'error');
    }
  };

  // 处理文件选择
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
      } else {
        showSnackbar('请选择Excel文件(.xlsx)', 'error');
      }
    }
  };

  // 处理上传
  const handleUpload = async () => {
    if (!selectedFile) {
      showSnackbar('请选择要上传的文件', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    // 添加期数和班次类型信息，使用页面上下文中的值
    formData.append('phase', effectivePhase);
    formData.append('shift_type', effectiveShiftType);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await axios.post(`${url}/api/db/excel/upload-records/`, formData, {
        headers: {
          Authorization: `Token ${token}`,  // 修复：使用Token认证而不是Bearer
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      showSnackbar(response.data.message || '文件上传成功', 'success');
      setSelectedFile(null);
      // 重新获取记录以显示新上传的数据
      fetchRecords();
    } catch (error) {
      console.error('上传失败:', error);
      const errorMessage = error.response?.data?.error || '上传失败';
      showSnackbar(errorMessage, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };



  // 检查用户是否有足够的权限访问此页面
  if (!user_profile || (!user_profile.plant_phase && user_profile.type !== 'Admin') || (!user_profile.shift_type && user_profile.type !== 'Admin')) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            无法获取用户权限信息，请联系管理员
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => window.location.href = '/'}
          >
            返回主页
          </Button>
        </Paper>
      </Container>
    );
  }

  const currentShiftTypeDisplay = effectiveShiftType === 'long_day_shift' ? '长白班' : '倒班';
  const currentPhaseDisplay = effectivePhase === 'phase_1' ? '一期' : '二期';

  // 检查配置数据是否已加载
  const isConfigDataLoaded = 
    configData.phases && 
    configData.productionLines && 
    configData.processes &&
    configData.shiftTypes &&
    Array.isArray(configData.phases) && 
    Array.isArray(configData.productionLines) && 
    Array.isArray(configData.processes) &&
    Array.isArray(configData.shiftTypes);
  
  const isAssetsLoaded = assets !== null && assets !== undefined && Array.isArray(assets);

  // 在数据加载完成之前显示加载状态
  if (!isConfigDataLoaded || !isAssetsLoaded) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            正在加载配置数据...
          </Typography>
        </Paper>
      </Container>
    );
  }

  // 处理筛选器变化


  return (
    <Container maxWidth={isMobile ? "xs" : "xl"} sx={{ mt: isMobile ? 1 : 2, mb: 4, px: isMobile ? 1 : undefined }}>
      {/* 页面头部 */}
      <HeaderCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              维修记录管理系统
            </Typography>
            <Typography variant="h6" component="p" sx={{ opacity: 0.9 }}>
              {currentPhaseDisplay} - {currentShiftTypeDisplay} 维修记录
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={`${currentPhaseDisplay} - ${currentShiftTypeDisplay}`} 
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
                label={`总计: ${filteredRecords.length} 条`} 
                color="primary" 
                variant="filled"
                size={isExtraSmall ? "small" : "medium"}
                sx={{ fontWeight: 600, height: isMobile ? '32px' : '40px', fontSize: isMobile ? '0.75rem' : '0.875rem' }}
              />
              <Chip 
                label={`筛选后: ${filteredRecords.length} 条`} 
                color="secondary" 
                variant="outlined"
                size={isExtraSmall ? "small" : "medium"}
                sx={{ fontWeight: 600, height: isMobile ? '32px' : '40px', fontSize: isMobile ? '0.75rem' : '0.875rem' }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: isMobile ? 0.5 : 1, flexWrap: 'wrap', justifyContent: 'flex-end', order: isMobile ? 1 : 'initial' }}>
              <ActionButton 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
                disabled={!user_profile?.can_add_maintenance_records} // 根据权限控制
                sx={{ 
                  px: isExtraSmall ? 1 : isMobile ? 1.5 : 3,
                  minWidth: isMobile ? '100px' : 'auto',
                  mb: isMobile ? 0.5 : 0,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {isExtraSmall ? '+' : '新建记录'}
              </ActionButton>
              <ActionButton 
                variant={showFilters ? "contained" : "outlined"}
                color="info"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ 
                  px: isExtraSmall ? 1 : isMobile ? 1.5 : 3,
                  minWidth: isMobile ? '100px' : 'auto',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {showFilters ? (isExtraSmall ? '隐藏' : '隐藏筛选') : (isExtraSmall ? '筛选' : '显示筛选')}
              </ActionButton>
              
              {/* Excel功能按钮 */}
              <Tooltip title="下载模板用于批量录入">
                <ActionButton 
                  variant="outlined"
                  color="success"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadTemplate}
                  sx={{ 
                    px: isExtraSmall ? 0.75 : isMobile ? 1 : 2,
                    minWidth: isMobile ? '80px' : 'auto',
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {isExtraSmall ? '模' : isMobile ? '模板' : '下载模板'}
                </ActionButton>
              </Tooltip>
              
              <Tooltip title="下载选定条件的记录">
                <ActionButton 
                  variant="outlined"
                  color="success"
                  startIcon={<DownloadIcon />}
                  onClick={() => setOpenDownloadDialog(true)}
                  sx={{ 
                    px: isExtraSmall ? 0.75 : isMobile ? 1 : 2,
                    minWidth: isMobile ? '80px' : 'auto',
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {isExtraSmall ? '出' : isMobile ? '导出' : '导出记录'}
                </ActionButton>
              </Tooltip>
              
              <div>
                <input
                  accept=".xlsx,.xls"
                  id="upload-excel"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <Tooltip title="上传Excel文件批量导入">
                  <label htmlFor="upload-excel">
                    <ActionButton 
                      variant="contained"
                      color="secondary"
                      component="span"
                      startIcon={<UploadIcon />}
                      sx={{ 
                        px: isExtraSmall ? 0.75 : isMobile ? 1 : 2,
                        minWidth: isMobile ? '80px' : 'auto',
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                      }}
                    >
                      {isExtraSmall ? '入' : isMobile ? '导入' : '批量导入'}
                    </ActionButton>
                  </label>
                </Tooltip>
              </div>
              
              {/* 维修率统计按钮 */}
              <Tooltip title="查看设备维修故障维修率统计">
                <ActionButton 
                  variant="contained"
                  color="warning"
                  onClick={() => setOpenStatsDialog(true)}
                  sx={{ 
                    px: isExtraSmall ? 0.75 : isMobile ? 1 : 2,
                    minWidth: isMobile ? '80px' : 'auto',
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {isExtraSmall ? '率' : isMobile ? '维修率' : '维修率统计'}
                </ActionButton>
              </Tooltip>
              
              {selectedFile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: isMobile ? 0 : 1 }}>
                  <Typography variant={isExtraSmall ? "caption" : "body2"} noWrap sx={{ maxWidth: isMobile ? '80px' : '120px', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                    {selectedFile.name}
                  </Typography>
                  <ActionButton 
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={uploading}
                    sx={{ minWidth: isMobile ? '60px' : '70px', fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    {uploading ? `${uploadProgress}%` : (isExtraSmall ? '传' : '上传')}
                  </ActionButton>
                </Box>
              )}
            </Box>
          </Toolbar>



          {/* 搜索框 */}
          <Box sx={{ p: isMobile ? 1.5 : 3, bgcolor: 'rgba(250, 250, 250, 0.8)' }}>
            <Grid container spacing={isMobile ? 1 : 2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <StableSearchInput 
                    onSearch={handleSearch}
                    placeholder="搜索记录..."
                    sx={{
                      width: { xs: '100%', sm: '300px' }
                    }}
                  />
                  <Typography variant={isMobile ? "caption" : "body2"}>{filteredRecords.length} 条记录</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* 记录表格 */}
          <Box sx={{ p: isMobile ? 0.5 : 2 }}>
            <TableContainer 
              sx={{ 
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
              }}
            >
              <Table stickyHeader size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa', position: 'sticky', top: 0, zIndex: 10 }}>
                    {getFieldConfig() && getFieldConfig().length > 0 ? (
                      <>
                        {getFieldConfig().map((field) => (
                          <TableCell 
                            key={field.key} 
                            sx={{ 
                              fontWeight: 'bold', 
                              bgcolor: '#e3f2fd',
                              fontSize: isMobile ? '0.75rem' : '0.875rem',
                              padding: isMobile ? '6px 4px' : '12px 8px',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                              minWidth: getMinWidthForField(field.key),
                              maxWidth: isMobile ? '120px' : '160px',
                              verticalAlign: 'top',
                              borderRight: '1px solid #e0e0e0',
                              position: 'relative'
                            }}
                            title={field.label} // 鼠标悬停显示完整标签
                          >
                            <Box sx={{
                              wordWrap: 'break-word',
                              lineHeight: 1.3,
                              pr: 0.5
                            }}>
                              {field.label}
                              {field.required && <span style={{ color: 'red' }}> *</span>}
                            </Box>
                          </TableCell>
                        ))}
                        <TableCell 
                          sx={{ 
                            fontWeight: 'bold', 
                            bgcolor: '#e3f2fd',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            padding: isMobile ? '6px 4px' : '12px 8px',
                            whiteSpace: 'normal',
                            minWidth: 120,
                            maxWidth: isMobile ? '120px' : '160px',
                            verticalAlign: 'top',
                            borderRight: '1px solid #e0e0e0'
                          }}
                        >
                          操作
                        </TableCell>
                      </>
                    ) : (
                      <TableCell 
                        colSpan={1} 
                        align="center" 
                        sx={{ 
                          fontWeight: 'bold', 
                          bgcolor: '#e3f2fd',
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          padding: isMobile ? '6px 4px' : '12px 8px'
                        }}
                      >
                        加载中...
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <TableRow 
                        key={record.uuid} 
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
                          }
                        }}
                      >
                        {getFieldConfig() && getFieldConfig().length > 0 ? (
                          getFieldConfig().map((field) => (
                            <TableCell 
                            key={`${record.uuid}-${field.key}`}
                            sx={{ 
                              fontSize: isMobile ? '0.75rem' : '0.875rem',
                              padding: isMobile ? '6px 4px' : '12px 8px',
                              wordBreak: 'break-word',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              minWidth: getMinWidthForField(field.key),
                              maxWidth: isMobile ? '120px' : '160px',
                              verticalAlign: 'middle',
                              borderRight: '1px solid #f0f0f0'
                            }}
                            title={getFieldValue(record, field.key)} // 鼠标悬停显示完整内容
                          >
                            {getFieldValue(record, field.key)}
                          </TableCell>
                          ))
                        ) : (
                          <TableCell 
                            key={`${record.uuid}-loading`}
                            sx={{ 
                              fontSize: isMobile ? '0.75rem' : '0.875rem',
                              padding: isMobile ? '6px 4px' : '12px 8px',
                              wordBreak: 'break-word',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              verticalAlign: 'middle',
                              borderRight: '1px solid #f0f0f0'
                            }}
                          >
                            加载中...
                          </TableCell>
                        )}
                        <TableCell 
                          sx={{ 
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            padding: isMobile ? '6px 4px' : '12px 8px',
                            verticalAlign: 'middle',
                            whiteSpace: 'nowrap',
                            borderRight: '1px solid #f0f0f0'
                          }}
                        >
                          <Box sx={{ display: 'flex', flexWrap: isMobile ? 'column' : 'nowrap', gap: 0.5 }}>
                            <ActionButton 
                              variant="contained" 
                              size={isMobile ? "small" : "medium"} 
                              onClick={() => handleOpenForm(record)}
                              disabled={!user_profile?.can_edit_maintenance_records} // 根据权限控制
                              sx={{ 
                                mr: isMobile ? 0 : 0.5, 
                                mb: isMobile ? 0.5 : 0, 
                                minWidth: isMobile ? '60px' : '70px',
                                fontSize: isMobile ? '0.7rem' : '0.8rem',
                                padding: isMobile ? '4px 6px' : '6px 12px',
                                width: '100%',
                                flex: 1
                              }}
                            >
                              编辑
                            </ActionButton>
                            {hasDeletePermission && user_profile?.can_delete_maintenance_records && (
                              <ActionButton 
                                variant="outlined" 
                                color="error" 
                                size={isMobile ? "small" : "medium"} 
                                onClick={() => deleteRecord(record.uuid)}
                                sx={{ 
                                  minWidth: isMobile ? '60px' : '70px',
                                  fontSize: isMobile ? '0.7rem' : '0.8rem',
                                  padding: isMobile ? '4px 6px' : '6px 12px',
                                  width: '100%',
                                  flex: 1
                                }}
                              >
                                删除
                              </ActionButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={getFieldConfig()?.length + 1 || 1} 
                        align="center" 
                        sx={{ 
                          py: isMobile ? 3 : 6,
                          fontSize: isMobile ? '0.9rem' : 'inherit',
                          minHeight: isMobile ? '300px' : '400px'
                        }}
                      >
                        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <Typography variant={isMobile ? "h6" : "h5"} color="text.secondary">
                            暂无符合条件的维修记录
                          </Typography>
                          <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ mt: 1 }}>
                            尝试调整筛选条件或点击"新建记录"添加数据
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </StyledPaper>

      {/* 表单对话框 */}
      <Dialog 
        open={openForm} 
        onClose={handleCloseForm} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            margin: isMobile ? 1 : 2,
            width: isMobile ? 'calc(100% - 32px)' : 'auto',
            maxHeight: isMobile ? 'calc(100% - 32px)' : '80vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          color: 'white',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1 }}>
              {currentRecord ? '编辑维修记录' : '新建维修记录'}
            </Box>
            <Chip 
                label={`${currentPhaseDisplay} - ${currentShiftTypeDisplay}`} 
                color="default" 
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  fontWeight: 600
                }}
              />
          </Box>
        </DialogTitle>
        {/* 定义输入框样式配置 - 您可以在这里调整每个输入框的大小和样式 */}
        {(() => {
          // 这些是可自定义的样式配置，您可以根据需要修改
          const inputStyles = {
            serial_number: {  // 序号字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            month: {  // 月份字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            production_line: {  // 产线字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            process: {  // 工序字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            equipment_name: {  // 设备名称字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            equipment_number: {  // 设备编号字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            change_reason: {  // 变更原因字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            change_before: {  // 变更前字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            change_after: {  // 变更后字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            start_date_time: {  // 开始日期时间字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            end_date_time: {  // 结束日期时间字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            duration: {  // 耗用时长字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            implementer: {  // 实施人字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            verifier: {  // 确认人字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            accepter: {  // 验收人字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            parts_consumables: {  // 零件耗材字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
            remarks: {  // 备注字段
              width: '100%',           // 输入框宽度
              '& .MuiInputBase-input': {
                height: '40px',        // 输入框高度
                fontSize: '16px',      // 字体大小
                padding: '10px',       // 内边距
              },
              '& .MuiInputLabel-root': {
                fontSize: '16px',      // 标签字体大小
              }
            },
          };
          
          // 定义Grid尺寸配置 - 控制每个字段在网格中的占比
          const gridSizes = {
            // 默认是 xs: 12, sm: 6 (在小屏幕上占整行，大屏幕上占半行)
            // 您可以修改以下配置来改变字段布局
            serial_number: { xs: 12, sm: 6 },  // 序号字段 - 小屏幕占半行，大屏幕占1/4行
            month: { xs: 12, sm: 6 },          // 月份字段 - 小屏幕占半行，大屏幕占1/4行
            production_line: { xs: 12, sm: 6 }, // 产线字段 - 占半行
            process: { xs: 12, sm: 6 },        // 工序字段 - 占半行
            equipment_name: { xs: 12, sm: 6 }, // 设备名称字段 - 占整行 (您可以调整)
            equipment_number: { xs: 12, sm: 6 }, // 设备编号字段 - 占半行
            change_reason: { xs: 12, sm: 6 },  // 变更原因字段 - 占半行
            change_before: { xs: 12, sm: 12 },  // 变更前字段 - 占整行 (您可以调整)
            change_after: { xs: 12, sm: 12 },   // 变更后字段 - 占整行 (您可以调整)
            start_date_time: { xs: 12, sm: 6 }, // 开始时间字段 - 占半行
            end_date_time: { xs: 12, sm: 6 },   // 结束时间字段 - 占半行
            duration: { xs: 12, sm: 6 },       // 耗用时长字段 - 占半行
            implementer: { xs: 12, sm: 12 },    // 实施人字段 - 占整行 (您可以调整)
            verifier: { xs: 12, sm: 6 },       // 确认人字段 - 占半行
            accepter: { xs: 12, sm: 6 },       // 验收人字段 - 占半行
            parts_consumables: { xs: 12, sm: 12 }, // 零件耗材字段 - 占整行 (您可以调整)
            remarks: { xs: 12, sm: 12 },       // 备注字段 - 占整行
          };
          
          // 返回一个函数用于获取特定字段的样式
          window.getInputStyle = (fieldName) => {
            const style = inputStyles[fieldName] || {};
            // 分离width属性和其他样式
            const { width, ...otherStyles } = style;
            return { 
              width: width || '100%',  // 默认宽度为100%
              ...otherStyles 
            };
          };
          
          // 返回一个函数用于获取特定字段的Grid尺寸
          window.getGridSize = (fieldName) => {
            return gridSizes[fieldName] || { xs: 12, sm: 6 }; // 默认尺寸
          };
          
          return null;
        })()}
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
          <form onSubmit={handleSubmit}>
            <DialogContent dividers sx={{ p: isMobile ? 1 : 3 }}>
              <Grid container spacing={isMobile ? 1.5 : 2}>
                {/* 显示只读的序号和月份字段 */}
                <Grid size={window.getGridSize ? window.getGridSize('serial_number') : { xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="序号"
                    value={formData.serial_number || "系统自动生成"}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    sx={window.getInputStyle ? window.getInputStyle('serial_number') : {}}
                    InputProps={{
                      readOnly: true,
                    }}
                    disabled={!!currentRecord} // 编辑时也禁用
                  />
                </Grid>
                <Grid size={window.getGridSize ? window.getGridSize('month') : { xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="月份"
                    value={formData.month || new Date().getMonth() + 1 + "月"}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    sx={window.getInputStyle ? window.getInputStyle('month') : {}}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                {getFormFieldsConfig().map((field) => (
                  <Grid size={window.getGridSize ? window.getGridSize(field.key) : { xs: 12, sm: 6 }} key={field.key}>
                    {field.key === 'start_date_time' || field.key === 'end_date_time' ? (
                      <DateTimePicker
                        label={field.label}
                        value={formData[field.key] ? new Date(formData[field.key]) : null}
                        onChange={(newValue) => handleDateTimeChange(field.key, newValue)}
                        ampm={false}  // 使用24小时制
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: field.required,
                            size: isMobile ? "small" : "medium",
                            sx: window.getInputStyle ? window.getInputStyle(field.key) : {}
                          }
                        }}
                      />
                    ) : field.key === 'production_line' ? (
                      <Autocomplete
                        options={configData.productionLines ? 
                          configData.productionLines
                            .filter(line => 
                              // 根据当前的分期来过滤产线
                              // effectivePhase 是 'phase_1' 或 'phase_2'，而配置数据中的 phase_code 也是相同的格式
                              (effectivePhase === 'phase_1' && line.phase_code === 'phase_1') ||
                              (effectivePhase === 'phase_2' && line.phase_code === 'phase_2') ||
                              effectivePhase === 'both' // 如果是both则显示所有
                            )
                            .map(line => line.name) 
                          : []} // 使用配置数据中的名称
                        value={formData[field.key] || ''}
                        onChange={(event, newValue) => handleInputChange({ target: { name: field.key, value: newValue || '' } })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={field.label}
                            name={field.key}
                            required={field.required}
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            sx={window.getInputStyle ? window.getInputStyle(field.key) : {}}
                          />
                        )}
                      />
                    ) : field.key === 'process' ? (
                      <Autocomplete
                        options={configData.processes ? configData.processes.map(proc => proc.name) : []} // 使用配置数据中的工序名称
                        value={formData[field.key] || ''}
                        onChange={(event, newValue) => handleInputChange({ target: { name: field.key, value: newValue || '' } })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={field.label}
                            name={field.key}
                            required={field.required}
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            sx={window.getInputStyle ? window.getInputStyle(field.key) : {}}
                          />
                        )}
                      />
                    ) : field.key === 'equipment_name' ? (
                      <Autocomplete
                        options={assets ? 
                          assets
                            .filter(asset => 
                              // 根据当前分期、产线和工序来过滤设备
                              // asset.phase, asset.production_line, asset.process 是ID
                              // formData中可能是ID或名称，需要支持两种匹配方式
                              ((effectivePhase === 'phase_1' && asset.phase === 1) ||  // 一期ID是1
                              (effectivePhase === 'phase_2' && asset.phase === 2) ||  // 二期ID是2
                              effectivePhase === 'both') &&
                              // 如果用户已经选择了产线，则过滤；否则不限制
                              // formData.production_line 是配置中的名称，asset.production_line 是资产表中的ID
                              // 需要通过configData建立名称到ID的映射
                              (formData.production_line && String(formData.production_line).trim() !== '' && String(formData.production_line).trim() !== 'null' && String(formData.production_line).trim() !== 'undefined' ? 
                                // 尝试将名称映射到ID进行匹配
                                // 现在configData中的productionLines格式是{id: 10, code: "1#", name: "1#", phase_code: "phase_1", description: "..."}
                                // 可以直接使用ID进行匹配
                                (() => {
                                  // 查找配置数据中匹配名称的产线，获取其ID进行匹配
                                  const matchedLine = configData.productionLines?.find(line => 
                                    line.name === formData.production_line || line.code === formData.production_line
                                  );
                                  return matchedLine ? asset.production_line === matchedLine.id : false;
                                })() ||
                                // 后备：直接匹配（如果formData中意外包含了ID）
                                asset.production_line === parseInt(formData.production_line) ||
                                String(asset.production_line) === String(formData.production_line)
                              : true) &&
                              // 如果用户已经选择了工序，则过滤；否则不限制
                              // formData.process 是配置中的名称，asset.process 是资产表中的ID
                              (formData.process && String(formData.process).trim() !== '' && String(formData.process).trim() !== 'null' && String(formData.process).trim() !== 'undefined' ? 
                                // 尝试将名称映射到ID进行匹配
                                (() => {
                                  // 查找配置数据中匹配名称的工序，获取其ID进行匹配
                                  const matchedProcess = configData.processes?.find(proc => 
                                    proc.name === formData.process || proc.code === formData.process
                                  );
                                  return matchedProcess ? asset.process === matchedProcess.id : false;
                                })() ||
                                // 后备：直接匹配（如果formData中意外包含了ID）
                                asset.process === parseInt(formData.process) ||
                                String(asset.process) === String(formData.process)
                              : true)
                            )
                            .map(asset => asset.name)
                            .filter((name, index, self) => name && self.indexOf(name) === index) 
                          : []} // 去重并过滤空值
                        value={formData[field.key] || ''}
                        onChange={(event, newValue) => handleInputChange({ target: { name: field.key, value: newValue || '' } })}
                        onInputChange={(event, newInputValue) => handleInputChange({ target: { name: field.key, value: newInputValue || '' } })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={field.label}
                            name={field.key}
                            required={field.required}
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            sx={window.getInputStyle ? window.getInputStyle(field.key) : {}}
                          />
                        )}
                      />
                    ) : field.key === 'equipment_number' ? (
                      <Autocomplete
                        options={assets ? 
                          assets
                            .filter(asset => 
                              // 根据当前分期、产线和工序来过滤设备编号
                              // asset.phase, asset.production_line, asset.process 是ID
                              // formData中可能是ID或名称，需要支持两种匹配方式
                              ((effectivePhase === 'phase_1' && asset.phase === 1) ||  // 一期ID是1
                              (effectivePhase === 'phase_2' && asset.phase === 2) ||  // 二期ID是2
                              effectivePhase === 'both') &&
                              // 如果用户已经选择了产线，则过滤；否则不限制
                              // formData.production_line 是配置中的名称，asset.production_line 是资产表中的ID
                              // 需要通过configData建立名称到ID的映射
                              (formData.production_line && String(formData.production_line).trim() !== '' && String(formData.production_line).trim() !== 'null' && String(formData.production_line).trim() !== 'undefined' ? 
                                // 尝试将名称映射到ID进行匹配
                                (() => {
                                  // 查找配置数据中匹配名称的产线，获取其ID
                                  const matchedLine = configData.productionLines?.find(line => 
                                    line.name === formData.production_line || line.code === formData.production_line
                                  );
                                  return matchedLine ? asset.production_line === matchedLine.id || 
                                               asset.production_line === parseInt(matchedLine.id) : false;
                                })() || 
                                // 后备：直接匹配（如果formData中意外包含了ID）
                                asset.production_line === parseInt(formData.production_line) ||
                                String(asset.production_line) === String(formData.production_line)
                              : true) &&
                              // 如果用户已经选择了工序，则过滤；否则不限制
                              // formData.process 是配置中的名称，asset.process 是资产表中的ID
                              (formData.process && String(formData.process).trim() !== '' && String(formData.process).trim() !== 'null' && String(formData.process).trim() !== 'undefined' ? 
                                // 尝试将名称映射到ID进行匹配
                                (() => {
                                  // 查找配置数据中匹配名称的工序，获取其ID
                                  const matchedProcess = configData.processes?.find(proc => 
                                    proc.name === formData.process || proc.code === formData.process
                                  );
                                  return matchedProcess ? asset.process === matchedProcess.id || 
                                                asset.process === parseInt(matchedProcess.id) : false;
                                })() || 
                                // 后备：直接匹配（如果formData中意外包含了ID）
                                asset.process === parseInt(formData.process) ||
                                String(asset.process) === String(formData.process)
                              : true)
                            )
                            .map(asset => asset.ref)
                            .filter((number, index, self) => number && self.indexOf(number) === index) 
                          : []} // 去重并过滤空值
                        value={formData[field.key] || ''}
                        onChange={(event, newValue) => handleInputChange({ target: { name: field.key, value: newValue || '' } })}
                        onInputChange={(event, newInputValue) => handleInputChange({ target: { name: field.key, value: newInputValue || '' } })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={field.label}
                            name={field.key}
                            required={field.required}
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            sx={window.getInputStyle ? window.getInputStyle(field.key) : {}}
                          />
                        )}
                      />
                    ) : field.key === 'implementer' ? (
                      <Autocomplete
                        multiple
                        options={implementersOptions}
                        value={selectedImplementers}
                        onChange={(event, newValue) => {
                          handleImplementersChange(newValue);
                          handleMultiSelectChange(field.key, newValue);
                        }}
                        renderOption={(props, option) => {
                          const { key, ...optionProps } = props;
                          return <li key={key} {...optionProps}>{option}</li>;
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={field.label}
                            name={field.key}
                            required={field.key !== 'implementer'} // 实施人字段不使用HTML required，使用JS验证
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            helperText="第一个实施人必须是当前用户"
                            sx={window.getInputStyle ? window.getInputStyle(field.key) : {}}
                          />
                        )}
                      />
                    ) : field.key === 'change_reason' ? (
                      <TextField
                        select
                        fullWidth
                        label={field.label}
                        name={field.key}
                        value={formData[field.key] || ''}
                        onChange={handleInputChange}
                        required={field.required}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        sx={window.getInputStyle ? window.getInputStyle(field.key) : {}}
                      >
                        <MenuItem value="maintenance">维保</MenuItem>
                        <MenuItem value="repair">维修</MenuItem>
                        <MenuItem value="technical_modification">技改</MenuItem>
                      </TextField>
                    ) : field.key === 'duration' ? (
                      <TextField
                        fullWidth
                        label={field.label}
                        name={field.key}
                        value={formData[field.key] || ''}
                        onChange={handleInputChange}
                        required={field.required}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        sx={window.getInputStyle ? window.getInputStyle(field.key) : {}}
                        InputProps={{
                          readOnly: true, // 设置为只读，因为自动计算
                        }}
                        helperText="自动计算：(结束时间 - 开始时间) / 60分钟"
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label={field.label}
                        name={field.key}
                        value={formData[field.key] || ''}
                        onChange={handleInputChange}
                        required={field.required}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        sx={window.getInputStyle ? window.getInputStyle(field.key) : {}}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: isMobile ? 1.5 : 2, gap: 1 }}>
              <ActionButton 
                onClick={handleCloseForm} 
                variant="outlined"
                color="secondary"
                sx={{ minWidth: isMobile ? '100px' : '120px' }}
              >
                取消
              </ActionButton>
              <ActionButton 
                type="submit" 
                variant="contained" 
                color="primary"
                sx={{ minWidth: isMobile ? '100px' : '120px' }}
              >
                {currentRecord ? '更新' : '创建'}
              </ActionButton>
            </DialogActions>
          </form>
        </LocalizationProvider>
      </Dialog>

      {/* 通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 下载记录对话框 */}
      <Dialog 
        open={openDownloadDialog} 
        onClose={() => setOpenDownloadDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>下载维修记录 ({currentPhaseDisplay} - {currentShiftTypeDisplay})</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Box p={2} border={1} borderColor="grey.300" borderRadius={1} bgcolor="lightblue">
                <Typography variant="body2" align="center">
                  期数: {effectivePhase === 'phase_1' ? '一期' : '二期'}
                </Typography>
              </Box>
            </Grid>
            <Grid size={12}>
              <Box p={2} border={1} borderColor="grey.300" borderRadius={1} bgcolor="lightblue">
                <Typography variant="body2" align="center">
                  班次类型: {effectiveShiftType === 'long_day_shift' ? '长白班' : '倒班'}
                </Typography>
              </Box>
            </Grid>
            <Grid size={12}>
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
            </Grid>
            <Grid size={12}>
              <Alert severity="info" sx={{ mt: 1 }}>
                导出记录将使用当前页面的期数和班次设置
                {selectedMonth !== 'all' && `，并仅包含${selectedMonth.substring(0, 4)}年${parseInt(selectedMonth.substring(5, 7))}月的数据`}
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <ActionButton 
            onClick={() => setOpenDownloadDialog(false)} 
            variant="outlined"
            color="secondary"
          >
            取消
          </ActionButton>
          <ActionButton 
            onClick={handleDownloadRecords} 
            variant="contained" 
            color="primary"
          >
            确认下载
          </ActionButton>
        </DialogActions>
      </Dialog>
      
      {/* 维修率统计对话框 */}
      <MaintenanceRateStatsDialog
        open={openStatsDialog}
        onClose={() => setOpenStatsDialog(false)}
        phaseId={urlPhase}  // 传递当前页面的期别
      />
    </Container>
  );
};

export default PhaseShiftMaintenanceRecords;