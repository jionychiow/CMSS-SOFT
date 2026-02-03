import os
import django
import sys
import json

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from maintenance.config_views import get_config_data
from django.test import RequestFactory
from django.contrib.auth.models import User

# 创建一个模拟请求
factory = RequestFactory()
request = factory.get('/api/maintenance/config/get-config-data/')
user = User.objects.first()  # 获取第一个用户作为模拟用户
request.user = user

# 调用API函数
response = get_config_data(request)
print("=== API响应数据结构 ===")
print(json.dumps(response.data, indent=2, ensure_ascii=False))