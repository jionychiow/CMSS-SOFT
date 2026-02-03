from django.contrib.auth.decorators import permission_required
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
from django.contrib.auth import authenticate
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from .models import PlantPhase, Process, ProductionLine


@require_http_methods(["GET"])
def get_all_configurations(request):
    """获取所有配置信息（期数、工序、产线）"""
    try:
        phases = list(PlantPhase.objects.values('id', 'code', 'name'))
        processes = list(Process.objects.values('id', 'code', 'name'))
        production_lines = list(ProductionLine.objects.select_related('phase').values(
            'id', 'code', 'name', 'phase_id', 'phase__name'
        ))
        
        return JsonResponse({
            'phases': phases,
            'processes': processes,
            'production_lines': production_lines
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["POST"])
def add_phase(request):
    """添加期数"""
    try:
        data = json.loads(request.body)
        code = data.get('code')
        name = data.get('name')
        
        if not code or not name:
            return JsonResponse({'error': '期数代码和名称不能为空'}, status=400)
        
        phase = PlantPhase.objects.create(code=code, name=name)
        
        return JsonResponse({
            'id': phase.id,
            'code': phase.code,
            'name': phase.name
        })
    except IntegrityError:
        return JsonResponse({'error': '期数代码已存在'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["PUT"])
def update_phase(request, phase_id):
    """更新期数"""
    try:
        data = json.loads(request.body)
        phase = get_object_or_404(PlantPhase, id=phase_id)
        
        code = data.get('code')
        name = data.get('name')
        
        if not code or not name:
            return JsonResponse({'error': '期数代码和名称不能为空'}, status=400)
        
        phase.code = code
        phase.name = name
        phase.save()
        
        return JsonResponse({
            'id': phase.id,
            'code': phase.code,
            'name': phase.name
        })
    except IntegrityError:
        return JsonResponse({'error': '期数代码已存在'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["DELETE"])
def delete_phase(request, phase_id):
    """删除期数"""
    try:
        phase = get_object_or_404(PlantPhase, id=phase_id)
        
        # 检查是否有产线关联此期数
        if ProductionLine.objects.filter(phase=phase).exists():
            return JsonResponse({
                'error': '无法删除期数，仍有产线关联此期数'
            }, status=400)
        
        phase.delete()
        return JsonResponse({'message': '期数删除成功'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["POST"])
def add_process(request):
    """添加工序"""
    try:
        data = json.loads(request.body)
        code = data.get('code')
        name = data.get('name')
        
        if not code or not name:
            return JsonResponse({'error': '工序代码和名称不能为空'}, status=400)
        
        process = Process.objects.create(code=code, name=name)
        
        return JsonResponse({
            'id': process.id,
            'code': process.code,
            'name': process.name
        })
    except IntegrityError:
        return JsonResponse({'error': '工序代码已存在'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["PUT"])
def update_process(request, process_id):
    """更新工序"""
    try:
        data = json.loads(request.body)
        process = get_object_or_404(Process, id=process_id)
        
        code = data.get('code')
        name = data.get('name')
        
        if not code or not name:
            return JsonResponse({'error': '工序代码和名称不能为空'}, status=400)
        
        process.code = code
        process.name = name
        process.save()
        
        return JsonResponse({
            'id': process.id,
            'code': process.code,
            'name': process.name
        })
    except IntegrityError:
        return JsonResponse({'error': '工序代码已存在'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["DELETE"])
def delete_process(request, process_id):
    """删除工序"""
    try:
        process = get_object_or_404(Process, id=process_id)
        
        # 检查是否有任务计划关联此工序
        from .models import TaskPlan
        if TaskPlan.objects.filter(process=process).exists():
            return JsonResponse({
                'error': '无法删除工序，仍有任务计划关联此工序'
            }, status=400)
        
        process.delete()
        return JsonResponse({'message': '工序删除成功'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["POST"])
def add_production_line(request):
    """添加产线"""
    try:
        data = json.loads(request.body)
        code = data.get('code')
        name = data.get('name')
        phase_id = data.get('phase_id')
        
        if not code or not name or not phase_id:
            return JsonResponse({'error': '产线代码、名称和期数不能为空'}, status=400)
        
        try:
            phase = PlantPhase.objects.get(id=phase_id)
        except PlantPhase.DoesNotExist:
            return JsonResponse({'error': '指定的期数不存在'}, status=400)
        
        production_line = ProductionLine.objects.create(
            code=code,
            name=name,
            phase=phase
        )
        
        return JsonResponse({
            'id': production_line.id,
            'code': production_line.code,
            'name': production_line.name,
            'phase_id': production_line.phase.id,
            'phase_name': production_line.phase.name
        })
    except IntegrityError:
        return JsonResponse({'error': '同一期数内产线代码已存在'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["PUT"])
def update_production_line(request, line_id):
    """更新产线"""
    try:
        data = json.loads(request.body)
        production_line = get_object_or_404(ProductionLine, id=line_id)
        
        code = data.get('code')
        name = data.get('name')
        phase_id = data.get('phase_id')
        
        if not code or not name or not phase_id:
            return JsonResponse({'error': '产线代码、名称和期数不能为空'}, status=400)
        
        try:
            phase = PlantPhase.objects.get(id=phase_id)
        except PlantPhase.DoesNotExist:
            return JsonResponse({'error': '指定的期数不存在'}, status=400)
        
        production_line.code = code
        production_line.name = name
        production_line.phase = phase
        production_line.save()
        
        return JsonResponse({
            'id': production_line.id,
            'code': production_line.code,
            'name': production_line.name,
            'phase_id': production_line.phase.id,
            'phase_name': production_line.phase.name
        })
    except IntegrityError:
        return JsonResponse({'error': '同一期数内产线代码已存在'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["DELETE"])
def delete_production_line(request, line_id):
    """删除产线"""
    try:
        production_line = get_object_or_404(ProductionLine, id=line_id)
        
        # 检查是否有任务计划关联此产线
        from .models import TaskPlan
        if TaskPlan.objects.filter(production_line=production_line).exists():
            return JsonResponse({
                'error': '无法删除产线，仍有任务计划关联此产线'
            }, status=400)
        
        production_line.delete()
        return JsonResponse({'message': '产线删除成功'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)