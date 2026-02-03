#!/bin/bash

# 启动CMMS-OEE-Software前后端服务的脚本

echo "正在启动CMMS-OEE-Software服务..."

# 进入后端目录并启动Django服务器
cd backend

echo "正在启动后端服务..."
nohup python manage.py runserver 0.0.0.0:8001 > backend.log 2>&1 &
BACKEND_PID=$!
echo "后端服务已启动，PID: $BACKEND_PID"

# 等待后端服务启动
sleep 5

# 进入前端目录并启动React开发服务器
cd ../frontend

echo "正在启动前端服务..."
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端服务已启动，PID: $FRONTEND_PID"

echo ""
echo "服务启动完成！"
echo "后端地址: http://localhost:8001"
echo "前端地址: http://localhost:8000"
echo ""
echo "要停止服务，请运行: ./stop_services.sh"