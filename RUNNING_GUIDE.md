# CMMS-OEE-Software 项目运行指南

## 项目结构
- `backend/` - 后端 Django 应用
- `frontend/` - 前端 React 应用

## 快速开始

### 后端 (Django)

#### 安装后端依赖
```bash
# 在 backend 目录下运行
pip install -r requirements_minimal_final.txt
```

#### 运行后端
```bash
# 在 backend 目录下运行
python run_backend.py
```

### 前端 (React)

#### 安装前端依赖
```bash
# 在 frontend 目录下运行
npm install
```

#### 运行前端
```bash
# 在 frontend 目录下运行
npm start
```

## 自动化脚本

### Windows 批处理脚本

#### 后端
- `backend\run_backend.py` - 启动后端服务器
- `backend\install_deps.bat` - 安装后端依赖
- `backend\install_deps.ps1` - PowerShell 版本的后端依赖安装

#### 前端
- `frontend\run_frontend.bat` - 启动前端开发服务器
- `frontend\install_deps.bat` - 安装前端依赖
- `frontend\install_deps.ps1` - PowerShell 版本的前端依赖安装

## 配置说明

### 数据库
项目默认使用 SQLite 数据库，无需额外配置。

### 环境变量
如果需要自定义配置，可以在项目根目录创建 `.env` 文件：
```
DEBUG=True
SECRET_KEY=your-secret-key-here
HOST_NAME=localhost
```

环境变量说明：
- `DJANGO_ENV`: 设置为 `production` 以允许所有主机访问并启用生产设置，或设置为其他值以保持开发模式的主机限制
- `DEBUG`: 设置为 `True` 启用调试模式
- `HOST_NAME`: 自定义主机名
- `ADDITIONAL_ALLOWED_HOSTS`: 附加允许的主机列表（逗号分隔）

## 生产环境部署

要部署到生产环境，请按以下步骤操作：

1. 设置环境变量：
```bash
export DJANGO_ENV=production
```

2. 在生产环境中，应用将：
   - 允许所有主机访问（`ALLOWED_HOSTS = ['*']`）
   - 使用SQLite数据库（简化部署）
   - 关闭调试模式（`DEBUG = False`）
   - 绑定到0.0.0.0:8001以接受外部连接

3. 运行应用：
```bash
cd backend
python run_backend.py
```

## 认证和用户管理

- 默认管理员用户：`admin`
- 默认密码：`admin123`（请在生产环境中更改）
- 认证端点：`/api/api-token-auth/`
- 令牌有效期：5天（可配置）

## 部署
前端构建命令：
```bash
cd frontend
npm run build
```

后端部署前需要收集静态文件：
```bash
cd backend
python manage.py collectstatic --no-input
```