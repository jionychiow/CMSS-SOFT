import os
import sys
import django

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apiv1.serializers import AssetSerializer
from db.models import Asset

print("=== 检查资产序列化器输出 ===")

assets = Asset.objects.all()
print(f"总共有 {assets.count()} 个资产")

for i, asset in enumerate(assets, 1):
    print(f"\n{i}. 序列化资产 '{asset.name}':")
    
    # 使用序列化器
    serializer = AssetSerializer(asset)
    serialized_data = serializer.data
    
    print("   序列化数据字段:")
    for key, value in serialized_data.items():
        print(f"     {key}: {value} (类型: {type(value).__name__})")
    
    print("---")

print("\n=== 序列化器检查完成 ===")