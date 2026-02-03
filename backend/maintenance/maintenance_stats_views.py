from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta, datetime
from db.models_maintenance_new import ShiftMaintenanceRecord as MaintenanceRecord
from db.models import PlantPhase, Process, ProductionLine
import calendar

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_maintenance_rate_stats(request):
    """
    获取维修率统计数据
    参数:
    - phase_id: 期别ID (可选)
    - process_id: 工段ID (可选)
    - production_line_id: 产线ID (可选)
    - period: 时间周期 ('month', 'quarter', 'year') 默认为'month'
    """
    try:
        # 获取查询参数
        phase_id = request.GET.get('phase_id')
        process_id = request.GET.get('process_id')
        production_line_id = request.GET.get('production_line_id')
        period = request.GET.get('period', 'month')
        
        # 转换ID参数为整数，如果转换失败则设为None
        try:
            process_id = int(process_id) if process_id else None
        except (ValueError, TypeError):
            process_id = None
            
        try:
            production_line_id = int(production_line_id) if production_line_id else None
        except (ValueError, TypeError):
            production_line_id = None
        
        # 导入模型类
        from db.models import Process, ProductionLine
        
        # 构建查询条件
        query_filter = Q()
        
        if phase_id:
            query_filter &= Q(phase__code=phase_id)  # ShiftMaintenanceRecord通过外键关联PlantPhase，使用__code查询
        if process_id is not None:
            # ShiftMaintenanceRecord的process字段是字符串字段，但前端传递的是ID，需要先获取名称
            try:
                process_obj = Process.objects.get(id=process_id)
                query_filter &= Q(process=process_obj.name)
            except Process.DoesNotExist:
                # 如果找不到对应的Process，就不添加这个过滤条件（相当于不过滤）
                pass
        if production_line_id is not None:
            # ShiftMaintenanceRecord的production_line字段是字符串字段，但前端传递的是ID，需要先获取名称
            try:
                production_line_obj = ProductionLine.objects.get(id=production_line_id)
                query_filter &= Q(production_line=production_line_obj.name)
            except ProductionLine.DoesNotExist:
                # 如果找不到对应的ProductionLine，就不添加这个过滤条件（相当于不过滤）
                pass
        
        # 根据时间周期确定日期范围
        end_date = timezone.now()
        
        if period == 'month':
            start_date = end_date - timedelta(days=30)
        elif period == 'quarter':
            start_date = end_date - timedelta(days=90)
        elif period == 'year':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)  # 默认为月
        
        query_filter &= Q(created_at__range=[start_date, end_date])
        
        # 获取维修案例数据
        maintenance_cases = MaintenanceRecord.objects.filter(query_filter)
        
        # 统计维修记录数量
        total_maintenance_count = maintenance_cases.count()
        
        from django.db.models import DateField
        from django.db.models.functions import Cast, TruncDate
        
        # 按日期分组统计（用于折线图）
        daily_stats = maintenance_cases.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            count=Count('pk')
        ).order_by('date')
        
        # 获取相关的资产信息（用于分析不同工段和产线的维修率）
        asset_stats = maintenance_cases.values(
            'process',  # ShiftMaintenanceRecord直接有process字段
            'production_line',  # ShiftMaintenanceRecord直接有production_line字段
            'phase__name'  # ShiftMaintenanceRecord通过外键关联phase，使用__name获取名称
        ).annotate(
            count=Count('pk')
        ).order_by('-count')
        
        # 准备图表数据
        line_chart_data = []
        bar_chart_data = []
        
        # 处理折线图数据（按日期）
        for stat in daily_stats:
            date_value = stat['date']
            if date_value:
                date_str = date_value.strftime('%Y-%m-%d')
            else:
                date_str = 'Unknown'
            line_chart_data.append({
                'date': date_str,
                'count': stat['count']
            })
        
        # 处理柱状图数据（按工段和产线）
        for stat in asset_stats:
            bar_chart_data.append({
                'process': stat['process'] or '未知工段',
                'production_line': stat['production_line'] or '未知产线',
                'phase': stat['phase__name'] or '未知期别',
                'count': stat['count']
            })
        
        # 获取可用的筛选选项
        available_phases = PlantPhase.objects.filter(is_active=True).values('id', 'name', 'code')
        available_processes = Process.objects.filter(is_active=True).values('id', 'name', 'code')
        available_production_lines = ProductionLine.objects.filter(is_active=True).values('id', 'name', 'code')
        
        response_data = {
            'total_maintenance_count': total_maintenance_count,
            'line_chart_data': line_chart_data,
            'bar_chart_data': bar_chart_data,
            'available_options': {
                'phases': list(available_phases),
                'processes': list(available_processes),
                'production_lines': list(available_production_lines)
            },
            'filters_applied': {
                'phase_id': phase_id,
                'process_id': process_id,
                'production_line_id': production_line_id,
                'period': period
            }
        }
        
        return Response(response_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_maintenance_by_line_process(request):
    """
    获取按产线和工序分组的维修数量统计数据
    参数:
    - phase_id: 期别ID (可选)
    - process_id: 工段ID (可选)
    - production_line_id: 产线ID (可选)
    - period: 时间周期 ('month', 'quarter', 'year') 默认为'month'
    """
    try:
        # 获取查询参数
        phase_id = request.GET.get('phase_id')
        process_id = request.GET.get('process_id')
        production_line_id = request.GET.get('production_line_id')
        period = request.GET.get('period', 'month')  # 默认为月
        
        # 转换ID参数为整数，如果转换失败则设为None
        try:
            process_id = int(process_id) if process_id else None
        except (ValueError, TypeError):
            process_id = None
            
        try:
            production_line_id = int(production_line_id) if production_line_id else None
        except (ValueError, TypeError):
            production_line_id = None
        
        # 导入模型类
        from db.models import Process, ProductionLine
        
        # 构建查询条件
        query_filter = Q()
        
        if phase_id:
            query_filter &= Q(phase__code=phase_id)  # ShiftMaintenanceRecord通过外键关联PlantPhase，使用__code查询
        if process_id is not None:
            # ShiftMaintenanceRecord的process字段是字符串字段，但前端传递的是ID，需要先获取名称
            try:
                process_obj = Process.objects.get(id=process_id)
                query_filter &= Q(process=process_obj.name)
            except Process.DoesNotExist:
                # 如果找不到对应的Process，就不添加这个过滤条件（相当于不过滤）
                pass
        if production_line_id is not None:
            # ShiftMaintenanceRecord的production_line字段是字符串字段，但前端传递的是ID，需要先获取名称
            try:
                production_line_obj = ProductionLine.objects.get(id=production_line_id)
                query_filter &= Q(production_line=production_line_obj.name)
            except ProductionLine.DoesNotExist:
                # 如果找不到对应的ProductionLine，就不添加这个过滤条件（相当于不过滤）
                pass
        
        # 根据时间周期确定日期范围
        end_date = timezone.now()
        
        if period == 'month':
            start_date = end_date - timedelta(days=30)
        elif period == 'quarter':
            start_date = end_date - timedelta(days=90)
        elif period == 'year':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)  # 默认为月
        
        query_filter &= Q(created_at__range=[start_date, end_date])
        
        # 获取维修记录数据
        maintenance_cases = MaintenanceRecord.objects.filter(query_filter)
        
        # 按产线分组统计维修数量
        production_line_stats = maintenance_cases.values(
            'production_line'
        ).annotate(
            count=Count('pk')
        ).order_by('-count')
        
        # 按工序(工段)分组统计维修数量
        process_stats = maintenance_cases.values(
            'process'
        ).annotate(
            count=Count('pk')
        ).order_by('-count')
        
        # 准备产线数据
        production_line_data = []
        for stat in production_line_stats:
            production_line_data.append({
                'name': stat['production_line'] or '未知产线',
                'count': stat['count']
            })
        
        # 准备工序数据
        process_data = []
        for stat in process_stats:
            process_data.append({
                'name': stat['process'] or '未知工段',
                'count': stat['count']
            })
        
        response_data = {
            'production_line_stats': production_line_data,
            'process_stats': process_data,
            'filters_applied': {
                'phase_id': phase_id,
                'process_id': process_id,
                'production_line_id': production_line_id,
                'period': period
            }
        }
        
        return Response(response_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_maintenance_trends(request):
    """
    获取维修趋势数据，用于显示更详细的趋势分析
    """
    try:
        phase_id = request.GET.get('phase_id')
        process_id = request.GET.get('process_id')
        production_line_id = request.GET.get('production_line_id')
        period = request.GET.get('period', 'month')
        
        # 转换ID参数为整数，如果转换失败则设为None
        try:
            process_id = int(process_id) if process_id else None
        except (ValueError, TypeError):
            process_id = None
            
        try:
            production_line_id = int(production_line_id) if production_line_id else None
        except (ValueError, TypeError):
            production_line_id = None
        
        # 导入模型类
        from db.models import Process, ProductionLine
        
        # 构建查询条件
        query_filter = Q()
        
        if phase_id:
            query_filter &= Q(phase__code=phase_id)  # ShiftMaintenanceRecord通过外键关联PlantPhase，使用__code查询
        if process_id is not None:
            # ShiftMaintenanceRecord的process字段是字符串字段，但前端传递的是ID，需要先获取名称
            try:
                process_obj = Process.objects.get(id=process_id)
                query_filter &= Q(process=process_obj.name)
            except Process.DoesNotExist:
                # 如果找不到对应的Process，就不添加这个过滤条件（相当于不过滤）
                pass
        if production_line_id is not None:
            # ShiftMaintenanceRecord的production_line字段是字符串字段，但前端传递的是ID，需要先获取名称
            try:
                production_line_obj = ProductionLine.objects.get(id=production_line_id)
                query_filter &= Q(production_line=production_line_obj.name)
            except ProductionLine.DoesNotExist:
                # 如果找不到对应的ProductionLine，就不添加这个过滤条件（相当于不过滤）
                pass
        
        # 根据时间周期确定日期范围
        end_date = timezone.now()
        
        if period == 'month':
            start_date = end_date - timedelta(days=30)
            # 按天统计
            date_format = '%Y-%m-%d'
        elif period == 'quarter':
            start_date = end_date - timedelta(days=90)
            # 按周统计
            date_format = 'W%U'
        elif period == 'year':
            start_date = end_date - timedelta(days=365)
            # 按月统计
            date_format = '%Y-%m'
        else:
            start_date = end_date - timedelta(days=30)
            date_format = '%Y-%m-%d'
        
        query_filter &= Q(created_at__range=[start_date, end_date])
        
        # 获取数据并按时间段分组
        maintenance_cases = MaintenanceRecord.objects.filter(query_filter)
        
        from django.db.models.functions import TruncDate, TruncMonth
        import calendar
        
        if period == 'month':
            trend_data = maintenance_cases.annotate(
                time_period=TruncDate('created_at')
            ).values('time_period').annotate(
                count=Count('pk')
            ).order_by('time_period')
        elif period == 'quarter':
            # 按季度统计 - 这里我们按月聚合，然后在前端处理季度显示
            trend_data = maintenance_cases.annotate(
                time_period=TruncMonth('created_at')
            ).values('time_period').annotate(
                count=Count('pk')
            ).order_by('time_period')
        else:  # year
            trend_data = maintenance_cases.annotate(
                time_period=TruncMonth('created_at')
            ).values('time_period').annotate(
                count=Count('pk')
            ).order_by('time_period')
        
        # 转换数据格式
        chart_data = []
        for item in trend_data:
            chart_data.append({
                'period': str(item['time_period']),
                'count': item['count']
            })
        
        return Response({
            'trend_data': chart_data,
            'period': period
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)