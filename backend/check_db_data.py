import os
import django
import sys

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import PlantPhase, ProductionLine, Process, ShiftType, Asset
from db.models_maintenance_new import ShiftMaintenanceRecord

print("=== 检查数据库配置数据 ===\n")

# 检查期数数据
print("1. 期数数据:")
phases = PlantPhase.objects.all()
for phase in phases:
    print(f"   ID: {phase.id}, 代码: {phase.code}, 名称: {phase.name}, 启用: {phase.is_active}")
print(f"   总计: {phases.count()} 条\n")

# 检查产线数据
print("2. 产线数据:")
lines = ProductionLine.objects.all()
for line in lines:
    print(f"   ID: {line.id}, 代码: {line.code}, 名称: {line.name}, 期数: {line.phase.name}, 启用: {line.is_active}")
print(f"   总计: {lines.count()} 条\n")

# 检查工序数据
print("3. 工序数据:")
processes = Process.objects.all()
for process in processes:
    print(f"   ID: {process.id}, 代码: {process.code}, 名称: {process.name}, 启用: {process.is_active}")
print(f"   总计: {processes.count()} 条\n")

# 检查班次类型数据
print("4. 班次类型数据:")
shift_types = ShiftType.objects.all()
for shift_type in shift_types:
    print(f"   ID: {shift_type.id}, 代码: {shift_type.code}, 名称: {shift_type.name}, 启用: {shift_type.is_active}")
print(f"   总计: {shift_types.count()} 条\n")

# 检查资产数据
print("5. 资产数据:")
assets = Asset.objects.all()
for asset in assets[:10]:  # 只显示前10条
    phase_name = asset.phase.name if asset.phase else "无"
    process_name = asset.process.name if asset.process else "无"
    line_name = asset.production_line.name if asset.production_line else "无"
    print(f"   ID: {asset.uuid}, 名称: {asset.name}, 期数: {phase_name}, 工序: {process_name}, 产线: {line_name}")
if assets.count() > 10:
    print(f"   (显示前10条，总计: {assets.count()} 条)\n")
else:
    print(f"   总计: {assets.count()} 条\n")

# 检查维修记录数据
print("6. 维修记录数据:")
records = ShiftMaintenanceRecord.objects.all()
for record in records[:5]:  # 只显示前5条
    print(f"   ID: {record.id}, 设备: {record.equipment_name}, 期数: {record.phase.name}, 班次: {record.shift_type.name}")
if records.count() > 5:
    print(f"   (显示前5条，总计: {records.count()} 条)\n")
else:
    print(f"   总计: {records.count()} 条\n")

print("=== 数据检查完成 ===")