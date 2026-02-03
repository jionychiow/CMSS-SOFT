#!/usr/bin/env python
"""Script to check existing phase, process, and production line data"""
import os
import sys
import django
from django.conf import settings

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import PlantPhase, Process, ProductionLine

print("=== Plant Phases ===")
phases = PlantPhase.objects.all()
for phase in phases:
    print(f"Name: {phase.name}, Code: {phase.code}, ID: {phase.uuid}")

print("\n=== Processes ===")
processes = Process.objects.all()
for process in processes:
    print(f"Name: {process.name}, Code: {process.code}, ID: {process.uuid}")

print("\n=== Production Lines ===")
lines = ProductionLine.objects.all()
for line in lines:
    print(f"Name: {line.name}, Code: {line.code}, ID: {line.uuid}")