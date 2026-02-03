import os
import django
import sys

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from db.models import PlantPhase, ProductionLine, Process, Asset

print("=== 开始修复资产数据关联 ===")

# 获取所有配置数据
phases = {p.code: p for p in PlantPhase.objects.all()}
lines = {l.code: l for l in ProductionLine.objects.all()}
processes = {p.code: p for p in Process.objects.all()}

print(f"可用期数: {list(phases.keys())}")
print(f"可用产线: {list(lines.keys())}")
print(f"可用工序: {list(processes.keys())}")

# 获取所有资产
assets = Asset.objects.all()
updated_count = 0

for asset in assets:
    print(f"\n处理资产: {asset.name}")
    
    # 根据资产名称尝试推断配置
    asset_name = asset.name.lower()
    
    # 推断期数 - 如果名称包含"1-"可能是二期，否则默认一期
    if "2-" in asset_name or "二期" in asset_name:
        asset.phase = phases.get('phase_2')
        print(f"  -> 设置期数: 二期 (phase_2)")
    elif "1-" in asset_name or "一期" in asset_name or "#生产线" in asset_name:
        asset.phase = phases.get('phase_1')
        print(f"  -> 设置期数: 一期 (phase_1)")
    
    # 推断产线 - 根据名称中的数字和模式
    if "1-1#" in asset_name or "1#" in asset_name:
        asset.production_line = lines.get('1#')
        print(f"  -> 设置产线: 1#")
    elif "2-1#" in asset_name or "2-1" in asset_name:
        asset.production_line = lines.get('2-1#')
        print(f"  -> 设置产线: 2-1#")
    elif "2-2#" in asset_name or "2-2" in asset_name:
        asset.production_line = lines.get('2-2#')
        print(f"  -> 设置产线: 2-2#")
    elif "2-3#" in asset_name or "2-3" in asset_name:
        asset.production_line = lines.get('2-3#')
        print(f"  -> 设置产线: 2-3#")
    elif "2-4#" in asset_name or "2-4" in asset_name:
        asset.production_line = lines.get('2-4#')
        print(f"  -> 设置产线: 2-4#")
    elif "2-5#" in asset_name or "2-5" in asset_name:
        asset.production_line = lines.get('2-5#')
        print(f"  -> 设置产线: 2-5#")
    elif "2-6#" in asset_name or "2-6" in asset_name:
        asset.production_line = lines.get('2-6#')
        print(f"  -> 设置产线: 2-6#")
    elif "2-7#" in asset_name or "2-7" in asset_name:
        asset.production_line = lines.get('2-7#')
        print(f"  -> 设置产线: 2-7#")
    elif "2-8#" in asset_name or "2-8" in asset_name:
        asset.production_line = lines.get('2-8#')
        print(f"  -> 设置产线: 2-8#")
    elif "2-9#" in asset_name or "2-9" in asset_name:
        asset.production_line = lines.get('2-9#')
        print(f"  -> 设置产线: 2-9#")
    
    # 对于一般的生产线设备，如果没有明确指定产线，可以基于期数分配默认产线
    if not asset.production_line and asset.phase:
        if asset.phase.code == 'phase_1':
            # 分配一期的第一个产线
            phase_1_lines = [l for l in lines.values() if l.phase.code == 'phase_1']
            if phase_1_lines:
                asset.production_line = phase_1_lines[0]
                print(f"  -> 设置产线: {phase_1_lines[0].name} (基于期数自动分配)")
        elif asset.phase.code == 'phase_2':
            # 分配二期的第一个产线
            phase_2_lines = [l for l in lines.values() if l.phase.code == 'phase_2']
            if phase_2_lines:
                asset.production_line = phase_2_lines[0]
                print(f"  -> 设置产线: {phase_2_lines[0].name} (基于期数自动分配)")
    
    # 推断工序 - 使用默认工序或根据名称推断
    if not asset.process:
        # 默认设置为PL工序
        asset.process = processes.get('PL')
        print(f"  -> 设置工序: PL (默认)")
    
    # 保存更改
    asset.save()
    updated_count += 1
    
    print(f"  最终状态 - 期数: {asset.phase.name if asset.phase else 'None'}, "
          f"工序: {asset.process.name if asset.process else 'None'}, "
          f"产线: {asset.production_line.name if asset.production_line else 'None'}")

print(f"\n=== 数据修复完成 ===")
print(f"共更新了 {updated_count} 个资产记录")