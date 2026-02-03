# 项目部署和运行脚本

## 后端脚本

### 依赖安装脚本
- `backend\install_deps.bat` - Windows 批处理安装脚本
- `backend\install_deps.ps1` - PowerShell 安装脚本

### 运行脚本
- `backend\run_backend.py` - 后端运行脚本

### 依赖文件
- `backend\requirements.txt` - 原始依赖文件（已更新）
- `backend\requirements_minimal_final.txt` - 最小化依赖文件（推荐用于Windows）

## 前端脚本

### 依赖安装脚本
- `frontend\install_deps.bat` - Windows 批处理安装脚本
- `frontend\install_deps.ps1` - PowerShell 安装脚本

### 运行脚本
- `frontend\run_frontend.bat` - 前端运行脚本
- `frontend\run_frontend.ps1` - PowerShell 前端运行脚本

## 配置文件

- `backend\settings_local.py` - 适用于本地开发的Django设置
- `RUNNING_GUIDE.md` - 项目运行指南

## 使用说明

### 安装依赖
1. 后端：
   ```
   cd backend
   pip install -r requirements_minimal_final.txt
   ```

2. 前端：
   ```
   cd frontend
   npm install
   ```

### 运行应用
1. 后端：
   ```
   cd backend
   python run_backend.py
   ```

2. 前端：
   ```
   cd frontend
   npm start
   ```