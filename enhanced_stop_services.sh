#!/bin/bash

# 增强版停止CMMS-OEE-Software服务的脚本
# 支持screen会话管理和其他进程终止方法

echo "正在停止CMMS-OEE-Software服务..."

# 停止screen会话（如果存在）
echo "正在查找并终止screen会话..."
SCREEN_SESSIONS=$(screen -ls | grep -o '[0-9]*\.cmss-f')

if [ ! -z "$SCREEN_SESSIONS" ]; then
    echo "找到screen会话: $SCREEN_SESSIONS"
    screen -S "$SCREEN_SESSIONS" -X quit
    echo "Screen会话已终止"
else
    echo "未找到名为cmss-f的screen会话"
fi

# 查找并终止后端进程 (Python/Django)
echo "正在查找后端进程..."
BACKEND_PIDS=$(pgrep -f "python.*manage.py runserver")

if [ ! -z "$BACKEND_PIDS" ]; then
    echo "找到后端进程: $BACKEND_PIDS"
    kill -TERM $BACKEND_PIDS
    sleep 2
    # 再次检查是否仍有进程运行，如有则强制终止
    BACKEND_PIDS_AGAIN=$(pgrep -f "python.*manage.py runserver")
    if [ ! -z "$BACKEND_PIDS_AGAIN" ]; then
        echo "强制终止后端进程: $BACKEND_PIDS_AGAIN"
        kill -KILL $BACKEND_PIDS_AGAIN
    fi
    echo "后端进程已终止"
else
    echo "未找到后端进程"
fi

# 查找并终止前端进程 (React开发服务器)
echo "正在查找前端进程..."
FRONTEND_PIDS=$(pgrep -f "react-scripts start")

if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "找到前端进程: $FRONTEND_PIDS"
    kill -TERM $FRONTEND_PIDS
    sleep 2
    # 再次检查是否仍有进程运行，如有则强制终止
    FRONTEND_PIDS_AGAIN=$(pgrep -f "react-scripts start")
    if [ ! -z "$FRONTEND_PIDS_AGAIN" ]; then
        echo "强制终止前端进程: $FRONTEND_PIDS_AGAIN"
        kill -KILL $FRONTEND_PIDS_AGAIN
    fi
    echo "前端进程已终止"
else
    echo "未找到前端进程"
fi

# 查找并终止任何node进程（如果前端仍在运行）
NODE_PIDS=$(pgrep -f "node.*react-scripts")

if [ ! -z "$NODE_PIDS" ]; then
    echo "找到node相关进程: $NODE_PIDS"
    kill -TERM $NODE_PIDS
    sleep 2
    # 再次检查是否仍有进程运行，如有则强制终止
    NODE_PIDS_AGAIN=$(pgrep -f "node.*react-scripts")
    if [ ! -z "$NODE_PIDS_AGAIN" ]; then
        echo "强制终止node相关进程: $NODE_PIDS_AGAIN"
        kill -KILL $NODE_PIDS_AGAIN
    fi
    echo "Node相关进程已终止"
fi

# 查找并终止任何npm进程
NPM_PIDS=$(pgrep -f "npm.*start")

if [ ! -z "$NPM_PIDS" ]; then
    echo "找到npm相关进程: $NPM_PIDS"
    kill -TERM $NPM_PIDS
    sleep 2
    # 再次检查是否仍有进程运行，如有则强制终止
    NPM_PIDS_AGAIN=$(pgrep -f "npm.*start")
    if [ ! -z "$NPM_PIDS_AGAIN" ]; then
        echo "强制终止npm相关进程: $NPM_PIDS_AGAIN"
        kill -KILL $NPM_PIDS_AGAIN
    fi
    echo "NPM相关进程已终止"
fi

# 查找并终止任何监听8000或8001端口的进程
echo "正在检查端口占用情况..."
if command -v lsof &> /dev/null; then
    PORT_8000=$(lsof -t -i:8000)
    PORT_8001=$(lsof -t -i:8001)
    
    if [ ! -z "$PORT_8000" ]; then
        echo "终止监听8000端口的进程: $PORT_8000"
        kill -TERM $PORT_8000
        sleep 1
        # 强制终止如果仍存在
        lsof -t -i:8000 | xargs -r kill -KILL
    fi
    
    if [ ! -z "$PORT_8001" ]; then
        echo "终止监听8001端口的进程: $PORT_8001"
        kill -TERM $PORT_8001
        sleep 1
        # 强制终止如果仍存在
        lsof -t -i:8001 | xargs -r kill -KILL
    fi
else
    echo "lsof命令不可用，跳过端口检查"
fi

# 等待几秒钟让进程完全终止
sleep 2

echo "服务停止完成！"
echo ""
echo "正在检查相关进程状态..."
echo "Python进程:"
pgrep -f "python.*manage.py runserver" || echo "  无相关Python进程运行"
echo ""
echo "Node进程:"
pgrep -f "react-scripts start" || echo "  无相关Node进程运行"
echo ""
echo "NPM进程:"
pgrep -f "npm.*start" || echo "  无相关NPM进程运行"
echo ""
echo "端口占用情况:"
if command -v lsof &> /dev/null; then
    echo "端口8000:"
    lsof -i:8000 || echo "  无进程占用"
    echo "端口8001:"
    lsof -i:8001 || echo "  无进程占用"
else
    echo "无法检查端口占用（lsof不可用）"
fi