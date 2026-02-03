import os
import django
import sys

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth.models import User
from db.views_new import ShiftMaintenanceRecordViewSet
from django.http import HttpRequest
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

print("=== 测试维修记录API端点 ===")

# 使用DRF的APIRequestFactory
factory = APIRequestFactory()
user = User.objects.first()  # 获取第一个用户

if user:
    # 创建一个带查询参数的GET请求
    request = factory.get('/api/db/shift-maintenance-records/', {'phase': 'phase_1', 'shift_type': 'long_day_shift'})
    request.user = user
    
    # 将Django请求转换为DRF请求
    drf_request = Request(request)
    
    # 创建Viewset实例并调用get_queryset
    viewset = ShiftMaintenanceRecordViewSet()
    viewset.request = drf_request
    viewset.format_kwarg = None
    
    try:
        queryset = viewset.get_queryset()
        print(f"查询结果数量: {queryset.count()}")
        print("SQL查询:", str(queryset.query))
        print("API端点测试成功！")
    except Exception as e:
        print(f"API端点测试失败: {e}")
        import traceback
        traceback.print_exc()
else:
    print("错误: 没有找到用户用于测试")