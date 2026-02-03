from django.core.management.base import BaseCommand
from db.models_maintenance import MaintenanceRecord


class Command(BaseCommand):
    help = '清空所有旧的维修记录'

    def handle(self, *args, **options):
        count = MaintenanceRecord.objects.count()
        MaintenanceRecord.objects.all().delete()
        self.stdout.write(
            self.style.SUCCESS(f'成功删除 {count} 条旧维修记录')
        )