#!/usr/bin/env python
"""Script to check Asset model field requirements"""
import os
import sys
import django
from django.conf import settings

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import Asset

# 检查 Asset 模型的字段属性
print("Asset model field requirements:")
for field in Asset._meta.fields:
    print(f"{field.name}: blank={field.blank}, null={field.null}, default={getattr(field, 'default', 'NO_DEFAULT')}")