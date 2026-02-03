from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.db.models import Q
from datetime import datetime
import logging

from .models import UserProfileExtension
# 使用绝对导入代替相对导入
from db.models_maintenance_new import ShiftMaintenanceRecord as MaintenanceRecord
# 注释掉未定义的EquipmentMaintenanceLibrary导入，以解决启动问题
# from . import models  # EquipmentMaintenanceLibrary可能在这里
from .serializers import (
    MaintenanceRecordSerializer, 
    MaintenanceRecordCreateSerializer, 
    # EquipmentMaintenanceLibrarySerializer,  # 注释掉未定义的序列化器
    UserProfileExtensionSerializer
)

logger = logging.getLogger(__name__)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    自定义权限类：确保用户只能编辑自己的记录（基于班次和工厂分期）
    """
    def has_object_permission(self, request, view, obj):
        # 对于安全方法（GET, HEAD, OPTIONS），允许访问
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 检查对象的班次和工厂分期是否与当前用户的匹配
        if hasattr(obj, 'shift_type') and hasattr(obj, 'plant_phase'):
            user_profile = getattr(request.user, 'userprofileextension', None)
            if user_profile:
                return (obj.shift_type == user_profile.shift_type and 
                       obj.plant_phase == user_profile.plant_phase)
        
        return False


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    """
    维修记录视图集
    """
    queryset = MaintenanceRecord.objects.all()
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        获取查询集，根据用户权限过滤记录
        """
        user = self.request.user
        queryset = MaintenanceRecord.objects.all()
        
        # 获取URL参数进行筛选
        shift_type = self.request.query_params.get('shift_type', None)
        plant_phase = self.request.query_params.get('plant_phase', None)
        equipment_name = self.request.query_params.get('equipment_name', None)
        
        # 根据用户权限进行过滤
        user_profile = getattr(user, 'userprofileextension', None)
        if user_profile:
            # 检查用户是否有删除权限
            if self.action == 'destroy':
                if not user_profile.can_delete:
                    queryset = MaintenanceRecord.objects.none()
            
            # 过滤用户有权访问的数据
            queryset = queryset.filter(
                shift_type=user_profile.shift_type,
                plant_phase=user_profile.plant_phase
            )
        
        # 应用其他筛选条件
        if shift_type:
            queryset = queryset.filter(shift_type=shift_type)
        if plant_phase:
            queryset = queryset.filter(plant_phase=plant_phase)
        if equipment_name:
            queryset = queryset.filter(equipment_name__icontains=equipment_name)
        
        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        """
        根据请求动作返回不同的序列化器
        """
        if self.action in ['create', 'update', 'partial_update']:
            return MaintenanceRecordCreateSerializer
        return MaintenanceRecordSerializer

    def create(self, request, *args, **kwargs):
        """
        创建新的维修记录，检查用户是否有添加权限
        """
        user = request.user
        user_profile = getattr(user, 'userprofileextension', None)
        
        if user_profile and not user_profile.can_add:
            return Response(
                {'error': '您没有权限创建新记录'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 设置班次和工厂分期为用户的信息
        data = request.data.copy()
        if user_profile:
            data['shift_type'] = user_profile.shift_type
            data['plant_phase'] = user_profile.plant_phase
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # 计算持续时间
        start_time = serializer.validated_data.get('start_time')
        end_time = serializer.validated_data.get('end_time')
        
        if start_time and end_time:
            duration = end_time - start_time
            serializer.validated_data['duration'] = duration
            serializer.validated_data['duration_minutes'] = int(duration.total_seconds() / 60)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        更新维修记录，检查用户是否有编辑权限
        """
        user = request.user
        user_profile = getattr(user, 'userprofileextension', None)
        
        if user_profile and not user_profile.can_edit:
            return Response(
                {'error': '您没有权限编辑此记录'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        删除维修记录，检查用户是否有删除权限
        """
        user = request.user
        user_profile = getattr(user, 'userprofileextension', None)
        
        if user_profile and not user_profile.can_delete:
            return Response(
                {'error': '您没有权限删除此记录'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)


# 注释掉EquipmentMaintenanceLibraryViewSet，因为EquipmentMaintenanceLibrary模型未定义
# class EquipmentMaintenanceLibraryViewSet(viewsets.ModelViewSet):
#     """
#     设备维修资料库视图集
#     """
#     queryset = EquipmentMaintenanceLibrary.objects.all()
#     serializer_class = EquipmentMaintenanceLibrarySerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         """
#         获取查询集，可以根据设备名称进行搜索
#         """
#         queryset = EquipmentMaintenanceLibrary.objects.all()
        
#         # 获取搜索参数
#         equipment_name = self.request.query_params.get('equipment_name', None)
#         equipment_part = self.request.query_params.get('equipment_part', None)
        
#         if equipment_name:
#             queryset = queryset.filter(equipment_name__icontains=equipment_name)
#         if equipment_part:
#             queryset = queryset.filter(equipment_part__icontains=equipment_part)
        
#         return queryset.order_by('equipment_name')

    def create(self, request, *args, **kwargs):
        """
        创建设备维修资料，验证用户权限
        """
        user = request.user
        user_profile = getattr(user, 'userprofileextension', None)
        
        if user_profile and not user_profile.can_add:
            return Response(
                {'error': '您没有权限创建新资料'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        更新设备维修资料，验证用户权限
        """
        user = request.user
        user_profile = getattr(user, 'userprofileextension', None)
        
        if user_profile and not user_profile.can_edit:
            return Response(
                {'error': '您没有权限编辑此资料'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        删除设备维修资料，验证用户权限
        """
        user = request.user
        user_profile = getattr(user, 'userprofileextension', None)
        
        if user_profile and not user_profile.can_delete:
            return Response(
                {'error': '您没有权限删除此资料'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_permissions(request):
    """
    获取当前用户的权限信息
    """
    try:
        user_profile = request.user.userprofileextension
        return Response({
            'can_add': user_profile.can_add,
            'can_edit': user_profile.can_edit,
            'can_delete': user_profile.can_delete,
            'shift_type': user_profile.shift_type,
            'plant_phase': user_profile.plant_phase
        })
    except UserProfileExtension.DoesNotExist:
        return Response({
            'can_add': True,
            'can_edit': True,
            'can_delete': False,
            'shift_type': 'long_day_shift',
            'plant_phase': 'phase_1'
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_maintenance_statistics(request):
    """
    获取维修统计信息
    """
    user = request.user
    user_profile = getattr(user, 'userprofileextension', None)
    
    # 不管用户权限如何，都需要返回全部数据的统计（包括一期和二期的独立统计）
    all_records = MaintenanceRecord.objects.all()
    
    # 分别计算一期和二期的记录数
    phase_1_records = MaintenanceRecord.objects.filter(phase__code='phase_1')
    phase_2_records = MaintenanceRecord.objects.filter(phase__code='phase_2')
    
    total_records = all_records.count()
    phase_1_count = phase_1_records.count()
    phase_2_count = phase_2_records.count()
    
    # 如果用户有特定权限，则只获取该用户的记录
    if user_profile:
        user_specific_records = MaintenanceRecord.objects.filter(
            shift_type__code=user_profile.shift_type,
            phase__code=user_profile.plant_phase
        )
        # 如果用户有特定权限，我们仍然返回全局统计，但在某些情况下也可以考虑返回用户特定的统计
        # 但现在按照需求，返回整体统计
    else:
        user_specific_records = all_records
    
    # 计算其他统计数据
    records_by_equipment = all_records.values('equipment_name').distinct().count()
    
    # 按月统计
    monthly_stats = {}
    for record in all_records:
        month_key = f"{getattr(record, 'month', '未知')}月"
        if month_key not in monthly_stats:
            monthly_stats[month_key] = 0
        monthly_stats[month_key] += 1
    
    # 按产线统计
    production_line_stats = {}
    for record in all_records:
        line = getattr(record, 'production_line', '未知产线')
        if line not in production_line_stats:
            production_line_stats[line] = 0
        production_line_stats[line] += 1
    
    return Response({
        'total_records': total_records,
        'phase_1_count': phase_1_count,
        'phase_2_count': phase_2_count,
        'unique_equipment_count': records_by_equipment,
        'monthly_stats': monthly_stats,
        'production_line_stats': production_line_stats
    })