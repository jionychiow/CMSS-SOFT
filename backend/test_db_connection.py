#!/usr/bin/env python
"""用于测试数据库连接的脚本"""

import os
import sys
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
    
    # 测试数据库连接
    from django.db import connection
    
    try:
        cursor = connection.cursor()
        print("数据库连接成功！")
        print(f"数据库名称: {settings.DATABASES['default']['NAME']}")
        print(f"数据库用户: {settings.DATABASES['default']['USER']}")
        print(f"数据库主机: {settings.DATABASES['default']['HOST']}")
        print(f"数据库端口: {settings.DATABASES['default']['PORT']}")
        
        # 测试查询
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print(f"查询测试结果: {result}")
        
        # 检查用户表是否存在
        cursor.execute("SHOW TABLES LIKE 'auth_user'")
        user_table_exists = cursor.fetchone()
        print(f"用户表(auth_user)存在: {bool(user_table_exists)}")
        
        # 检查admin用户
        from django.contrib.auth import get_user_model
        User = get_user_model()
        admin_user = User.objects.filter(username='admin').first()
        if admin_user:
            print(f"admin用户存在: {admin_user.username}")
        else:
            print("admin用户不存在")
            
    except Exception as e:
        print(f"数据库连接失败: {e}")

if __name__ == '__main__':
    main()