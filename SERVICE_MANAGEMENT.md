# Linux服务管理脚本

此目录包含用于在Linux环境中管理CMMS-OEE-Software前后端服务的脚本。

## 脚本说明

### start_services.sh
启动前后端服务的脚本

**功能：**
- 启动后端Django服务器（监听8001端口）
- 启动前端React开发服务器（监听8000端口）
- 将日志输出到相应的日志文件

**使用方法：**
```bash
chmod +x start_services.sh
./start_services.sh
```

### stop_services.sh
停止前后端服务的脚本

**功能：**
- 查找并终止后端Django进程
- 查找并终止前端React开发服务器进程
- 查找并终止相关的Node.js和npm进程
- 检查并终止占用8000和8001端口的进程

**使用方法：**
```bash
chmod +x stop_services.sh
./stop_services.sh
```

### enhanced_stop_services.sh
增强版停止服务脚本，包含额外功能

**功能：**
- 包含stop_services.sh的所有功能
- 支持终止screen会话（如cmss-f）
- 使用更安全的终止信号（TERM）后再使用强制终止（KILL）
- 提供更详细的进程终止状态报告
- 更可靠地终止所有相关服务

**使用方法：**
```bash
chmod +x enhanced_stop_services.sh
./enhanced_stop_services.sh
```

## 注意事项

1. 确保在运行脚本前已安装必要的依赖：
   - Python 3.x 和相关Django依赖
   - Node.js 和 npm
   - React项目依赖（在frontend目录下运行 `npm install`）

2. 如果没有安装lsof命令，端口检查功能将被跳过，但这不会影响脚本的主要功能。

3. 脚本会尝试终止所有相关的服务进程，但在某些情况下可能需要手动检查是否有残留进程。

4. 日志文件将在backend/目录下生成：
   - backend.log - 后端服务日志
   - frontend.log - 前端服务日志

## Screen会话管理

如果你的服务是在screen会话中运行的，可以使用以下命令：

**启动服务到screen会话：**
```bash
screen -dmS cmss-f bash -c "cd ~/CMMS-OEE-Software/backend && python manage.py runserver 0.0.0.0:8001"
```

**连接到screen会话：**
```bash
screen -r cmss-f
```

**分离screen会话（在会话内部使用Ctrl+A然后按D）**

**列出所有screen会话：**
```bash
screen -ls
```

## 故障排除

如果服务无法正常停止，可以尝试：

1. 手动终止相关进程：
   ```bash
   pkill -f "python.*manage.py runserver"
   pkill -f "react-scripts start"
   pkill -f "npm start"
   ```

2. 检查端口占用情况：
   ```bash
   lsof -i:8000
   lsof -i:8001
   ```

3. 强制终止占用端口的进程：
   ```bash
   fuser -k 8000/tcp
   fuser -k 8001/tcp
   ```