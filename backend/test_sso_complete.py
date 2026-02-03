import os
import sys
import django
import requests
import json
import time

# 设置Django环境
sys.path.append(r'e:\CMMS-OEE-Software\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def test_drf_sso_login():
    """
    测试DRF Token Authentication的单点登录功能
    """
    base_url = "http://localhost:8001/api"
    
    # 用户凭据
    login_data = {
        "username": "admin",  # 替换为实际用户名
        "password": "your_admin_password"  # 替换为实际密码
    }
    
    print("=== DRF Token Authentication 单点登录功能测试 ===")
    
    # 第一次登录 - 获取第一个token
    print("1. 第一次登录...")
    response1 = requests.post(f"{base_url}/api-token-auth/", json=login_data)
    
    if response1.status_code == 200:
        token1 = response1.json()
        print(f"   成功获取第一个token")
        print(f"   token (前20位): {token1['token'][:20]}...")
    else:
        print(f"   登录失败: {response1.status_code}, {response1.text}")
        return
    
    # 稍等片刻，模拟不同设备登录
    time.sleep(1)
    
    # 第二次登录 - 应该使第一个token失效
    print("\n2. 第二次登录（模拟另一台设备）...")
    response2 = requests.post(f"{base_url}/api-token-auth/", json=login_data)
    
    if response2.status_code == 200:
        token2 = response2.json()
        print(f"   成功获取第二个token")
        print(f"   token (前20位): {token2['token'][:20]}...")
    else:
        print(f"   第二次登录失败: {response2.status_code}, {response2.text}")
        return
    
    # 验证第一个token是否已被删除（通过尝试使用它访问受保护资源）
    print("\n3. 测试第一个token是否已失效...")
    headers1 = {"Authorization": f"Token {token1['token']}"}
    response_test1 = requests.get(f"{base_url}/v1/my-profile/", headers=headers1)
    
    if response_test1.status_code == 401:
        print("   ✓ 第一个token已失效（预期行为）")
    else:
        print(f"   ✗ 第一个token仍然有效: {response_test1.status_code}")
    
    # 测试第二个token是否有效
    print("\n4. 测试第二个token是否有效...")
    headers2 = {"Authorization": f"Token {token2['token']}"}
    response_test2 = requests.get(f"{base_url}/v1/my-profile/", headers=headers2)
    
    if response_test2.status_code == 200:
        print("   ✓ 第二个token有效（预期行为）")
    else:
        print(f"   ✗ 第二个token无效: {response_test2.status_code}")

def test_jwt_sso_login():
    """
    测试JWT的单点登录功能
    """
    base_url = "http://localhost:8001/api"
    
    # 用户凭据
    login_data = {
        "username": "admin",  # 替换为实际用户名
        "password": "your_admin_password"  # 替换为实际密码
    }
    
    print("\n=== JWT 单点登录功能测试 ===")
    
    # 第一次登录 - 获取第一个JWT
    print("1. 第一次登录JWT...")
    response1 = requests.post(f"{base_url}/token/", json=login_data)
    
    if response1.status_code == 200:
        jwt1 = response1.json()
        print(f"   成功获取第一个JWT")
        print(f"   access token (前20位): {jwt1['access'][:20]}...")
    else:
        print(f"   JWT登录失败: {response1.status_code}, {response1.text}")
        return
    
    # 稍等片刻
    time.sleep(1)
    
    # 第二次登录 - 应该使第一个JWT失效
    print("\n2. 第二次登录JWT（模拟另一台设备）...")
    response2 = requests.post(f"{base_url}/token/", json=login_data)
    
    if response2.status_code == 200:
        jwt2 = response2.json()
        print(f"   成功获取第二个JWT")
        print(f"   access token (前20位): {jwt2['access'][:20]}...")
    else:
        print(f"   第二次JWT登录失败: {response2.status_code}, {response2.text}")
        return
    
    # 测试第一个JWT是否已失效
    print("\n3. 测试第一个JWT是否已失效...")
    headers1 = {"Authorization": f"Bearer {jwt1['access']}"}
    response_test1 = requests.get(f"{base_url}/v1/assets/", headers=headers1)
    
    if response_test1.status_code == 401:
        print("   ✓ 第一个JWT已失效（预期行为）")
    else:
        print(f"   ✗ 第一个JWT仍然有效: {response_test1.status_code}")
    
    # 测试第二个JWT是否有效
    print("\n4. 测试第二个JWT是否有效...")
    headers2 = {"Authorization": f"Bearer {jwt2['access']}"}
    response_test2 = requests.get(f"{base_url}/v1/assets/", headers=headers2)
    
    if response_test2.status_code == 200:
        print("   ✓ 第二个JWT有效（预期行为）")
    else:
        print(f"   ✗ 第二个JWT无效: {response_test2.status_code}")

def check_current_tokens():
    """
    检查当前系统中的tokens状态
    """
    print("\n=== 当前Tokens状态检查 ===")
    
    try:
        from rest_framework.authtoken.models import Token
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
        from db.models_activity import UserActivity
        from django.contrib.auth.models import User
        
        drf_tokens = Token.objects.count()
        outstanding_jwt = OutstandingToken.objects.count()
        blacklisted_jwt = BlacklistedToken.objects.count()
        user_activities = UserActivity.objects.count()
        
        print(f"DRF Tokens 数量: {drf_tokens}")
        print(f"Outstanding JWT 数量: {outstanding_jwt}")
        print(f"Blacklisted JWT 数量: {blacklisted_jwt}")
        print(f"User Activity 数量: {user_activities}")
        
        # 获取超级用户信息
        admin_users = User.objects.filter(is_superuser=True)
        for user in admin_users:
            user_drf_tokens = Token.objects.filter(user=user).count()
            user_outstanding = OutstandingToken.objects.filter(user=user).count()
            user_blacklisted = BlacklistedToken.objects.filter(token__user=user).count()
            print(f"用户 {user.username} - DRF Tokens: {user_drf_tokens}, Outstanding JWT: {user_outstanding}, Blacklisted JWT: {user_blacklisted}")
        
    except Exception as e:
        print(f"检查tokens状态时出错: {str(e)}")

if __name__ == '__main__':
    print("开始测试单点登录功能...")
    check_current_tokens()
    test_drf_sso_login()
    test_jwt_sso_login()
    print("\n测试完成！")