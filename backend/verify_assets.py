import os
import sys
import django

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import Asset

print("=== 数据库中所有资产 ===")

assets = Asset.objects.all()
print(f"总共有 {assets.count()} 个资产")

for i, asset in enumerate(assets, 1):
    print(f"{i}. 名称: {asset.name}")
    print(f"   参考编号: {asset.ref}")
    print(f"   位置: {asset.location}")
    print(f"   状态: {asset.status}")
    print(f"   期数: {asset.phase.name if asset.phase else 'N/A'}")
    print(f"   产线: {asset.production_line.name if asset.production_line else 'N/A'}")
    print(f"   工序: {asset.process.name if asset.process else 'N/A'}")
    print("---")

print("=== 资产数据验证完成 ===")