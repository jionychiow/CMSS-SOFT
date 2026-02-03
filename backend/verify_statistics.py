import os
import sys
import django

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import PlantPhase, ProductionLine, Process, ShiftType, Asset
from db.models_maintenance_new import ShiftMaintenanceRecord
from db.models_maintenance import MaintenanceManual, MaintenanceCase

print("=== 数据统计验证 ===")

# 统计各类数据
print(f"期数总数: {PlantPhase.objects.count()}")
print(f"产线总数: {ProductionLine.objects.count()}")
print(f"工序总数: {Process.objects.count()}")
print(f"班次类型总数: {ShiftType.objects.count()}")
print(f"设备总数: {Asset.objects.count()}")
print(f"维修记录总数: {ShiftMaintenanceRecord.objects.count()}")
print(f"维修手册总数: {MaintenanceManual.objects.count()}")
print(f"故障案例总数: {MaintenanceCase.objects.count()}")

print("\n=== 按期数统计维修记录 ===")
phases = PlantPhase.objects.all()
for phase in phases:
    record_count = ShiftMaintenanceRecord.objects.filter(phase=phase).count()
    print(f"{phase.name}: {record_count} 条记录")

print("\n=== 按班次类型统计维修记录 ===")
shift_types = ShiftType.objects.all()
for shift_type in shift_types:
    record_count = ShiftMaintenanceRecord.objects.filter(shift_type=shift_type).count()
    print(f"{shift_type.name}: {record_count} 条记录")

print("\n=== 设备详情 ===")
assets = Asset.objects.all()
for asset in assets:
    print(f"- {asset.name} (位置: {asset.location}, 期数: {asset.phase.name if asset.phase else 'N/A'}, 产线: {asset.production_line.name if asset.production_line else 'N/A'}, 工序: {asset.process.name if asset.process else 'N/A'})")

print("\n=== 维修记录详情 ===")
records = ShiftMaintenanceRecord.objects.all()
for record in records:
    print(f"- {record.equipment_name} (期数: {record.phase.name}, 班次: {record.shift_type.name})")

print("\n=== 数据统计验证完成 ===")