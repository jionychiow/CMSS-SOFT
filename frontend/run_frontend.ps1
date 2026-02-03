# 前端运行脚本 (PowerShell 版本)
# 用于启动 React 开发服务器

Write-Host "启动前端开发服务器..." -ForegroundColor Green

# 切换到脚本所在目录
Set-Location $PSScriptRoot

# 检查 node_modules 是否存在
if (!(Test-Path "node_modules")) {
    Write-Host "检测到 node_modules 不存在，正在安装依赖..." -ForegroundColor Yellow
    npm install
}

# 启动开发服务器
Write-Host "启动前端开发服务器在 http://localhost:8000/" -ForegroundColor Green
npm start

Read-Host "按 Enter 退出..."