from django.core.management.base import BaseCommand
from db.models import PlantPhase, ProductionLine, Process

class Command(BaseCommand):
    help = '添加期数、产线和工序的示例数据'

    def handle(self, *args, **options):
        # 创建期数数据
        phase_1, created = PlantPhase.objects.get_or_create(
            code='phase_1',
            defaults={'name': '一期', 'description': '第一期工程'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created phase: {phase_1.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'Phase already exists: {phase_1.name}'))

        phase_2, created = PlantPhase.objects.get_or_create(
            code='phase_2',
            defaults={'name': '二期', 'description': '第二期工程'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created phase: {phase_2.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'Phase already exists: {phase_2.name}'))

        # 一期产线：1#-10#
        phase_1_lines = ['1#', '2#', '3#', '4#', '5#', '6#', '7#', '8#', '9#', '10#']
        for line_code in phase_1_lines:
            line, created = ProductionLine.objects.get_or_create(
                code=line_code,
                phase=phase_1,
                defaults={'name': line_code, 'description': f'{line_code}产线'}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created production line: {line.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Production line already exists: {line.name}'))

        # 二期产线：2-1#-2-9#
        phase_2_lines = ['2-1#', '2-2#', '2-3#', '2-4#', '2-5#', '2-6#', '2-7#', '2-8#', '2-9#']
        for line_code in phase_2_lines:
            line, created = ProductionLine.objects.get_or_create(
                code=line_code,
                phase=phase_2,
                defaults={'name': line_code, 'description': f'{line_code}产线'}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created production line: {line.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Production line already exists: {line.name}'))

        # 工序数据：PL, N1, N2, S1, F1, F2, CF, B, BZ
        processes_data = [
            {'code': 'PL', 'name': 'PL', 'description': 'PL工序'},
            {'code': 'N1', 'name': 'N1', 'description': 'N1工序'},
            {'code': 'N2', 'name': 'N2', 'description': 'N2工序'},
            {'code': 'S1', 'name': 'S1', 'description': 'S1工序'},
            {'code': 'F1', 'name': 'F1', 'description': 'F1工序'},
            {'code': 'F2', 'name': 'F2', 'description': 'F2工序'},
            {'code': 'CF', 'name': 'CF', 'description': 'CF工序'},
            {'code': 'B', 'name': 'B', 'description': 'B工序'},
            {'code': 'BZ', 'name': 'BZ', 'description': 'BZ工序'},
        ]

        for process_data in processes_data:
            process, created = Process.objects.get_or_create(
                code=process_data['code'],
                defaults=process_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created process: {process.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Process already exists: {process.name}'))

        self.stdout.write(
            self.style.SUCCESS('Successfully added sample data for phases, production lines, and processes!')
        )