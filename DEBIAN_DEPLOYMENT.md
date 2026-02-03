# Debian服务器部署指南

本指南详细介绍如何在Debian服务器上部署CMMS-OEE应用。

## 准备工作

### 1. 系统更新
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. 安装系统依赖
```bash
# 安装基础工具
sudo apt install curl git python3 python3-pip python3-venv python3-dev build-essential libssl-dev libffi-dev nodejs npm -y

# 对于Debian 12+，还需安装
sudo apt install python3-full -y
```

### 3. 安装Node.js（如果版本过低）
```bash
# 使用nvm安装较新版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

## 部署步骤

### 1. 克隆代码仓库
```bash
git clone <your-repo-url>
cd CMMS-OEE-Software
```

### 2. 安装后端依赖
```bash
cd backend
python3 -m venv venv
source venv/bin/activate

# 对于Debian 12+，由于PEP 668限制，需要使用--break-system-packages
pip install --break-system-packages --upgrade pip
pip install --break-system-packages -r requirements.txt

# 运行数据库迁移
python manage.py migrate
python manage.py collectstatic --noinput
cd ..
```

### 3. 安装前端依赖
```bash
cd frontend
npm install
cd ..
```

### 4. 配置环境变量

修改前端环境变量以匹配服务器IP：
```bash
# 编辑 frontend/.env 文件
nano frontend/.env

# 将 REACT_APP_API_URL 改为服务器IP
REACT_APP_API_URL=http://[服务器IP]:8001
```

### 5. 启动服务

#### 方法1：手动启动
```bash
# 启动后端（在后台运行）
cd backend
source venv/bin/activate
nohup python manage.py runserver 0.0.0.0:8001 > backend.log 2>&1 &

# 启动前端（在另一个终端）
cd frontend
npm start
```

#### 方法2：使用Gunicorn（推荐用于生产环境）
```bash
# 安装Gunicorn
cd backend
source venv/bin/activate
pip install gunicorn

# 启动后端服务
gunicorn backend.wsgi:application --bind 0.0.0.0:8001 --workers 4 --daemon
```

#### 方法3：使用systemd服务（推荐用于生产环境）

创建后端服务文件：
```bash
sudo tee /etc/systemd/system/cmms-backend.service << EOF
[Unit]
Description=CMMS-OEE Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/CMMS-OEE-Software/backend
Environment=PATH=/home/$USER/CMMS-OEE-Software/backend/venv/bin
ExecStart=/home/$USER/CMMS-OEE-Software/backend/venv/bin/gunicorn backend.wsgi:application --bind 0.0.0.0:8001 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

创建前端服务文件：
```bash
sudo tee /etc/systemd/system/cmms-frontend.service << EOF
[Unit]
Description=CMMS-OEE Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/CMMS-OEE-Software/frontend
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable cmms-backend cmms-frontend
sudo systemctl start cmms-backend cmms-frontend
```

## 访问应用

- 前端: http://[服务器IP]:8000
- 后端API: http://[服务器IP]:8001
- Django Admin: http://[服务器IP]:8001/admin/

## 防火墙配置（如需要）

如果服务器有防火墙，需要开放相应端口：
```bash
sudo ufw allow 8000
sudo ufw allow 8001
sudo ufw reload
```

## 故障排除

### 1. 检查服务状态
```bash
# 检查后端服务
ps aux | grep python
ps aux | grep gunicorn

# 检查前端服务
ps aux | grep node
```

### 2. 查看日志
```bash
# 后端日志
cd backend
source venv/bin/activate
python manage.py shell  # 交互式检查

# 系统日志
journalctl -u cmms-backend -f
journalctl -u cmms-frontend -f
```

### 3. 测试API连接
```bash
curl http://[服务器IP]:8001/api/v1/status/
```

## 安全建议

1. 使用反向代理（如Nginx）来提供HTTPS支持
2. 配置适当的防火墙规则
3. 定期更新系统和依赖
4. 使用强密码和安全的认证机制
5. 定期备份数据库

## 性能优化

1. 配置负载均衡器
2. 使用CDN加速静态资源
3. 优化数据库查询
4. 配置缓存机制