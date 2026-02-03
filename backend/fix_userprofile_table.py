#!/usr/bin/env python
"""修复UserProfile表缺失的问题"""

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
    
    # 手动创建UserProfile表
    from django.db import connection
    
    print("正在创建UserProfile表...")
    
    with connection.cursor() as cursor:
        # 创建UserProfile表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `db_userprofile` (
                `uuid` char(32) NOT NULL PRIMARY KEY, 
                `created_at` datetime(6) NOT NULL, 
                `updated_at` datetime(6) NOT NULL, 
                `profile_photo` varchar(100) NOT NULL, 
                `type` varchar(50) NOT NULL, 
                `organization_id` char(32) NULL, 
                `user_id` integer NULL UNIQUE
            )
        """)
        
        # 添加外键约束
        try:
            cursor.execute("""
                ALTER TABLE `db_userprofile` 
                ADD CONSTRAINT `db_userprofile_organization_id_13380339_fk_db_organization_uuid` 
                FOREIGN KEY (`organization_id`) REFERENCES `db_organization` (`uuid`)
            """)
        except Exception as e:
            # 可能已经存在，忽略错误
            print(f"外键约束可能已存在: {e}")
            
        try:
            cursor.execute("""
                ALTER TABLE `db_userprofile` 
                ADD CONSTRAINT `db_userprofile_user_id_f870f513_fk_auth_user_id` 
                FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
            """)
        except Exception as e:
            # 可能已经存在，忽略错误
            print(f"外键约束可能已存在: {e}")
    
    print("UserProfile表创建成功！")
    
    # 现在尝试创建一个admin用户对应的UserProfile
    from django.contrib.auth.models import User
    from db.models import UserProfile, Organization
    
    try:
        # 获取admin用户
        admin_user = User.objects.filter(username='admin').first()
        if admin_user:
            # 检查是否已存在UserProfile
            userprofile, created = UserProfile.objects.get_or_create(
                user=admin_user,
                defaults={
                    'type': 'Admin',
                    'profile_photo': 'default.jpg'
                }
            )
            if created:
                print(f"为admin用户创建了UserProfile: {userprofile}")
            else:
                print(f"admin用户的UserProfile已存在: {userprofile}")
        else:
            print("未找到admin用户")
    except Exception as e:
        print(f"创建UserProfile时出错: {e}")

if __name__ == '__main__':
    main()