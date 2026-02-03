# 后端依赖安装脚本 (PowerShell 版本)
# 用于安装所有必要的 Python 依赖

Write-Host "正在安装后端依赖..." -ForegroundColor Green

# 检查是否已激活虚拟环境
if (-not (Test-Path Env:VIRTUAL_ENV)) {
    Write-Host "警告: 未检测到虚拟环境，建议创建并激活虚拟环境以避免依赖冲突" -ForegroundColor Yellow
    Write-Host "您可以运行: python -m venv venv 然后执行 venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Read-Host "按 Enter 继续..."
}

# 升级 pip 并安装依赖
python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host "后端依赖安装完成！" -ForegroundColor Green
Read-Host "按 Enter 退出..."