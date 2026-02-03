# 依赖安装说明

本文档详细说明了如何正确安装CMMS-OEE软件的所有依赖项。

## 后端依赖

### requirements.txt 文件说明
- **位置**: `backend/requirements.txt`
- **主要依赖**:
  - Django 5.1 - Web框架
  - Django REST Framework - API开发
  - Channels - WebSocket支持
  - mysqlclient - MySQL数据库驱动
  - pandas - 数据处理库
  - gunicorn - WSGI服务器
  - 其他辅助库

### 安装后端依赖
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# 或
# venv\Scripts\activate  # Windows

pip install --upgrade pip
pip install -r requirements.txt
```

## 前端依赖

### package.json 文件说明
- **位置**: `frontend/package.json`
- **主要依赖**:
  - React 19 - 前端框架
  - Material-UI 7.1 - UI组件库
  - @mdi/react - Material Design Icons
  - react-router-dom - 路由管理
  - axios - HTTP客户端
  - 其他辅助库

### 安装前端依赖
```bash
cd frontend
npm install
```

## 特殊依赖说明

### @mdi/react 和 @mdi/js
- 用于在React组件中使用Material Design Icons
- 已添加到package.json中

### pandas
- 用于数据处理和分析
- 已添加到requirements.txt中

### MySQL支持
- 主要数据库引擎
- 需要安装mysqlclient依赖

## 环境兼容性

### Python 3.13兼容性
- 使用cython==3.0.11以确保兼容性
- httptools等库可能需要特殊处理

### Node.js兼容性
- 推荐使用Node.js 18+
- 使用react-scripts 5.0.1以避免React 19兼容性问题

## 常见安装问题

### 1. Debian/Ubuntu PEP 668问题
```bash
pip install --break-system-packages -r requirements.txt
```

### 2. 前端依赖冲突
```bash
npm install --legacy-peer-deps
```

### 3. 编译依赖问题
在某些系统上可能需要安装编译工具：
```bash
# Ubuntu/Debian
sudo apt install build-essential libssl-dev libffi-dev python3-dev

# CentOS/RHEL
sudo yum install gcc openssl-devel libffi-devel python3-devel
```

## 一键安装脚本

项目提供了多个一键安装脚本：
- `install-dependencies.sh` - Linux/macOS标准安装
- `install-dependencies-debian.sh` - Debian兼容安装
- `install-dependencies-debian-optimized.sh` - Debian优化安装（Python 3.13兼容）

## 验证安装

### 验证后端依赖
```bash
cd backend
source venv/bin/activate
python -c "import django, rest_framework, pandas; print('Backend dependencies OK')"
```

### 验证前端依赖
```bash
cd frontend
npm list react @mui/material @mdi/react
```