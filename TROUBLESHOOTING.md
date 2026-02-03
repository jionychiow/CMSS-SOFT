# CMMS-OEE 部署和故障排除指南

## 脚本概览

本项目提供了一系列脚本来处理各种部署场景和常见问题。以下是按类别组织的脚本说明：

### 后端启动脚本

#### 基础启动
- `start-backend.sh` - 标准后端启动脚本（绑定localhost:8001）
- `start-backend-server.sh` - 服务器部署专用（绑定所有接口，适合远程访问）

#### Debian/Python 3.13 兼容性
- `start-backend-debian.sh` - Debian兼容（处理PEP 668限制）
- `start-backend-debian-optimized.sh` - Debian优化（解决Python 3.13兼容性）
- `start-backend-universal.sh` - 通用路径修复（解决路径相关问题）
- `start-backend-python313-fix.sh` - Python 3.13兼容性修复（解决编译错误）

#### 数据库相关
- `start-backend-db-fallback.sh` - 数据库回退支持（自动切换到SQLite当MySQL不可用时）

### 前端启动脚本

#### 基础启动
- `start-frontend.sh` - 标准前端启动脚本

#### Debian/兼容性修复
- `start-frontend-debian.sh` - Debian兼容启动
- `start-frontend-debian-fix.sh` - 依赖冲突修复（使用--legacy-peer-deps）
- `start-frontend-comprehensive-fix.sh` - 综合修复（处理多种依赖问题）
- `start-frontend-react-fix.sh` - React刷新问题修复（降级react-scripts）
- `start-frontend-final-fix.sh` - React刷新问题最终修复（使用CRACO）

#### 功能性修复
- `start-frontend-eslint-fix.sh` - ESLint和组件问题修复
- `start-frontend-server-fix.sh` - 服务器通信问题修复（自动检测服务器IP）
- `start-frontend-complete-fix.sh` - 完整导入和ESLint修复（解决MdiIcon问题）
- `start-frontend-ultimate-fix.sh` - 终极修复版（解决所有剩余问题）

#### 运行模式
- `start-frontend-silent.sh` - 静默模式（无浏览器打开，最小日志）
- `start-frontend-no-browser.sh` - 无浏览器打开但保留日志

### 一键启动脚本
- `start-app.sh` - 一键启动整个应用（标准版本）
- `start-app-debian.sh` - 一键启动整个应用（Debian兼容版本）

### 安装脚本
- `install-dependencies.sh` - Linux/macOS自动安装
- `install-dependencies-debian.sh` - Debian 12+兼容安装
- `install-dependencies-debian-optimized.sh` - Debian 12+优化安装
- `install-dependencies.bat` - Windows安装脚本

## 推荐的部署流程

### 对于标准Linux/macOS环境
1. `./install-dependencies.sh`
2. `./start-app.sh`

### 对于Debian 12+环境（Python 3.13）
1. `./install-dependencies-debian-optimized.sh`
2. `./start-backend-python313-fix.sh &` （后台运行）
3. `./start-frontend-ultimate-fix.sh` （前台运行）

### 对于服务器部署
1. `./start-backend-server.sh &` （后台运行，监听所有接口）
2. `./start-frontend-server-fix.sh` （前端自动检测服务器IP）

## 常见问题和解决方案

### 问题1：后端启动时出现MySQL警告
**现象**：
```
account.EmailAddress: (models.W036) MySQL does not support unique constraints with conditions.
```
**解决方案**：这是正常警告，不影响功能，可以忽略。

### 问题2：前后端无法通信（服务器部署）
**现象**：前端无法连接到后端API，无法登录或获取数据
**原因**：前端API URL配置不正确或后端未允许来自服务器IP的连接
**解决方案**：
1. 使用服务器IP配置脚本（可选）：
   ```bash
   chmod +x configure-server-ip.sh
   ./configure-server-ip.sh
   ```
2. 手动配置（推荐用于独立部署）：
   - 后端：确保`backend/settings.py`的`ALLOWED_HOSTS`包含服务器IP
   - 前端：在`frontend/.env`中设置`REACT_APP_API_URL=http://[服务器IP]:8001`
3. 分别重启前后端服务

注意：前端和后端是独立的应用程序，可以分别部署和启动。

### 问题2：Python 3.13兼容性问题
**现象**：
```
error: command '/usr/bin/x86_64-linux-gnu-gcc' failed with exit code 1
```
**解决方案**：使用 `start-backend-python313-fix.sh` 脚本。

### 问题3：前端ESLint错误
**现象**：
```
Parsing error: Missing semicolon
'MdiIcon' is not defined
```
**解决方案**：使用 `start-frontend-ultimate-fix.sh` 脚本。

### 问题4：依赖冲突
**现象**：
```
peer dep missing
```
**解决方案**：使用 `start-frontend-debian-fix.sh` 或 `start-frontend-comprehensive-fix.sh` 脚本。

### 问题5：前端与后端通信失败
**现象**：无法登录，API调用失败
**解决方案**：使用 `start-frontend-server-fix.sh` 脚本。

## 环境变量配置

### 前端环境变量
- 文件路径：`frontend/.env`
- 默认配置：
```
REACT_APP_API_URL=http://localhost:8001
PORT=8000
GENERATE_SOURCEMAP=false
```

### 后端环境变量
- 文件路径：`backend/.env` 或系统环境变量
- 默认配置：
```
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=*
```

## 端口配置

- 前端端口：默认8000（可通过`frontend/.env`中的`PORT`变量修改）
- 后端端口：默认8001（可在启动脚本中修改）

## 访问应用

- 前端：http://localhost:8000 或 http://[服务器IP]:8000
- 后端API：http://localhost:8001 或 http://[服务器IP]:8001
- Django Admin：http://localhost:8001/admin/

## 故障排除顺序

如果遇到问题，按以下顺序尝试解决方案：

1. 首先尝试标准启动脚本
2. 如果是Debian系统，尝试Debian兼容脚本
3. 如果有依赖问题，尝试修复版本
4. 如果有React问题，尝试React修复版本
5. 如果有通信问题，尝试服务器修复版本
6. 如果仍有问题，尝试终极修复版本

每个脚本都是独立的，包含了前一个脚本的所有修复加上额外的改进。