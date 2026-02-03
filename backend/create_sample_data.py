import os
import sys
import django

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from db.models import PlantPhase, ProductionLine, Process, ShiftType, Asset
from db.models_maintenance_new import ShiftMaintenanceRecord
from db.models_maintenance import MaintenanceManual, MaintenanceCase
from datetime import datetime

def create_sample_data():
    print("开始创建示例数据...")
    
    # 创建或获取超级用户
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("创建了管理员用户: admin/admin123")
    else:
        print("使用现有管理员用户")

    # 创建期数
    phase_1, created = PlantPhase.objects.get_or_create(
        code='phase_1',
        defaults={'name': '一期', 'description': '第一期项目'}
    )
    phase_2, created = PlantPhase.objects.get_or_create(
        code='phase_2',
        defaults={'name': '二期', 'description': '第二期项目'}
    )
    print(f"创建了期数: {phase_1.name}, {phase_2.name}")

    # 创建生产线
    line_1, created = ProductionLine.objects.get_or_create(
        code='line_1',
        defaults={'name': '生产线1', 'description': '第一条生产线', 'phase': phase_1}
    )
    line_2, created = ProductionLine.objects.get_or_create(
        code='line_2',
        defaults={'name': '生产线2', 'description': '第二条生产线', 'phase': phase_2}
    )
    print(f"创建了生产线: {line_1.name}, {line_2.name}")

    # 创建工序
    process_1, created = Process.objects.get_or_create(
        code='process_1',
        defaults={'name': '工序1', 'description': '第一道工序'}
    )
    process_2, created = Process.objects.get_or_create(
        code='process_2',
        defaults={'name': '工序2', 'description': '第二道工序'}
    )
    print(f"创建了工序: {process_1.name}, {process_2.name}")

    # 创建班次类型
    shift_1, created = ShiftType.objects.get_or_create(
        code='long_day_shift',
        defaults={'name': '长白班', 'description': '长时间白班'}
    )
    shift_2, created = ShiftType.objects.get_or_create(
        code='rotating_shift',
        defaults={'name': '倒班', 'description': '轮换班次'}
    )
    print(f"创建了班次类型: {shift_1.name}, {shift_2.name}")

    # 创建资产/设备
    asset_1, created = Asset.objects.get_or_create(
        name='设备1',
        defaults={
            'ref': 'EQP001',
            'name': '设备1',
            'location': '车间A',
            'phase': phase_1,
            'production_line': line_1,
            'process': process_1,
            'status': 'active',
            'created_by': admin_user
        }
    )
    asset_2, created = Asset.objects.get_or_create(
        name='设备2',
        defaults={
            'ref': 'EQP002',
            'name': '设备2',
            'location': '车间B',
            'phase': phase_2,
            'production_line': line_2,
            'process': process_2,
            'status': 'active',
            'created_by': admin_user
        }
    )
    print(f"创建了设备: {asset_1.name}, {asset_2.name}")

    # 创建维修记录 - 为每个期数和班次各创建一条记录
    record_1, created = ShiftMaintenanceRecord.objects.get_or_create(
        serial_number='1CB-000001',
        defaults={
            'phase': phase_1,
            'shift_type': shift_1,
            'equipment_name': '期数1-长白班维修记录',
            'before_change': '第一期设备在长白班期间的维修记录',
            'after_change': '维修完成',
            'change_reason': 'maintenance',
            'implementer': '张三',
            'confirm_person': '李四',
            'assigned_to': admin_user
        }
    )
    record_2, created = ShiftMaintenanceRecord.objects.get_or_create(
        serial_number='1DB-000001',
        defaults={
            'phase': phase_1,
            'shift_type': shift_2,
            'equipment_name': '期数1-倒班维修记录',
            'before_change': '第一期设备在倒班期间的维修记录',
            'after_change': '维修完成',
            'change_reason': 'maintenance',
            'implementer': '王五',
            'acceptor': '赵六',
            'assigned_to': admin_user
        }
    )
    record_3, created = ShiftMaintenanceRecord.objects.get_or_create(
        serial_number='2CB-000001',
        defaults={
            'phase': phase_2,
            'shift_type': shift_1,
            'equipment_name': '期数2-长白班维修记录',
            'before_change': '第二期设备在长白班期间的维修记录',
            'after_change': '维修完成',
            'change_reason': 'maintenance',
            'implementer': '孙七',
            'confirm_person': '周八',
            'assigned_to': admin_user
        }
    )
    record_4, created = ShiftMaintenanceRecord.objects.get_or_create(
        serial_number='2DB-000001',
        defaults={
            'phase': phase_2,
            'shift_type': shift_2,
            'equipment_name': '期数2-倒班维修记录',
            'before_change': '第二期设备在倒班期间的维修记录',
            'after_change': '维修完成',
            'change_reason': 'maintenance',
            'implementer': '吴九',
            'acceptor': '郑十',
            'assigned_to': admin_user
        }
    )
    print(f"创建了维修记录: {record_1.equipment_name}, {record_2.equipment_name}, {record_3.equipment_name}, {record_4.equipment_name}")

    # 创建维修手册
    manual_1, created = MaintenanceManual.objects.get_or_create(
        title='设备1操作手册',
        defaults={
            'production_line': '1-1#',
            'process': 'assembly',
            'equipment_name': '设备1',
            'description': '这是设备1的详细操作手册...',
            'repair_steps': '维修步骤...',
            'created_by': admin_user
        }
    )
    manual_2, created = MaintenanceManual.objects.get_or_create(
        title='设备2操作手册',
        defaults={
            'production_line': '2-1#',
            'process': 'molding',
            'equipment_name': '设备2',
            'description': '这是设备2的详细操作手册...',
            'repair_steps': '维修步骤...',
            'created_by': admin_user
        }
    )
    print(f"创建了维修手册: {manual_1.title}, {manual_2.title}")

    # 创建故障案例
    case_1, created = MaintenanceCase.objects.get_or_create(
        equipment_name='设备1',
        defaults={
            'process': 'assembly',
            'equipment_name': '设备1',
            'fault_reason': '设备1出现的典型故障案例',
            'fault_phenomenon': '故障现象...',
            'fault_handling_method': '故障解决方案...',
            'created_by': admin_user
        }
    )
    case_2, created = MaintenanceCase.objects.get_or_create(
        equipment_name='设备2',
        defaults={
            'process': 'molding',
            'equipment_name': '设备2',
            'fault_reason': '设备2出现的典型故障案例',
            'fault_phenomenon': '故障现象...',
            'fault_handling_method': '故障解决方案...',
            'created_by': admin_user
        }
    )
    print(f"创建了故障案例: {case_1.equipment_name}, {case_2.equipment_name}")

    print("示例数据创建完成！")

if __name__ == '__main__':
    create_sample_data()