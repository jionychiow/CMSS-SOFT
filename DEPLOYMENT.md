# CMMS-OEE 部署配置指南

## 环境准备

### Ubuntu/Debian 系统准备
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装Node.js (推荐使用nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 安装Python和相关工具
sudo apt install python3 python3-pip python3-venv build-essential libssl-dev libffi-dev -y

# 安装Git
sudo apt install git -y
```

### CentOS/RHEL/Fedora 系统准备
```bash
# 安装Node.js (推荐使用nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 安装Python和相关工具
sudo yum install python3 python3-pip python3-devel gcc openssl-devel libffi-devel -y

# 或对于较新版本的Fedora
sudo dnf install python3 python3-pip python3-devel gcc openssl-devel libffi-devel -y

# 安装Git
sudo yum install git -y
```

## 部署步骤

### 1. 克隆代码仓库
```bash
git clone <your-repo-url>
cd CMMS-OEE-Software
```

### 2. 配置后端
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 运行数据库迁移
python manage.py migrate

# 创建超级用户（可选）
python manage.py createsuperuser

# 收集静态文件（生产环境）
python manage.py collectstatic --noinput
```

### 3. 配置前端
```bash
cd ../frontend
npm install
```

## 生产环境部署建议

### 使用Gunicorn和Nginx部署后端

安装Gunicorn:
```bash
source backend/venv/bin/activate
pip install gunicorn
```

创建Gunicorn配置文件 `gunicorn_config.py`:
```python
bind = "127.0.0.1:8001"
workers = 3
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
preload_app = True
```

使用Gunicorn启动:
```bash
cd backend
source venv/bin/activate
gunicorn -c gunicorn_config.py backend.wsgi:application
```

### 使用Nginx反向代理配置示例

创建Nginx配置 `/etc/nginx/sites-available/cmms-oee`:
```
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用站点:
```bash
sudo ln -s /etc/nginx/sites-available/cmms-oee /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 环境变量配置

### 后端环境变量 (.env)
```
DEBUG=False
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=*
DB_PASSWORD=your-database-password-here  # 如果使用PostgreSQL/MySQL
```

配置文件路径: `backend/.env`

## Debian 12+ 特殊注意事项

### PEP 668 兼容性
Debian 12+ 实施了 PEP 668，限制了系统范围的包安装。所有 Python 包安装必须使用 `--break-system-packages` 标志。

### Python 3.13 兼容性
某些 Python 包可能与 Python 3.13 不完全兼容，特别是在 C 扩展编译方面。我们提供了优化的安装脚本：
- `install-dependencies-debian-optimized.sh` - 包含兼容性修复
- `start-backend-debian-optimized.sh` - 包含依赖问题修复

### 数据库配置
默认情况下，后端使用MySQL数据库。如果您没有安装MySQL或希望使用SQLite，请考虑以下选项：

1. 安装MySQL服务：
```bash
sudo apt install mysql-server mysql-client
sudo systemctl start mysql
sudo mysql_secure_installation
```

2. 或使用我们的数据库回退脚本：
- `start-backend-db-fallback.sh` - 自动检测数据库连接并回退到SQLite

3. 或手动修改数据库配置：
   - 文件路径: `backend/backend/settings.py`
   - 修改 `DATABASES` 配置以使用SQLite或其他数据库

### 编译依赖
如果遇到编译错误，请确保安装了以下编译工具：
```bash
sudo apt install build-essential libssl-dev libffi-dev python3-dev gcc g++
```

### 前端依赖冲突
在较新的Node.js环境中，可能会遇到React版本冲突。如果遇到此类问题，请使用：
- `start-frontend-debian-fix.sh` - 使用--legacy-peer-deps参数安装依赖
- `start-frontend-comprehensive-fix.sh` - 全面修复前端依赖和编译问题
- `start-frontend-final-fix.sh` - 解决React刷新运行时问题的最终修复
- `start-frontend-silent.sh` - 静默启动前端服务（无浏览器打开）
- `start-frontend-no-browser.sh` - 启动前端服务（无浏览器打开，保留日志）
- `start-frontend-react-fix.sh` - 启动前端服务（React刷新问题直接修复）
- `start-frontend-eslint-fix.sh` - 启动前端服务（ESLint和组件问题修复）
- `start-frontend-server-fix.sh` - 启动前端服务（服务器通信问题修复）
- `start-frontend-complete-fix.sh` - 启动前端服务（完整导入和ESLint修复）
- `start-frontend-ultimate-fix.sh` - 启动前端服务（终极修复版）
- `start-backend-server.sh` - 服务器部署专用后端启动脚本（监听所有接口）
- `start-backend-python313-fix.sh` - 后端启动脚本（Python 3.13兼容性修复）

### Node.js 版本兼容性
如果持续遇到前端依赖问题，可以考虑使用长期支持的Node.js版本（如Node.js 18 LTS）。

### 前端环境变量 (.env)
```
REACT_APP_API_URL=https://your-domain.com/api
PORT=8000
GENERATE_SOURCEMAP=false
```

配置文件路径: `frontend/.env`

## 数据库配置

### 默认配置
- 数据库类型: SQLite
- 数据库文件: `backend/db.sqlite3`
- 配置文件: `backend/backend/settings.py` (DATABASES部分)

### 更换数据库
如需更换为PostgreSQL或MySQL，请按以下步骤操作：

1. 修改 `backend/backend/settings.py` 中的DATABASES配置:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # 或 'django.db.backends.mysql'
        'NAME': 'your_database_name',
        'USER': 'your_database_user',
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': 'localhost',  # 或远程数据库地址
        'PORT': '5432',       # PostgreSQL默认端口
    }
}
```

2. 安装相应驱动:
```bash
pip install psycopg2-binary  # PostgreSQL
# 或
pip install mysqlclient      # MySQL
```

3. 在 `.env` 文件中添加数据库凭据

## 端口配置

### 服务端口
- 前端服务: 默认端口 8000 (可修改 `frontend/.env` 中的 PORT 变量)
- 后端API: 默认端口 8001 (可修改启动脚本中的 runserver 参数)
- 数据库: SQLite无需额外端口，PostgreSQL默认5432，MySQL默认3306

### 修改端口
- 前端端口: 修改 `frontend/.env` 文件中的 PORT 变量
- 后端端口: 修改以下任一文件中的端口号:
  - `start-backend.sh` 或 `start-backend.bat`
  - `backend/backend/settings.py`
  - `frontend/.env` 中的 REACT_APP_API_URL 变量

## 备份和恢复

### 备份数据库
```bash
cd backend
source venv/bin/activate
python manage.py dumpdata > backup_$(date +%Y%m%d_%H%M%S).json
```

### 恢复数据库
```bash
cd backend
source venv/bin/activate
python manage.py loaddata backup_file.json
```

## 监控和日志

### 日志位置
- 后端日志: `backend/logs/`
- 前端构建日志: `frontend/build/`
- 系统日志: `/var/log/`

### 性能监控
定期检查系统资源使用情况:
```bash
htop
df -h
free -m
```

## 依赖管理

### 依赖文件位置
- 后端依赖: `backend/requirements.txt`
- 前端依赖: `frontend/package.json`

### 依赖安装说明
有关详细的依赖安装说明，请参阅：
- [INSTALLATION.md](./INSTALLATION.md) - 依赖安装说明，包含所有依赖项的详细安装指南

### 服务器IP配置

在服务器部署时，需要确保前后端能够正确通信。运行配置脚本：

```bash
chmod +x configure-server-ip.sh
./configure-server-ip.sh
```

该脚本会：
- 自动检测服务器IP地址
- 更新前端的API URL配置
- 更新后端的允许主机设置
- 创建备份配置文件

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   sudo netstat -tulpn | grep :8000
   sudo netstat -tulpn | grep :8001
   ```

2. **权限问题**
   ```bash
   sudo chown -R $USER:$USER /path/to/project
   chmod +x *.sh
   ```

3. **依赖安装失败**
   ```bash
   # 清理npm缓存
   npm cache clean --force
   
   # 升级pip
   python -m pip install --upgrade pip
   ```

4. **完整的故障排除指南**
   有关更详细的故障排除说明，请参阅专门的故障排除文档，其中包含所有启动脚本的详细说明和常见问题解决方案：
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 详细的故障排除指南，包含所有脚本说明和常见问题解决方案

### 服务管理
使用systemd创建服务单元文件进行长期运行管理。