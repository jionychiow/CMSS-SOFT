# CMMS-OEE Software

## 项目概述
这是一个CMMS（计算机化维护管理系统）和OEE（整体设备效率）软件系统，包含前端React应用和后端Django API服务。

## 技术栈
- 前端: React 19, Material-UI, @mdi/react
- 后端: Django 5.1, Django REST Framework, Channels
- 数据库: MySQL (默认), SQLite (回退选项)
- 依赖管理: pip (Python), npm (JavaScript)

## 部署指南

### 系统要求
- Node.js >= 18.x
- Python >= 3.9
- pip (Python包管理器)

### 手动安装步骤

#### 1. 克隆项目
```bash
git clone <your-repo-url>
cd CMMS-OEE-Software
```

#### 2. 安装系统依赖

##### Linux (Debian/Ubuntu):
```bash
sudo apt update
sudo apt install curl git python3 python3-pip python3-venv python3-dev build-essential libssl-dev libffi-dev nodejs npm

# 如果Node.js版本过低，使用nvm安装较新版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

##### macOS:
```bash
# 使用Homebrew安装依赖
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install python node

# 如果Node.js版本过低，使用nvm安装较新版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

##### Windows:
下载并安装:
- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/en/download/)

确保在安装时勾选 "Add to PATH" 选项。

#### 3. 安装后端依赖
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# 或
# venv\Scripts\activate  # Windows
pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
```

#### 4. 安装前端依赖
```bash
cd ../frontend
npm install
```

#### 5. 配置环境变量（可选）
```bash
# 在frontend目录下创建.env文件
cd ../frontend
cat > .env << EOF
REACT_APP_API_URL=http://localhost:8001
PORT=8000
GENERATE_SOURCEMAP=false
EOF
```

#### 6. 启动服务
分别在两个终端中运行：

终端1（后端）：
```bash
cd backend && source venv/bin/activate && python manage.py runserver 8001  # Linux/macOS
# 或
# cd backend && venv\Scripts\activate && python manage.py runserver 8001  # Windows
```

终端2（前端）：
```bash
cd frontend && npm start
```

## 手动部署说明

### Linux/macOS 部署

项目需要手动安装依赖和启动服务：

#### 1. 安装后端依赖
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# 或
# venv\Scripts\activate  # Windows
pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
```

#### 2. 安装前端依赖
```bash
cd ../frontend
npm install
```

#### 3. 启动后端服务
```bash
cd ../backend
source venv/bin/activate
python manage.py runserver 8001
```

#### 4. 启动前端服务
```bash
cd ../frontend
npm start
```

### Debian 12+ 系统部署（由于PEP 668限制）

对于Debian 12+系统，由于PEP 668限制，安装依赖时需要使用`--break-system-packages`标志：

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --break-system-packages --upgrade pip
pip install --break-system-packages -r requirements.txt
python manage.py migrate
```

### Windows 部署

在Windows上部署：

#### 1. 安装后端依赖
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
```

#### 2. 安装前端依赖
```cmd
cd ../frontend
npm install
```

#### 3. 启动后端服务
```cmd
cd ../backend
venv\Scripts\activate
python manage.py runserver 8001
```

#### 4. 启动前端服务
```cmd
cd ../frontend
npm start
```

## 环境变量配置

### 前端环境变量
前端环境变量配置文件路径: `frontend/.env`
```
REACT_APP_API_URL=http://localhost:8001
PORT=8000
GENERATE_SOURCEMAP=false
```

### 后端环境变量
后端环境变量配置文件路径: `backend/.env` 或系统环境变量
```
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=*
```

## 数据库配置

数据库配置文件路径: `backend/backend/settings.py`
- 默认数据库: SQLite (`db.sqlite3`)
- 如需修改为其他数据库（如PostgreSQL, MySQL），请编辑settings.py中的DATABASES配置

## 端口配置

### 前端端口
- 默认端口: 8000
- 修改文件: `frontend/.env` 中的 `PORT` 变量

### 后端端口
- 默认端口: 8001
- 修改文件: 启动后端时指定端口参数
- 也可以在 `backend/backend/settings.py` 中配置相关设置

## 访问应用

- 前端: http://localhost:8000
- 后端API: http://localhost:8001
- Django Admin: http://localhost:8001/admin/

## 依赖安装

有关详细的依赖安装说明，请参阅：
- [INSTALLATION.md](./INSTALLATION.md) - 依赖安装说明，包含所有依赖项的详细安装指南

## 服务器部署配置

对于服务器部署，需要配置正确的IP地址以便前后端通信：

1. 修改 `frontend/.env` 文件中的 `REACT_APP_API_URL` 为服务器的实际IP地址和端口

2. 修改后端启动命令中的主机地址为 `0.0.0.0` 以允许外部访问

### 在服务器上部署后端
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8001
```

### 在服务器上部署前端
```bash
cd frontend
npm install
# 修改 .env 文件中的 REACT_APP_API_URL=http://[服务器IP]:8001
npm start
```

### 使用Gunicorn部署生产环境后端
```bash
cd backend
source venv/bin/activate
pip install gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8001 --workers 4
```

注意：前端和后端是独立的应用程序，可以分别部署和启动。

## Debian服务器部署

有关完整的Debian服务器部署指南，请参阅：
- [DEBIAN_DEPLOYMENT.md](./DEBIAN_DEPLOYMENT.md) - Debian服务器部署完整指南

## 故障排除

如果遇到部署或运行问题，请参阅详细的故障排除指南：
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 部署和故障排除指南，包含所有脚本说明和常见问题解决方案