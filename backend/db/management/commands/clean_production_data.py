from django.core.management.base import BaseCommand
from db.models_maintenance import MaintenanceRecord, MaintenanceManual, MaintenanceStep, MaintenanceCase
from db.models_maintenance_new import ShiftMaintenanceRecord
from db.models_task_plan import TaskPlan
from db.models import Asset


class Command(BaseCommand):
    help = '清空生产环境数据，准备正式上线'

    def handle(self, *args, **options):
        # 清理班次维修记录
        shift_maintenance_count = ShiftMaintenanceRecord.objects.count()
        ShiftMaintenanceRecord.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'已删除 {shift_maintenance_count} 条班次维修记录')
        )
        
        # 清理旧维修记录
        maintenance_count = MaintenanceRecord.objects.count()
        MaintenanceRecord.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'已删除 {maintenance_count} 条维修记录')
        )
        
        # 清理维修手册步骤
        step_count = MaintenanceStep.objects.count()
        MaintenanceStep.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'已删除 {step_count} 条维修步骤')
        )
        
        # 清理维修手册
        manual_count = MaintenanceManual.objects.count()
        MaintenanceManual.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'已删除 {manual_count} 条维修手册')
        )
        
        # 清理维修案例
        case_count = MaintenanceCase.objects.count()
        MaintenanceCase.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'已删除 {case_count} 条维修案例')
        )
        
        # 清理任务计划
        task_count = TaskPlan.objects.count()
        TaskPlan.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'已删除 {task_count} 条任务计划')
        )
        
        # 清理资产（设备总数）
        asset_count = Asset.objects.count()
        Asset.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'已删除 {asset_count} 条资产记录')
        )
        
        self.stdout.write(
            self.style.SUCCESS('数据清理完成！现在可以开始正式上线了！')
        )