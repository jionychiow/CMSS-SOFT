import pandas as pd
import os
from django.core.management.base import BaseCommand
from pathlib import Path

class Command(BaseCommand):
    help = '分析Excel文件结构'

    def handle(self, *args, **options):
        # 获取项目根目录（CMMS-OEE-Software）
        base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
        
        # Excel文件路径
        shift_file = base_dir / "生产一分部倒班交接班记录表.xlsx"
        day_file = base_dir / "生产一分部长白班交接班记录表.xlsx"
        
        self.stdout.write(f"正在分析文件: {shift_file}")
        if shift_file.exists():
            self.analyze_excel_file(shift_file, "生产一分部倒班交接班记录表")
        else:
            self.stdout.write(self.style.ERROR(f"文件不存在: {shift_file}"))
        
        self.stdout.write(f"正在分析文件: {day_file}")
        if day_file.exists():
            self.analyze_excel_file(day_file, "生产一分部长白班交接班记录表")
        else:
            self.stdout.write(self.style.ERROR(f"文件不存在: {day_file}"))

    def analyze_excel_file(self, file_path, sheet_name):
        try:
            # 读取Excel文件的所有工作表
            excel_data = pd.read_excel(file_path, sheet_name=None)
            
            self.stdout.write(self.style.SUCCESS(f"\n=== {sheet_name} ==="))
            
            for sheet_name, df in excel_data.items():
                self.stdout.write(f"\n工作表: {sheet_name}")
                self.stdout.write(f"  行数: {df.shape[0]}, 列数: {df.shape[1]}")
                
                self.stdout.write("  列名:")
                for i, col in enumerate(df.columns):
                    self.stdout.write(f"    {i+1}. {col}")
                
                self.stdout.write("  前3行数据预览:")
                preview_data = df.head(3)
                for idx, row in preview_data.iterrows():
                    self.stdout.write(f"    行 {idx+1}: {dict(row)}")
                
                # 检查是否有空值
                null_counts = df.isnull().sum()
                if null_counts.any():
                    self.stdout.write("  空值统计:")
                    for col, null_count in null_counts.items():
                        if null_count > 0:
                            self.stdout.write(f"    {col}: {null_count} 个空值")
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"读取文件时出错: {str(e)}"))