@echo off
REM 前端依赖安装脚本
REM 用于安装所有必要的 Node.js 依赖

echo 正在安装前端依赖...

REM 切换到前端目录
cd /d "%~dp0"

REM 清除 npm 缓存（可选）
REM npm cache clean --force

REM 安装依赖
npm install

echo 前端依赖安装完成！
pause