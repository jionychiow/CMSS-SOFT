import os
import django
import sys

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import PlantPhase, ProductionLine, Process, ShiftType, Asset

print("=== 开始修复资产数据关联 ===")

# 获取所有资产
assets = Asset.objects.all()
print(f"找到 {assets.count()} 个资产")

# 创建代码到对象的映射
phases_map = {phase.code: phase for phase in PlantPhase.objects.all()}
processes_map = {proc.code: proc for proc in Process.objects.all()}
lines_map = {line.code: line for line in ProductionLine.objects.all()}

print(f"期数映射: {list(phases_map.keys())}")
print(f"工序映射: {list(processes_map.keys())}")
print(f"产线映射: {list(lines_map.keys())}")

updated_count = 0

for asset in assets:
    print(f"\n处理资产: {asset.name}")
    print(f"  当前期数: {asset.phase.name if asset.phase else 'None'}")
    print(f"  当前工序: {asset.process.name if asset.process else 'None'}")
    print(f"  当前产线: {asset.production_line.name if asset.production_line else 'None'}")
    
    # 尝试匹配期数
    if asset.phase_code and asset.phase_code in phases_map:
        asset.phase = phases_map[asset.phase_code]
        print(f"  -> 匹配期数: {asset.phase_code}")
    
    # 尝试匹配工序
    if asset.process_code and asset.process_code in processes_map:
        asset.process = processes_map[asset.process_code]
        print(f"  -> 匹配工序: {asset.process_code}")
    
    # 尝试匹配产线
    if asset.production_line_code and asset.production_line_code in lines_map:
        asset.production_line = lines_map[asset.production_line_code]
        print(f"  -> 匹配产线: {asset.production_line_code}")
    
    # 保存更改
    asset.save()
    updated_count += 1
    
    print(f"  更新后 - 期数: {asset.phase.name if asset.phase else 'None'}, "
          f"工序: {asset.process.name if asset.process else 'None'}, "
          f"产线: {asset.production_line.name if asset.production_line else 'None'}")

print(f"\n=== 数据修复完成 ===")
print(f"共更新了 {updated_count} 个资产记录")