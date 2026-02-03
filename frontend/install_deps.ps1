# 前端依赖安装脚本 (PowerShell 版本)
# 用于安装所有必要的 Node.js 依赖

Write-Host "正在安装前端依赖..." -ForegroundColor Green

# 切换到脚本所在目录
Set-Location $PSScriptRoot

# 清除 npm 缓存（可选）
# npm cache clean --force

# 安装依赖
npm install

Write-Host "前端依赖安装完成！" -ForegroundColor Green
Read-Host "按 Enter 退出..."