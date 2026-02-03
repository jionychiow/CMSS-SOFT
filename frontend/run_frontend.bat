@echo off
REM 前端运行脚本
REM 用于启动 React 开发服务器

echo 启动前端开发服务器...

REM 切换到前端目录
cd /d "%~dp0"

REM 检查 node_modules 是否存在
if not exist "node_modules" (
    echo 检测到 node_modules 不存在，正在安装依赖...
    call npm install
)

REM 启动开发服务器
echo 启动前端开发服务器在 http://localhost:8000/
call npm start

pause