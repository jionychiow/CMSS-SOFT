#!/usr/bin/env python
"""修复authtoken_token表中的重复条目"""

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
    
    from django.db import connection
    
    print("正在修复authtoken_token表...")
    
    with connection.cursor() as cursor:
        # 删除重复的token记录，保留最新的
        cursor.execute("""
            DELETE t1 FROM authtoken_token t1
            INNER JOIN authtoken_token t2 
            WHERE t1.user_id = t2.user_id AND t1.created < t2.created
        """)
        
        print("重复的token记录已删除")
    
    # 现在尝试创建admin用户的UserProfile
    from django.contrib.auth.models import User
    from db.models import UserProfile, Organization
    
    # 获取admin用户
    admin_user = User.objects.filter(username='admin').first()
    if admin_user:
        print(f'找到admin用户: {admin_user.id} - {admin_user.username}')
        
        # 检查是否已存在UserProfile
        try:
            userprofile = UserProfile.objects.get(user=admin_user)
            print(f'admin用户已有UserProfile: {userprofile}')
        except UserProfile.DoesNotExist:
            print('admin用户没有UserProfile，正在创建...')
            # 创建UserProfile
            userprofile = UserProfile.objects.create(
                user=admin_user,
                type='Admin',
                profile_photo='default.jpg'
            )
            print(f'为admin用户创建了UserProfile: {userprofile}')
    else:
        print('未找到admin用户')

if __name__ == '__main__':
    main()