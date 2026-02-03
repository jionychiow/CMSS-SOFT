"""
填充配置数据的脚本
"""

import os
import sys
import django

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import PlantPhase, ProductionLine, Process, ShiftType

def populate_config_data():
    print("开始填充配置数据...")
    
    # 创建期数
    print("创建期数...")
    phase_1, created = PlantPhase.objects.get_or_create(
        code='phase_1',
        defaults={
            'name': '一期',
            'description': '第一期工程'
        }
    )
    if created:
        print(f"创建期数: {phase_1.name}")
    else:
        print(f"期数已存在: {phase_1.name}")

    phase_2, created = PlantPhase.objects.get_or_create(
        code='phase_2',
        defaults={
            'name': '二期',
            'description': '第二期工程'
        }
    )
    if created:
        print(f"创建期数: {phase_2.name}")
    else:
        print(f"期数已存在: {phase_2.name}")

    # 创建工序
    print("创建工序...")
    processes_data = [
        {'code': 'PL', 'name': 'PL'},
        {'code': 'N1', 'name': 'N1'},
        {'code': 'N2', 'name': 'N2'},
        {'code': 'S1', 'name': 'S1'},
        {'code': 'F1', 'name': 'F1'},
        {'code': 'F2', 'name': 'F2'},
        {'code': 'CF', 'name': 'CF'},
        {'code': 'B', 'name': 'B'},
        {'code': 'BZ', 'name': 'BZ'},
    ]

    for proc_data in processes_data:
        process, created = Process.objects.get_or_create(
            code=proc_data['code'],
            defaults={
                'name': proc_data['name'],
                'description': f"{proc_data['name']} 工序"
            }
        )
        if created:
            print(f"创建工序: {process.name}")
        else:
            print(f"工序已存在: {process.name}")

    # 创建产线（与期数关联）
    print("创建产线...")
    production_lines_data = [
        # 一期产线
        {'code': '1#', 'name': '1#', 'phase': phase_1, 'description': '一期1#产线'},
        {'code': '2#', 'name': '2#', 'phase': phase_1, 'description': '一期2#产线'},
        {'code': '3#', 'name': '3#', 'phase': phase_1, 'description': '一期3#产线'},
        {'code': '4#', 'name': '4#', 'phase': phase_1, 'description': '一期4#产线'},
        {'code': '5#', 'name': '5#', 'phase': phase_1, 'description': '一期5#产线'},
        {'code': '6#', 'name': '6#', 'phase': phase_1, 'description': '一期6#产线'},
        {'code': '7#', 'name': '7#', 'phase': phase_1, 'description': '一期7#产线'},
        {'code': '8#', 'name': '8#', 'phase': phase_1, 'description': '一期8#产线'},
        {'code': '9#', 'name': '9#', 'phase': phase_1, 'description': '一期9#产线'},
        {'code': '10#', 'name': '10#', 'phase': phase_1, 'description': '一期10#产线'},
        # 二期产线
        {'code': '2-1#', 'name': '2-1#', 'phase': phase_2, 'description': '二期2-1#产线'},
        {'code': '2-2#', 'name': '2-2#', 'phase': phase_2, 'description': '二期2-2#产线'},
        {'code': '2-3#', 'name': '2-3#', 'phase': phase_2, 'description': '二期2-3#产线'},
        {'code': '2-4#', 'name': '2-4#', 'phase': phase_2, 'description': '二期2-4#产线'},
        {'code': '2-5#', 'name': '2-5#', 'phase': phase_2, 'description': '二期2-5#产线'},
        {'code': '2-6#', 'name': '2-6#', 'phase': phase_2, 'description': '二期2-6#产线'},
        {'code': '2-7#', 'name': '2-7#', 'phase': phase_2, 'description': '二期2-7#产线'},
        {'code': '2-8#', 'name': '2-8#', 'phase': phase_2, 'description': '二期2-8#产线'},
        {'code': '2-9#', 'name': '2-9#', 'phase': phase_2, 'description': '二期2-9#产线'},
    ]

    for line_data in production_lines_data:
        line, created = ProductionLine.objects.get_or_create(
            code=line_data['code'],
            phase=line_data['phase'],
            defaults={
                'name': line_data['name'],
                'description': line_data['description']
            }
        )
        if created:
            print(f"创建产线: {line.name} ({line.phase.name})")
        else:
            print(f"产线已存在: {line.name} ({line.phase.name})")

    # 创建班次类型
    print("创建班次类型...")
    shift_types_data = [
        {'code': 'long_day_shift', 'name': '长白班', 'description': '长时间白班'},
        {'code': 'rotating_shift', 'name': '倒班', 'description': '轮班制'},
    ]

    for shift_data in shift_types_data:
        shift_type, created = ShiftType.objects.get_or_create(
            code=shift_data['code'],
            defaults={
                'name': shift_data['name'],
                'description': shift_data['description']
            }
        )
        if created:
            print(f"创建班次类型: {shift_type.name}")
        else:
            print(f"班次类型已存在: {shift_type.name}")

    print("配置数据填充完成！")

if __name__ == '__main__':
    populate_config_data()