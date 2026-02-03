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
from db.models_maintenance_new import ShiftMaintenanceRecord

print("=== 测试维修记录API端点 ===")

# 创建一个模拟请求
factory = RequestFactory()
user = User.objects.first()  # 获取第一个用户作为测试用户

if user:
    # 创建一个带查询参数的GET请求
    request = factory.get('/api/db/shift-maintenance-records/?phase=phase_1&shift_type=long_day_shift')
    request.user = user
    
    # 创建Viewset实例并调用get_queryset
    viewset = ShiftMaintenanceRecordViewSet()
    viewset.request = request
    
    try:
        queryset = viewset.get_queryset()
        print(f"查询结果数量: {queryset.count()}")
        
        # 检查SQL查询语句
        print(f"SQL查询: {queryset.query}")
        
        print("API端点测试成功！")
    except Exception as e:
        print(f"API端点测试失败: {e}")
        import traceback
        traceback.print_exc()
else:
    print("错误: 没有找到用户用于测试")