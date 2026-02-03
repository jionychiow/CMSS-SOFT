import os
import sys
import django

# 设置Django环境
sys.path.append(r'e:\CMMS-OEE-Software\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def get_phase_ids():
    from db.models import PlantPhase
    
    print("期别ID映射:")
    for phase in PlantPhase.objects.all():
        print(f"  {phase.name} -> ID: {phase.id}")

def get_process_ids():
    from db.models import Process
    
    print("\n工序ID映射:")
    for proc in Process.objects.all():
        print(f"  {proc.name} -> ID: {proc.id}")

def get_production_line_ids():
    from db.models import ProductionLine
    
    print("\n产线ID映射:")
    for pl in ProductionLine.objects.all()[:10]:  # 只显示前10个
        print(f"  {pl.name} -> ID: {pl.id}")

if __name__ == '__main__':
    get_phase_ids()
    get_process_ids()
    get_production_line_ids()