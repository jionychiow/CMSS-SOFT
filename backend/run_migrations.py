#!/usr/bin/env python
"""用于运行Django迁移的脚本，会自动加载环境变量"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def load_env_vars():
    """从.env文件加载环境变量"""
    env_file = '.env'
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

def main():
    # 加载环境变量
    load_env_vars()
    
    # 设置Django设置模块
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    # 初始化Django
    django.setup()
    
    # 执行迁移命令
    argv = ['manage.py', 'migrate']
    execute_from_command_line(argv)

if __name__ == '__main__':
    main()