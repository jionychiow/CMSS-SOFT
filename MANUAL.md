# 生产维修资料系统使用手册

## 系统概述
本系统是一个专业的生产维修资料管理系统，专为工厂维修记录管理设计，支持工厂分期和班次管理。

## 核心功能

### 1. 用户权限管理
- **工厂分期**: 一期、二期
- **班次类型**: 长白班、倒班
- **权限控制**: 
  - 增加权限：可创建新记录
  - 编辑权限：可修改已有记录
  - 删除权限：可删除记录
- **权限隔离**: 用户只能查看和操作与自己班次和工厂分期匹配的记录

### 2. 维修记录管理
- **记录字段**:
  - 序号、月份、产线、工序
  - 设备名称、编号、零部件/部位
  - 变更原因、变更前后状态
  - 开始/结束时间、耗用时长
  - 零件耗材、实施人、确认人、验收人、评价人
  - 备注

### 3. 设备维修资料库
- **设备信息**: 设备名称、部件
- **维修步骤**: 详细维修流程
- **参数管理**: 设备参数配置
- **多媒体支持**: 图片和视频资料

### 4. Excel导入功能
- 支持从Excel文件导入维修记录
- 自动识别表头（在第3行）
- 智能数据清洗和验证

## API端点

### 维修记录
- `GET /api/maintenance/maintenance-records/` - 获取维修记录列表
- `POST /api/maintenance/maintenance-records/` - 创建维修记录
- `PUT /api/maintenance/maintenance-records/{id}/` - 更新维修记录
- `DELETE /api/maintenance/maintenance-records/{id}/` - 删除维修记录

### 设备资料库
- `GET /api/maintenance/equipment-library/` - 获取设备资料库列表
- `POST /api/maintenance/equipment-library/` - 创建设备资料
- `PUT /api/maintenance/equipment-library/{id}/` - 更新设备资料
- `DELETE /api/maintenance/equipment-library/{id}/` - 删除设备资料

### 系统功能
- `GET /api/maintenance/user-permissions/` - 获取用户权限信息
- `GET /api/maintenance/statistics/` - 获取维修统计信息

## Excel导入命令

```bash
# 导入倒班记录
python manage.py import_excel --file "../生产一分部倒班交接班记录表.xlsx" --shift-type rotating_shift --plant-phase phase_1

# 导入长白班记录
python manage.py import_excel --file "../生产一分部长白班交接班记录表.xlsx" --shift-type long_day_shift --plant-phase phase_1
```

## 前端配置

前端API地址配置在 `frontend/src/Config.js`:
```javascript
export const url = process.env.REACT_APP_API_URL || 'http://localhost:8001';
export const wsurl = process.env.REACT_APP_WS_URL || 'ws://localhost:8001';
```

## 数据验证规则

- **用户名**: 必须是汉字
- **人员字段**: 实施人、确认人、验收人、评价人姓名必须是汉字
- **权限控制**: 用户只能操作与自己班次和工厂分期匹配的数据

## 系统特点

1. **权限隔离**: 不同班次和工厂分期的数据完全隔离
2. **数据安全**: 严格的权限控制和数据验证
3. **Excel集成**: 无缝导入现有Excel数据
4. **实时显示**: 维修记录实时更新显示
5. **统计分析**: 提供维修统计和分布图
6. **扩展性强**: 支持多媒体资料和详细参数管理

## 部署说明

1. 安装依赖: `pip install -r requirements.txt`
2. 运行迁移: `python manage.py migrate`
3. 启动后端: `python manage.py runserver 0.0.0.0:8001`
4. 启动前端: `cd frontend && npm start`

系统已完全按照您的需求开发完成，支持工厂分期、班次管理、权限控制、Excel导入、设备资料库等所有功能。