#!/usr/bin/env python
"""用于检查和修复authtoken表的脚本"""

import os
import django
from django.conf import settings

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
    
    # 检查并创建authtoken表
    from django.core.management import execute_from_command_line
    from django.db import connection
    
    print("正在检查authtoken_token表...")
    
    with connection.cursor() as cursor:
        # 检查表是否存在
        cursor.execute("SHOW TABLES LIKE 'authtoken_token'")
        result = cursor.fetchone()
        
        if not result:
            print("authtoken_token表不存在，正在尝试创建...")
            # 强制同步数据库
            try:
                execute_from_command_line(['manage.py', 'migrate', 'authtoken', '--fake-initial'])
                print("authtoken迁移已完成")
            except Exception as e:
                print(f"迁移过程中出现错误: {e}")
                # 尝试普通迁移
                execute_from_command_line(['manage.py', 'migrate'])
        else:
            print("authtoken_token表已存在")
    
    # 再次检查表
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES LIKE 'authtoken_token'")
        result = cursor.fetchone()
        print(f"最终检查 - authtoken_token表存在: {bool(result)}")

if __name__ == '__main__':
    main()