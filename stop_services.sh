#!/bin/bash

# 停止CMMS-OEE-Software前后端服务的脚本

echo "正在停止CMMS-OEE-Software服务..."

# 查找并终止后端进程 (Python/Django)
echo "正在查找后端进程..."
BACKEND_PIDS=$(pgrep -f "python manage.py runserver")

if [ ! -z "$BACKEND_PIDS" ]; then
    echo "找到后端进程: $BACKEND_PIDS"
    kill $BACKEND_PIDS
    echo "后端进程已终止"
else
    echo "未找到后端进程"
fi

# 查找并终止前端进程 (React开发服务器)
echo "正在查找前端进程..."
FRONTEND_PIDS=$(pgrep -f "react-scripts start")

if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "找到前端进程: $FRONTEND_PIDS"
    kill $FRONTEND_PIDS
    echo "前端进程已终止"
else
    echo "未找到前端进程"
fi

# 查找并终止任何node进程（如果前端仍在运行）
NODE_PIDS=$(pgrep -f "node.*react-scripts")

if [ ! -z "$NODE_PIDS" ]; then
    echo "找到node相关进程: $NODE_PIDS"
    kill $NODE_PIDS
    echo "Node相关进程已终止"
fi

# 查找并终止任何监听8000或8001端口的进程
echo "正在检查端口占用情况..."
if command -v lsof &> /dev/null; then
    PORT_8000=$(lsof -t -i:8000)
    PORT_8001=$(lsof -t -i:8001)
    
    if [ ! -z "$PORT_8000" ]; then
        echo "终止监听8000端口的进程: $PORT_8000"
        kill $PORT_8000
    fi
    
    if [ ! -z "$PORT_8001" ]; then
        echo "终止监听8001端口的进程: $PORT_8001"
        kill $PORT_8001
    fi
else
    echo "lsof命令不可用，跳过端口检查"
fi

# 等待几秒钟让进程完全终止
sleep 2

echo "服务停止完成！"
echo ""
echo "当前正在运行的Python进程:"
ps aux | grep python | grep -v grep
echo ""
echo "当前正在运行的Node进程:"
ps aux | grep node | grep -v grep