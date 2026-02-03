from django.core.management.base import BaseCommand
from django.conf import settings
import os
from ...utils import import_maintenance_records_from_excel


class Command(BaseCommand):
    help = '从Excel文件导入维修记录'

    def add_arguments(self, parser):
        parser.add_argument('--file', type=str, help='Excel文件路径')
        parser.add_argument('--shift-type', type=str, choices=['long_day_shift', 'rotating_shift'], 
                          help='班次类型: long_day_shift 或 rotating_shift')
        parser.add_argument('--plant-phase', type=str, choices=['phase_1', 'phase_2'], 
                          help='工厂分期: phase_1 或 phase_2')

    def handle(self, *args, **options):
        file_path = options['file']
        shift_type = options['shift_type']
        plant_phase = options['plant_phase']

        if not file_path:
            # 如果没有提供文件路径，则尝试使用默认的Excel文件
            base_path = settings.BASE_DIR.parent  # 项目根目录
            excel_files = [
                os.path.join(base_path, "生产一分部倒班交接班记录表.xlsx"),
                os.path.join(base_path, "生产一分部长白班交接班记录表.xlsx")
            ]
            
            found_file = None
            for excel_file in excel_files:
                if os.path.exists(excel_file):
                    found_file = excel_file
                    # 根据文件名推断班次类型
                    if "倒班" in excel_file and not shift_type:
                        shift_type = 'rotating_shift'
                    elif "长白班" in excel_file and not shift_type:
                        shift_type = 'long_day_shift'
                    break
            
            if not found_file:
                self.stdout.write(
                    self.style.ERROR('未找到Excel文件。请提供 --file 参数指定Excel文件路径')
                )
                return
            
            file_path = found_file
            self.stdout.write(f'找到Excel文件: {file_path}')

        if not shift_type:
            self.stdout.write(
                self.style.ERROR('请提供 --shift-type 参数指定班次类型 (long_day_shift 或 rotating_shift)')
            )
            return

        if not plant_phase:
            self.stdout.write(
                self.style.ERROR('请提供 --plant-phase 参数指定工厂分期 (phase_1 或 phase_2)')
            )
            return

        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(f'文件不存在: {file_path}')
            )
            return

        self.stdout.write(f'开始导入Excel文件: {file_path}')
        self.stdout.write(f'班次类型: {shift_type}')
        self.stdout.write(f'工厂分期: {plant_phase}')

        result = import_maintenance_records_from_excel(file_path, shift_type, plant_phase)

        if result['success']:
            self.stdout.write(
                self.style.SUCCESS(f'成功导入 {result["imported_count"]} 条记录')
            )
            if result['errors']:
                self.stdout.write(
                    self.style.WARNING(f'出现 {len(result["errors"])} 个错误:')
                )
                for error in result['errors']:
                    self.stdout.write(f'  - {error}')
        else:
            self.stdout.write(
                self.style.ERROR(f'导入失败: {result["errors"][0]}')
            )