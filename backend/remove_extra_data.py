#!/usr/bin/env python
"""
删除数据库中多余的产线和工序数据
"""

import os
import sys
import django

# 设置Django环境
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import ProductionLine, Process

def remove_extra_data():
    print("开始删除多余的产线和工序数据...")
    
    # 删除多余的产线数据
    extra_production_lines = ['line_1', 'line_2']
    for code in extra_production_lines:
        try:
            pl = ProductionLine.objects.get(code=code)
            print(f"删除产线: ID {pl.id}, Code: {pl.code}, Name: {pl.name}")
            pl.delete()
        except ProductionLine.DoesNotExist:
            print(f"未找到产线代码: {code}")
    
    # 删除多余的工序数据
    extra_processes = ['process_1', 'process_2']
    for code in extra_processes:
        try:
            proc = Process.objects.get(code=code)
            print(f"删除工序: ID {proc.id}, Code: {proc.code}, Name: {proc.name}")
            proc.delete()
        except Process.DoesNotExist:
            print(f"未找到工序代码: {code}")
    
    print("删除操作完成!")

if __name__ == "__main__":
    remove_extra_data()