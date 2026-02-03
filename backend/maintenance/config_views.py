from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ValidationError
from django.db import transaction
import json
from db.models import PlantPhase, ProductionLine, Process, ShiftType
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_config_data(request):
    """获取所有配置数据"""
    try:
        logger.info(f"收到获取配置数据请求，用户: {request.user}")
        
        # 获取所有启用的期数
        phases = PlantPhase.objects.filter(is_active=True).values('code', 'name', 'description')
        logger.info(f"查询到期数: {list(phases)}")
        
        # 获取所有启用的产线，使用关联查询而不是循环查询
        production_lines = ProductionLine.objects.filter(
            is_active=True
        ).select_related('phase').values(
            'id', 'code', 'name', 'phase__code', 'description'
        )
        
        # 转换产线数据格式
        formatted_lines = []
        for line in production_lines:
            formatted_line = {
                'id': line['id'],  # 添加ID字段
                'code': line['code'],
                'name': line['name'],
                'phase_code': line['phase__code'],
                'description': line['description']
            }
            formatted_lines.append(formatted_line)
        
        logger.info(f"查询到产线: {formatted_lines}")
        
        # 获取所有启用的工序
        processes = Process.objects.filter(is_active=True).values('id', 'code', 'name', 'description')
        logger.info(f"查询到工序: {list(processes)}")
        
        # 获取所有启用的班次类型
        shift_types = ShiftType.objects.filter(is_active=True).values('id', 'code', 'name', 'description')
        logger.info(f"查询到班次类型: {list(shift_types)}")
        
        # 获取所有启用的期数
        phases_with_id = PlantPhase.objects.filter(is_active=True).values('id', 'code', 'name', 'description')
        logger.info(f"查询到期数: {list(phases_with_id)}")
        
        response_data = {
            'phases': list(phases_with_id),
            'productionLines': formatted_lines,  # 驼峰命名，与前端期望一致
            'processes': list(processes),
            'shiftTypes': list(shift_types)      # 驸峰命名，与前端期望一致
        }
        
        logger.info(f"返回数据: {response_data}")
        
        return Response(response_data)
    except Exception as e:
        logger.error(f"获取配置数据时出错: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_plant_phase(request):
    """创建工厂分期"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以创建期数'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data
        phase = PlantPhase.objects.create(
            code=data.get('code'),
            name=data.get('name'),
            description=data.get('description', ''),
        )
        
        return Response({
            'id': phase.id,
            'code': phase.code,
            'name': phase.name,
            'description': phase.description,
            'is_active': phase.is_active
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_plant_phase(request, phase_id):
    """更新工厂分期"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以更新期数'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data
        phase = PlantPhase.objects.get(id=phase_id)
        
        phase.name = data.get('name', phase.name)
        phase.code = data.get('code', phase.code)
        phase.description = data.get('description', phase.description)
        phase.is_active = data.get('is_active', phase.is_active)
        phase.save()
        
        return Response({
            'id': phase.id,
            'code': phase.code,
            'name': phase.name,
            'description': phase.description,
            'is_active': phase.is_active
        })
    except PlantPhase.DoesNotExist:
        return Response({'error': '期数不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_plant_phase(request, phase_id):
    """删除工厂分期"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以删除期数'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        phase = PlantPhase.objects.get(id=phase_id)
        
        # 检查是否有相关的产线，如果有则不允许删除
        if ProductionLine.objects.filter(phase=phase).exists():
            return Response({
                'error': '该期数下存在产线，无法删除。请先删除相关产线。'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        phase.delete()
        return Response({'message': '期数删除成功'})
    except PlantPhase.DoesNotExist:
        return Response({'error': '期数不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_production_line(request):
    """创建产线"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以创建产线'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data
        phase = PlantPhase.objects.get(code=data.get('phase_code'))
        
        line = ProductionLine.objects.create(
            code=data.get('code'),
            name=data.get('name'),
            phase=phase,
            description=data.get('description', ''),
        )
        
        return Response({
            'id': line.id,
            'code': line.code,
            'name': line.name,
            'phase_code': line.phase.code,
            'phase_name': line.phase.name,
            'description': line.description,
            'is_active': line.is_active
        }, status=status.HTTP_201_CREATED)
    except PlantPhase.DoesNotExist:
        return Response({'error': '指定的期数不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_production_line(request, line_id):
    """更新产线"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以更新产线'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data
        line = ProductionLine.objects.get(id=line_id)
        
        if 'phase_code' in data:
            phase = PlantPhase.objects.get(code=data.get('phase_code'))
            line.phase = phase
        
        line.name = data.get('name', line.name)
        line.code = data.get('code', line.code)
        line.description = data.get('description', line.description)
        line.is_active = data.get('is_active', line.is_active)
        line.save()
        
        return Response({
            'id': line.id,
            'code': line.code,
            'name': line.name,
            'phase_code': line.phase.code,
            'phase_name': line.phase.name,
            'description': line.description,
            'is_active': line.is_active
        })
    except ProductionLine.DoesNotExist:
        return Response({'error': '产线不存在'}, status=status.HTTP_404_NOT_FOUND)
    except PlantPhase.DoesNotExist:
        return Response({'error': '指定的期数不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_production_line(request, line_id):
    """删除产线"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以删除产线'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        line = ProductionLine.objects.get(id=line_id)
        line.delete()
        return Response({'message': '产线删除成功'})
    except ProductionLine.DoesNotExist:
        return Response({'error': '产线不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_process(request):
    """创建工序"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以创建工序'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data
        process = Process.objects.create(
            code=data.get('code'),
            name=data.get('name'),
            description=data.get('description', ''),
        )
        
        return Response({
            'id': process.id,
            'code': process.code,
            'name': process.name,
            'description': process.description,
            'is_active': process.is_active
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_shift_type(request):
    """创建班次类型"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以创建班次类型'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data
        shift_type = ShiftType.objects.create(
            code=data.get('code'),
            name=data.get('name'),
            description=data.get('description', ''),
        )
        
        return Response({
            'id': shift_type.id,
            'code': shift_type.code,
            'name': shift_type.name,
            'description': shift_type.description,
            'is_active': shift_type.is_active
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_shift_type(request, shift_type_id):
    """更新班次类型"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以更新班次类型'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        shift_type = ShiftType.objects.get(id=shift_type_id)
        data = request.data
        
        shift_type.code = data.get('code', shift_type.code)
        shift_type.name = data.get('name', shift_type.name)
        shift_type.description = data.get('description', shift_type.description)
        
        shift_type.save()
        
        return Response({
            'id': shift_type.id,
            'code': shift_type.code,
            'name': shift_type.name,
            'description': shift_type.description,
            'is_active': shift_type.is_active
        })
    except ShiftType.DoesNotExist:
        return Response({'error': '班次类型不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_shift_type(request, shift_type_id):
    """删除班次类型"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以删除班次类型'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        shift_type = ShiftType.objects.get(id=shift_type_id)
        shift_type.delete()
        return Response({'message': '班次类型删除成功'})
    except ShiftType.DoesNotExist:
        return Response({'error': '班次类型不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_process(request, process_id):
    """更新工序"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以更新工序'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data
        process = Process.objects.get(id=process_id)
        
        process.name = data.get('name', process.name)
        process.code = data.get('code', process.code)
        process.description = data.get('description', process.description)
        process.is_active = data.get('is_active', process.is_active)
        process.save()
        
        return Response({
            'id': process.id,
            'code': process.code,
            'name': process.name,
            'description': process.description,
            'is_active': process.is_active
        })
    except Process.DoesNotExist:
        return Response({'error': '工序不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_process(request, process_id):
    """删除工序"""
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以删除工序'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        process = Process.objects.get(id=process_id)
        process.delete()
        return Response({'message': '工序删除成功'})
    except Process.DoesNotExist:
        return Response({'error': '工序不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)