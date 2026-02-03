from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Count
from django.http import JsonResponse
from db.models_maintenance_new import ShiftMaintenanceRecord
from db.serializers_new import ShiftMaintenanceRecordSerializer


class ShiftMaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = ShiftMaintenanceRecord.objects.all()
    serializer_class = ShiftMaintenanceRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['production_line', 'process', 'change_reason']
    search_fields = ['equipment_name', 'equipment_number', 'before_change', 'after_change']
    ordering_fields = ['created_at', 'start_datetime', 'end_datetime', 'duration']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        phase_code = self.request.query_params.get('phase', None)
        shift_type_code = self.request.query_params.get('shift_type', None)

        if phase_code:
            from db.models import PlantPhase
            try:
                # 首先检查期数代码是否存在
                phase_obj = PlantPhase.objects.get(code=phase_code)
                queryset = queryset.filter(phase=phase_obj)
            except PlantPhase.DoesNotExist:
                # 如果期数不存在，则返回空查询集
                from django.db.models import Q
                queryset = queryset.filter(Q(pk__in=[]))  # 返回空查询集
        if shift_type_code:
            from db.models import ShiftType
            try:
                # 首先检查班次类型代码是否存在
                shift_obj = ShiftType.objects.get(code=shift_type_code)
                queryset = queryset.filter(shift_type=shift_obj)
            except ShiftType.DoesNotExist:
                # 如果班次类型不存在，则返回空查询集
                from django.db.models import Q
                queryset = queryset.filter(Q(pk__in=[]))  # 返回空查询集

        return queryset

    def get_stats_by_phase_and_shift(self, request):
        """统计每个phase和shift_type组合的记录数"""
        stats = ShiftMaintenanceRecord.objects.values('phase', 'shift_type').annotate(count=Count('id'))
        result = {}
        for stat in stats:
            phase = stat['phase']
            shift_type = stat['shift_type']
            count = stat['count']
            if phase not in result:
                result[phase] = {}
            result[phase][shift_type] = count
        return JsonResponse(result)