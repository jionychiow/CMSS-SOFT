import os
import django
import sys

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import Asset

print("=== 检查现有资产数据 ===")

# 获取所有资产
assets = Asset.objects.all()
for asset in assets:
    print(f"资产ID: {asset.uuid}")
    print(f"  名称: {asset.name}")
    print(f"  期数: {asset.phase.name if asset.phase else 'None'} (ID: {asset.phase.id if asset.phase else 'None'})")
    print(f"  工序: {asset.process.name if asset.process else 'None'} (ID: {asset.process.id if asset.process else 'None'})")
    print(f"  产线: {asset.production_line.name if asset.production_line else 'None'} (ID: {asset.production_line.id if asset.production_line else 'None'})")
    print(f"  类型: {asset.asset_type}")
    print(f"  状态: {asset.status}")
    print("-" * 50)