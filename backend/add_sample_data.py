from db.models import PlantPhase, ProductionLine, Process
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


def add_sample_data():
    # 创建期数数据
    phase_1, created = PlantPhase.objects.get_or_create(
        code='phase_1',
        defaults={'name': '一期', 'description': '第一期工程'}
    )
    
    phase_2, created = PlantPhase.objects.get_or_create(
        code='phase_2',
        defaults={'name': '二期', 'description': '第二期工程'}
    )
    
    print(f"Created/updated phases: {phase_1.name}, {phase_2.name}")
    
    # 创建产线数据
    lines_data = [
        {'name': '产线A', 'code': 'line_a', 'phase': phase_1, 'description': 'A产线'},
        {'name': '产线B', 'code': 'line_b', 'phase': phase_1, 'description': 'B产线'},
        {'name': '产线C', 'code': 'line_c', 'phase': phase_1, 'description': 'C产线'},
        {'name': '产线D', 'code': 'line_d', 'phase': phase_2, 'description': 'D产线'},
        {'name': '产线E', 'code': 'line_e', 'phase': phase_2, 'description': 'E产线'},
    ]
    
    for line_data in lines_data:
        line, created = ProductionLine.objects.get_or_create(
            code=line_data['code'],
            defaults=line_data
        )
        print(f"Created/updated production line: {line.name}")
    
    # 创建工序数据
    processes_data = [
        {'name': '注塑', 'code': 'injection', 'description': '注塑成型工序'},
        {'name': '组装', 'code': 'assembly', 'description': '产品组装工序'},
        {'name': '测试', 'code': 'testing', 'description': '产品测试工序'},
        {'name': '包装', 'code': 'packaging', 'description': '产品包装工序'},
        {'name': '质检', 'code': 'quality_control', 'description': '质量检查工序'},
    ]
    
    for process_data in processes_data:
        process, created = Process.objects.get_or_create(
            code=process_data['code'],
            defaults=process_data
        )
        print(f"Created/updated process: {process.name}")
    
    print("Sample data added successfully!")


if __name__ == '__main__':
    import os
    import sys
    import django
    
    # 设置Django环境
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()
    
    add_sample_data()