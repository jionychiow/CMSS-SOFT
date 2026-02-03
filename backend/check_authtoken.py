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
    
    # 检查authtoken迁移状态
    from django.db import connection
    
    print("正在检查authtoken迁移状态...")
    
    with connection.cursor() as cursor:
        # 检查django_migrations表中是否有authtoken记录
        cursor.execute("SELECT * FROM django_migrations WHERE app = %s", ['authtoken'])
        migrations = cursor.fetchall()
        print(f'Authtoken migrations in DB: {len(migrations)} records')
        for migration in migrations:
            print(f'  - {migration}')
        
        # 检查表是否存在
        cursor.execute("SHOW TABLES LIKE 'authtoken_token'")
        result = cursor.fetchone()
        print(f"Authtoken表存在: {bool(result)}")
        
        if not result:
            print("正在尝试强制创建authtoken表...")
            # 手动执行SQL创建表
            try:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS `authtoken_token` (
                        `key` varchar(40) NOT NULL PRIMARY KEY,
                        `created` datetime(6) NOT NULL,
                        `user_id` integer NOT NULL UNIQUE,
                        CONSTRAINT `authtoken_token_user_id_35299eff_fk_auth_user_id` 
                        FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
                    );
                """)
                print("authtoken_token表创建成功")
            except Exception as e:
                print(f"创建表时出错: {e}")
                
        # 再次检查表
        cursor.execute("SHOW TABLES LIKE 'authtoken_token'")
        result = cursor.fetchone()
        print(f"最终检查 - authtoken_token表存在: {bool(result)}")

if __name__ == '__main__':
    main()