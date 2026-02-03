import os
import django
import sys

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import PlantPhase, ProductionLine, Process, ShiftType

print("=== 验证配置数据 ===")

# 检查期数配置
phases = PlantPhase.objects.filter(is_active=True)
print(f"期数配置: {phases.count()} 项")
for phase in phases:
    print(f"  - {phase.code}: {phase.name} ({'启用' if phase.is_active else '禁用'})")

# 检查产线配置
lines = ProductionLine.objects.filter(is_active=True)
print(f"\n产线配置: {lines.count()} 项")
for line in lines:
    print(f"  - {line.code}: {line.name} (属于 {line.phase.name}) ({'启用' if line.is_active else '禁用'})")

# 检查工序配置
processes = Process.objects.filter(is_active=True)
print(f"\n工序配置: {processes.count()} 项")
for proc in processes:
    print(f"  - {proc.code}: {proc.name} ({'启用' if proc.is_active else '禁用'})")

# 检查班次类型配置
shift_types = ShiftType.objects.filter(is_active=True)
print(f"\n班次类型配置: {shift_types.count()} 项")
for st in shift_types:
    print(f"  - {st.code}: {st.name} ({'启用' if st.is_active else '禁用'})")

print("\n=== 验证完成 ===")