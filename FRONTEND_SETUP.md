# 前端 Node.js 依赖安装与运行指南

## 环境准备

### 检查 Node.js 版本
在开始之前，请确保您的系统已安装 Node.js：

```bash
node --version
npm --version
```

推荐使用 Node.js 18.x 或更高版本。

## 依赖安装

### 方法一：使用 npm 安装
进入前端目录并安装依赖：

```bash
cd frontend
npm install
```

### 方法二：使用 yarn 安装（如果已安装）
```bash
cd frontend
yarn install
```

### 安装过程中可能出现的问题及解决方案

1. **权限问题**：
   - Windows: 以管理员身份运行命令提示符或PowerShell
   - Linux/Mac: 使用 `sudo` 或配置 npm 全局目录

2. **网络问题**：
   - 更换 npm 镜像源：
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```

3. **依赖冲突问题**：
   当出现类似以下错误时：
   ```
   npm ERR! ERESOLVE could not resolve
   npm ERR! While resolving: react-sweetalert2@0.6.0
   npm ERR! Found: react@19.2.3
   npm ERR! node_modules/react
   npm ERR!   react@"^19.0.0" from the root project
   npm ERR!   peer react@"^18.2.0" from react-sweetalert2@0.6.0
   ```
   
   解决方案：
   ```bash
   # 方案1: 使用 --legacy-peer-deps 参数跳过对等依赖检查
   npm install --legacy-peer-deps
   
   # 方案2: 使用 --force 参数强制安装
   npm install --force
   
   # 方案3: 先删除 node_modules 和 package-lock.json 再安装
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

4. **清理缓存**：
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

## 运行命令

### 开发模式运行
```bash
cd frontend
npm start
```
此命令将在开发模式下启动应用，默认访问地址为 `http://localhost:3000`

### 构建生产版本
```bash
cd frontend
npm run build
```
此命令将生成用于生产的优化构建文件，输出到 `build` 目录

### 其他常用命令
```bash
# 运行测试
npm test

# 运行 ESLint 检查
npm run lint

# 运行格式化
npm run format
```

## 环境变量配置

如果需要，可以在项目根目录创建 `.env` 文件：

```env
# API 配置
REACT_APP_API_URL=http://localhost:8001
REACT_APP_WS_URL=ws://localhost:8001

# 服务器配置
PORT=8000

# 构建和开发配置
GENERATE_SOURCEMAP=false
SKIP_PREFLIGHT_CHECK=true
FAST_REFRESH=false
```

### API URL 配置说明

- `REACT_APP_API_URL`: 后端API的基础URL，默认为 `http://localhost:8001`
- `REACT_APP_WS_URL`: WebSocket连接的URL，默认为 `ws://localhost:8001`
- `PORT`: 前端开发服务器端口，默认为 `8000`

### 构建和开发配置说明

- `GENERATE_SOURCEMAP=false`: 禁用源映射以提高构建速度
- `SKIP_PREFLIGHT_CHECK=true`: 跳过预检检查，避免某些依赖冲突警告
- `FAST_REFRESH=false`: 禁用快速刷新，解决react-refresh相关错误

例如，如果后端部署在不同IP和端口上：
```env
REACT_APP_API_URL=http://192.168.1.100:8001
REACT_APP_WS_URL=ws://192.168.1.100:8001
PORT=3000
```

### 后端主机配置

如果后端部署在远程服务器上，确保后端设置了适当的环境变量：

- 在Linux服务器上设置：
```bash
export DJANGO_ENV=production
```

这将允许后端接受来自任何主机的请求。

## 故障排除

### 常见错误及解决方案

1. **内存不足错误**：
   ```bash
   # 增加 Node.js 内存限制
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm start
   ```

2. **端口占用**：
   ```bash
   # 查找占用端口的进程
   lsof -i :3000  # Mac/Linux
   netstat -ano | findstr :3000  # Windows
   
   # 杀死占用端口的进程
   kill -9 <PID>  # Mac/Linux
   taskkill /PID <PID> /F  # Windows
   ```

3. **依赖冲突**：
   ```bash
   # 删除 node_modules 和锁定文件
   rm -rf node_modules package-lock.json
   # 重新安装
   npm install
   ```

### 性能优化建议

1. **使用 npm ci 进行干净安装**：
   ```bash
   npm ci
   ```

2. **使用缓存加速安装**：
   ```bash
   npm install --cache-max 0
   ```

3. **并行安装依赖**：
   ```bash
   npm install --prefer-offline
   ```

## 部署相关

### 生产环境部署
```bash
# 构建生产版本
npm run build

# 使用 serve 部署
npm install -g serve
serve -s build

# 或者使用 nginx 配置
```

### Docker 部署示例
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 自动化脚本

项目中包含以下自动化脚本：

- `frontend/install_deps.bat` - Windows 批处理安装脚本
- `frontend/install_deps.ps1` - PowerShell 安装脚本
- `frontend/run_frontend.bat` - Windows 运行脚本
- `frontend/run_frontend.ps1` - PowerShell 运行脚本