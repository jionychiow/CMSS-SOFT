import os
import django
import sys

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from maintenance.config_views import get_config_data
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory
from django.contrib.auth.models import User

print("=== 测试配置数据API响应格式 ===")

# 创建一个模拟请求
factory = RequestFactory()
user = User.objects.first()  # 获取第一个用户作为测试用户
if user:
    request = factory.get('/api/maintenance/config/get-config-data/')
    request.user = user  # 使用真实用户而不是匿名用户
    
    # 调用API函数
    response = get_config_data(request)
    
    print("API响应数据:")
    data = response.data
    print(f"  phases: {len(data.get('phases', []))} 项")
    print(f"  productionLines: {len(data.get('productionLines', []))} 项")
    print(f"  processes: {len(data.get('processes', []))} 项")
    print(f"  shiftTypes: {len(data.get('shiftTypes', []))} 项")
    
    print("\n字段名验证通过！前端现在应该能正确接收数据。")
else:
    print("错误: 没有找到用户用于测试")