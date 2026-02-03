from django.core.management.base import BaseCommand
from db.models_maintenance_new import ShiftMaintenanceRecord


class Command(BaseCommand):
    help = '清空所有维修记录'

    def handle(self, *args, **options):
        count = ShiftMaintenanceRecord.objects.count()
        ShiftMaintenanceRecord.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'成功删除 {count} 条维修记录')
        )