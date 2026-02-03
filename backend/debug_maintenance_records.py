import os
import django
import sys

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models_maintenance_new import ShiftMaintenanceRecord
from db.models import PlantPhase, ShiftType

print("=== 深入调查维修记录API问题 ===")

# 检查是否存在外键关联问题
try:
    # 获取一些测试数据
    sample_records = ShiftMaintenanceRecord.objects.select_related('phase', 'shift_type').all()[:5]
    
    print(f"找到 {sample_records.count()} 条维修记录样本")
    
    for record in sample_records:
        print(f"记录ID: {record.id}")
        print(f"  Phase: {record.phase} (ID: {getattr(record.phase, 'id', 'N/A')})")
        print(f"  Shift Type: {record.shift_type} (ID: {getattr(record.shift_type, 'id', 'N/A')})")
        print(f"  Phase Code: {getattr(record.phase, 'code', 'N/A') if record.phase else 'N/A'}")
        print(f"  Shift Code: {getattr(record.shift_type, 'code', 'N/A') if record.shift_type else 'N/A'}")
        print("-" * 40)
        
except Exception as e:
    print(f"查询测试数据时出错: {e}")
    import traceback
    traceback.print_exc()

# 检查是否存在孤立的外键引用（即外键引用的对象已被删除）
try:
    print("\n=== 检查孤立外键引用 ===")
    
    records_without_phase = ShiftMaintenanceRecord.objects.filter(phase__isnull=True)
    records_without_shift = ShiftMaintenanceRecord.objects.filter(shift_type__isnull=True)
    
    print(f"没有期数关联的记录: {records_without_phase.count()}")
    print(f"没有班次类型关联的记录: {records_without_shift.count()}")
    
    # 检查外键引用是否有效
    all_records = ShiftMaintenanceRecord.objects.all()
    invalid_phase_refs = 0
    invalid_shift_refs = 0
    
    for record in all_records:
        # 检查phase外键是否有效
        try:
            if record.phase:
                _ = record.phase.id  # 尝试访问外键对象
        except:
            invalid_phase_refs += 1
            
        # 检查shift_type外键是否有效
        try:
            if record.shift_type:
                _ = record.shift_type.id  # 尝试访问外键对象
        except:
            invalid_shift_refs += 1
    
    print(f"无效的期数引用: {invalid_phase_refs}")
    print(f"无效的班次引用: {invalid_shift_refs}")
    
except Exception as e:
    print(f"检查外键引用时出错: {e}")
    import traceback
    traceback.print_exc()