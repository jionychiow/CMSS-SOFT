import os
import django
import sys

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models_maintenance_new import ShiftMaintenanceRecord

print("=== 检查维修记录数据 ===")

try:
    # 获取所有维修记录
    records = ShiftMaintenanceRecord.objects.all()
    print(f"找到 {records.count()} 条维修记录")
    
    for record in records:
        print(f"记录ID: {record.id}")
        print(f"  序号: {record.serial_number}")
        print(f"  月份: {record.month}")
        print(f"  期数: {record.phase.name if record.phase else 'None'}")
        print(f"  班次: {record.shift_type.name if record.shift_type else 'None'}")
        print(f"  产线: {record.production_line}")
        print(f"  工序: {record.process}")
        print(f"  设备名称: {record.equipment_name}")
        print(f"  变更原因: {record.change_reason}")
        print("-" * 50)
        
except Exception as e:
    print(f"查询维修记录时出错: {e}")