import os
import django
import sys
import json

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import PlantPhase, ProductionLine, Process, ShiftType

print("=== 检查API数据结构 ===")

# 获取所有启用的期数
phases = PlantPhase.objects.filter(is_active=True).values('code', 'name', 'description')
print("期数数据格式:", list(phases))

# 获取所有启用的产线，使用关联查询
production_lines = ProductionLine.objects.filter(
    is_active=True
).select_related('phase').values(
    'code', 'name', 'phase__code', 'description'
)

# 转换产线数据格式
formatted_lines = []
for line in production_lines:
    formatted_line = {
        'code': line['code'],
        'name': line['name'],
        'phase_code': line['phase__code'],
        'description': line['description']
    }
    formatted_lines.append(formatted_line)

print("产线数据格式:", formatted_lines)

# 获取所有启用的工序
processes = Process.objects.filter(is_active=True).values('code', 'name', 'description')
print("工序数据格式:", list(processes))

# 获取所有启用的班次类型
shift_types = ShiftType.objects.filter(is_active=True).values('code', 'name', 'description')
print("班次类型数据格式:", list(shift_types))

print("\n=== 检查前端数据映射 ===")

# 检查产线数据是否包含对应的期数信息
print("产线与期数的关联:")
for line in formatted_lines:
    print(f"  产线: {line['name']}, 期数代码: {line['phase_code']}")

# 检查期数数据
print("\n期数代码列表:", [p['code'] for p in phases])