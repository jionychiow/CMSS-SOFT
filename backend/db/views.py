from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from .models import Asset, Organization, UserProfile, MaintenancePlan, PlantPhase, Process, ProductionLine
from .models_maintenance import MaintenanceRecord, MaintenanceManual, MaintenanceCase, MaintenanceStep
from rest_framework.viewsets import ModelViewSet
from .serializers import (
    MaintenanceRecordSerializer, 
    MaintenanceManualSerializer, 
    MaintenanceCaseSerializer,
    MaintenanceStepSerializer,
    AssetSerializer,
    OrganizationSerializer,
    UserProfileSerializer,
    MaintenancePlanSerializer
)
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.db.models import Q
import json


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.all()
    serializer_class = MaintenanceRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['phase', 'shift', 'production_line', 'status', 'asset']
    search_fields = ['title', 'description', 'asset__name']
    ordering_fields = ['start_time', 'created_at', 'updated_at']
    ordering = ['-start_time']

    def get_queryset(self):
        """
        根据用户的班次权限过滤记录
        用户只能看到自己班次的记录
        """
        queryset = super().get_queryset()
        
        # 如果用户不是管理员，则根据班次权限过滤
        if self.request.user.is_authenticated:
            user_profile = getattr(self.request.user, 'userprofile', None)
            
            # 对于非管理员用户，可以根据其相关信息进行权限控制
            # 这里可以根据实际需求调整权限逻辑
            if user_profile and user_profile.type != 'Admin':
                # 普通用户只能看到自己的记录或作为助手参与的记录
                queryset = queryset.filter(
                    Q(main_operator=self.request.user) | 
                    Q(assistant_operators=self.request.user)
                ).distinct()
        
        return queryset

    def perform_create(self, serializer):
        """在创建时自动设置创建者"""
        serializer.save()


import logging

logger = logging.getLogger(__name__)

class MaintenanceManualViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceManual.objects.prefetch_related('steps')
    serializer_class = MaintenanceManualSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['production_line', 'process', 'equipment_name']
    search_fields = ['title', 'description', 'equipment_name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def create(self, request, *args, **kwargs):
        logger.info(f"MaintenanceManual create request data: {request.data}")
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error creating MaintenanceManual: {str(e)}", exc_info=True)
            logger.error(f"Request data: {request.data}")
            raise

    def update(self, request, *args, **kwargs):
        logger.info(f"MaintenanceManual update request data: {request.data}")
        logger.info(f"MaintenanceManual update instance ID: {self.kwargs.get('pk')}")
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error updating MaintenanceManual: {str(e)}", exc_info=True)
            logger.error(f"Request data: {request.data}")
            logger.error(f"Instance ID: {self.kwargs.get('pk')}")
            raise


class MaintenanceStepViewSet(ModelViewSet):
    queryset = MaintenanceStep.objects.all()
    serializer_class = MaintenanceStepSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['manual', 'step_number']
    search_fields = ['title', 'description']
    ordering_fields = ['step_number', 'created_at', 'updated_at']
    ordering = ['manual', 'step_number']

    def perform_create(self, serializer):
        """在创建时验证步骤序号的唯一性"""
        manual = serializer.validated_data.get('manual')
        step_number = serializer.validated_data.get('step_number')
        
        # 调试：打印接收到的数据
        print(f"DEBUG: Creating step with data: {serializer.validated_data.keys()}")
        print(f"DEBUG: Image received: {'image' in serializer.validated_data and bool(serializer.validated_data.get('image'))}")
        print(f"DEBUG: Video received: {'video' in serializer.validated_data and bool(serializer.validated_data.get('video'))}")
        
        # 检查同一手册中是否已存在相同步骤序号
        if MaintenanceStep.objects.filter(manual=manual, step_number=step_number).exists():
            raise ValidationError(f'手册 {manual.title} 中已存在步骤序号 {step_number}')
        
        serializer.save()

    def perform_update(self, serializer):
        """在更新时验证步骤序号的唯一性"""
        # 调试：打印接收到的数据
        print(f"DEBUG: Updating step with data: {serializer.validated_data.keys()}")
        print(f"DEBUG: Raw request data keys: {list(self.request.data.keys()) if hasattr(self.request, 'data') else 'No data attribute'}")
        print(f"DEBUG: Image received: {'image' in serializer.validated_data and bool(serializer.validated_data.get('image'))}")
        print(f"DEBUG: Video received: {'video' in serializer.validated_data and bool(serializer.validated_data.get('video'))}")
        
        # 更详细的调试信息
        if hasattr(self.request, 'data'):
            for key in self.request.data.keys():
                value = self.request.data[key]
                print(f"DEBUG: Request data - {key}: {type(value)} = {value}")
        
        instance = serializer.save()
        manual = instance.manual
        step_number = instance.step_number
        
        # 检查同一手册中是否已存在相同步骤序号（排除当前实例）
        if MaintenanceStep.objects.filter(
            manual=manual, 
            step_number=step_number
        ).exclude(id=instance.id).exists():
            raise ValidationError(f'手册 {manual.title} 中已存在步骤序号 {step_number}')
        
        serializer.save()

    def get_queryset(self):
        """根据权限过滤手册"""
        queryset = super().get_queryset()
        
        # 非管理员用户可以根据权限限制访问
        if self.request.user.is_authenticated:
            user_profile = getattr(self.request.user, 'userprofile', None)
            
            if user_profile and user_profile.type != 'Admin':
                # 可以根据组织或其他条件进一步过滤
                if hasattr(self.request.user, 'organization'):
                    queryset = queryset.filter(organization=self.request.user.organization)
        
        return queryset


class MaintenanceCaseViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceCase.objects.all()
    serializer_class = MaintenanceCaseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['process', 'equipment_name']
    search_fields = ['equipment_name', 'fault_reason', 'fault_phenomenon', 'fault_handling_method']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """根据权限过滤案例"""
        queryset = super().get_queryset()
        
        # 非管理员用户可以根据权限限制访问
        if self.request.user.is_authenticated:
            user_profile = getattr(self.request.user, 'userprofile', None)
            
            if user_profile and user_profile.type != 'Admin':
                # 可以根据组织或其他条件进一步过滤
                if hasattr(self.request.user, 'organization'):
                    queryset = queryset.filter(organization=self.request.user.organization)
        
        return queryset

    def perform_create(self, serializer):
        """在创建时自动设置创建者"""
        serializer.save(created_by=self.request.user)


# 现有的视图保持不变
class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['asset_type', 'status', 'location']
    search_fields = ['name', 'ref', 'serial_number']
    ordering_fields = ['created_at', 'last_updated_at', 'name']
    ordering = ['-created_at']

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class MaintenancePlanViewSet(viewsets.ModelViewSet):
    queryset = MaintenancePlan.objects.all()
    serializer_class = MaintenancePlanSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'type', 'priority', 'asset']
    search_fields = ['name', 'ref', 'instructions']
    ordering_fields = ['planned_starting_date', 'planned_finished', 'created_at']
    ordering = ['-created_at']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    """
    获取所有用户列表，返回 id 和 username
    """
    users = User.objects.all().values('id', 'username', 'first_name', 'last_name')
    return Response(list(users))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_phases(request):
    """
    获取所有期别列表，返回 id 和 name
    """
    phases = PlantPhase.objects.all().values('id', 'name', 'code')
    return Response(list(phases))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_processes(request):
    """
    获取所有工序列表，返回 id 和 name
    """
    processes = Process.objects.all().values('id', 'name', 'code')
    return Response(list(processes))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_production_lines(request):
    """
    获取所有产线列表，返回 id、name、code 和关联的期别信息
    """
    production_lines = ProductionLine.objects.select_related('phase').all().values('id', 'name', 'code', 'phase')
    return Response(list(production_lines))