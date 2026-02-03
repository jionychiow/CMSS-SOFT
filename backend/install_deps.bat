@echo off
REM 后端依赖安装脚本
REM 用于安装所有必要的 Python 依赖

echo 正在安装后端依赖...

REM 检查是否已激活虚拟环境
if not defined VIRTUAL_ENV (
    echo 警告: 未检测到虚拟环境，建议创建并激活虚拟环境以避免依赖冲突
    echo 您可以运行: python -m venv venv 然后执行 venv\Scripts\activate
    pause
)

REM 安装依赖
pip install --upgrade pip
pip install -r requirements.txt

echo 后端依赖安装完成！
pause