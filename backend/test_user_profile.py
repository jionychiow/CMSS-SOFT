#!/usr/bin/env python
"""Test script to check user and profile status"""
import os
import sys
import django
from django.conf import settings

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from db.models import UserProfile

# 查找admin用户并检查其配置文件
try:
    admin_user = User.objects.get(username='admin')
    print(f"Admin user found: {admin_user.username}")
    print(f"Admin user id: {admin_user.id}")
    print(f"Admin user is active: {admin_user.is_active}")
    print(f"Admin user is staff: {admin_user.is_staff}")
    print(f"Admin user is superuser: {admin_user.is_superuser}")
    
    # 尝试获取用户配置文件
    try:
        user_profile = UserProfile.objects.get(user=admin_user)
        print(f"User profile found: {user_profile}")
        print(f"User profile organization: {user_profile.organization}")
        print(f"User profile type: {user_profile.type}")
    except UserProfile.DoesNotExist:
        print("User profile does NOT exist for admin user")
        
        # 尝试创建一个
        from db.models import Organization
        default_org, created = Organization.objects.get_or_create(
            name='Default Organization',
            defaults={'subdomain': 'default', 'max_assets': 100, 'max_users': 10, 'max_active_orders': 50}
        )
        
        new_profile = UserProfile.objects.create(
            user=admin_user,
            organization=default_org
        )
        print(f"Created new user profile: {new_profile}")
        print(f"New user profile organization: {new_profile.organization}")

except User.DoesNotExist:
    print("Admin user does not exist!")
    print("Available users:")
    for user in User.objects.all():
        print(f"  - {user.username} (id: {user.id})")
except Exception as e:
    print(f"Error accessing admin user: {e}")
    import traceback
    traceback.print_exc()