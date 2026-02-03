from django.http import JsonResponse
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.db.models import Count
from datetime import datetime, date, timedelta
from .models_task_plan import TaskPlan
from .models_activity import UserActivity, WeeklyVisitTrend
import logging

logger = logging.getLogger(__name__)


def active_users_count(request):
    """
    获取当前活跃用户数量
    当前活跃用户定义为在过去15分钟内在系统中有活动的用户
    """
    try:
        # 计算15分钟前的时间
        fifteen_minutes_ago = timezone.now() - timedelta(minutes=15)
        
        # 首先尝试使用UserActivity模型查询过去15分钟内有活动的用户
        try:
            active_users_count = UserActivity.objects.filter(
                timestamp__gte=fifteen_minutes_ago
            ).values('user').distinct().count()
        except:
            # 如果UserActivity表不存在，使用备用方法
            active_users_count = 0
        
        # 如果活动记录为空或表不存在，回退到原来的逻辑
        if active_users_count == 0:
            # 计算15分钟前的时间
            fifteen_minutes_ago = timezone.now() - timedelta(minutes=15)
            
            # 方法1: 通过Session判断活跃用户
            active_sessions = Session.objects.filter(expire_date__gte=timezone.now())
            active_user_count = 0
            
            for session in active_sessions:
                session_data = session.get_decoded()
                user_id = session_data.get('_auth_user_id')
                if user_id:
                    try:
                        user = User.objects.get(id=user_id)
                        # 检查用户是否在过去15分钟内有活动
                        active_user_count += 1
                    except User.DoesNotExist:
                        continue
            
            # 方法2: 也可以考虑基于TaskPlan最近操作时间来判断活跃用户
            # 这里我们使用会话方式为主，结合最近登录时间
            recently_active_users = User.objects.filter(
                last_login__gte=fifteen_minutes_ago
            ).count()
            
            # 返回两者中的较大值，以更准确反映活跃用户数
            active_users_count = max(active_user_count, recently_active_users)
        
        return JsonResponse({
            'count': active_users_count,
            'timestamp': timezone.now().isoformat(),
            'method': 'activity_based_count',
            'debug_info': {
                'activity_based_count': UserActivity.objects.filter(
                    timestamp__gte=fifteen_minutes_ago
                ).values('user').distinct().count() if active_users_count > 0 else 0,
                'session_based_count': Session.objects.filter(
                    expire_date__gte=timezone.now()
                ).count(),
                'recently_logged_in_users': User.objects.filter(
                    last_login__gte=fifteen_minutes_ago
                ).count()
            }
        })
    except Exception as e:
        logger.error(f"Error getting active users count: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


def today_visits_count(request):
    """
    获取今日访问量
    通过UserActivity和Session数量来估算访问量
    """
    try:
        # 使用本地时间获取今日零点
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        # 首先尝试通过UserActivity模型统计今日访问量
        try:
            today_activities_count = UserActivity.objects.filter(
                timestamp__gte=today_start,
                timestamp__lt=today_end
            ).count()
        except:
            # 如果UserActivity表不存在，使用备用方法
            today_activities_count = 0
        
        # 如果没有活动记录或表不存在，回退到原始的会话统计方法
        if today_activities_count == 0:
            # 统计今日创建的会话数量（代表访问次数）
            today_sessions_count = Session.objects.filter(
                expire_date__gte=today_start
            ).count()
            
            # 另一种方式：统计今日创建的任务数量（作为活动指标）
            today_tasks_count = TaskPlan.objects.filter(
                created_at__gte=today_start,
                created_at__lt=today_end
            ).count()
            
            # 为了更准确，我们综合考虑多种因素
            # 会话数表示访问次数，但每次会话可能包含多次页面访问
            # 我们暂时返回会话数，但可以按需调整算法
            estimated_visits = today_sessions_count
        else:
            estimated_visits = today_activities_count
        
        return JsonResponse({
            'count': estimated_visits,
            'timestamp': timezone.now().isoformat(),
            'method': 'activity_based_count',
            'debug_info': {
                'today_activities_count': today_activities_count,
                'today_sessions_count': Session.objects.filter(expire_date__gte=today_start).count(),
                'today_tasks_count': TaskPlan.objects.filter(
                    created_at__gte=today_start,
                    created_at__lt=today_end
                ).count(),
                'start_time': today_start.isoformat(),
                'end_time': today_end.isoformat()
            }
        })
    except Exception as e:
        logger.error(f"Error getting today visits count: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


def today_task_status_distribution(request):
    """
    获取今日任务计划的状态分布
    这是修复现有的状态分布API，使其仅返回今日数据
    """
    try:
        # 使用本地时间获取今天的日期
        today = timezone.now().date()
        
        # 获取今日任务的状态分布
        status_counts = TaskPlan.objects.filter(
            date=today
        ).values('status').annotate(
            count=Count('uuid')
        )
        
        # 确保所有状态都存在，即使计数为0
        all_statuses = {
            'pending': 0,
            'in_progress': 0,
            'completed': 0,
            'cancelled': 0,
            'overdue': 0
        }
        
        for item in status_counts:
            all_statuses[item['status']] = item['count']
        
        # 检查是否有过期的待办任务
        # 如果date字段小于今天，则认为是逾期任务
        overdue_tasks = TaskPlan.objects.filter(
            date__lt=today,
            status='pending'
        ).count()
        
        if overdue_tasks > 0:
            all_statuses['overdue'] = overdue_tasks
            all_statuses['pending'] = max(0, all_statuses['pending'] - overdue_tasks)
        
        return JsonResponse({
            'status_distribution': all_statuses,
            'total_today_tasks': sum(all_statuses.values()),
            'date': str(today),
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting today task status distribution: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


def recent_activities(request):
    """
    获取最近的用户活动记录
    """
    try:
        # 尝试获取最近20条活动记录
        try:
            recent_activities = UserActivity.objects.select_related('user').order_by('-timestamp')[:20]
            
            activities_list = []
            for activity in recent_activities:
                activities_list.append({
                    'id': str(activity.id),
                    'username': activity.user.username,
                    'activity_type': activity.get_activity_type_display(),
                    'description': activity.description,
                    'timestamp': activity.timestamp.isoformat(),
                    'formatted_timestamp': activity.timestamp.strftime('%Y-%m-%d %H:%M:%S')
                })
        except:
            # 如果UserActivity表不存在，返回空列表
            activities_list = []
        
        return JsonResponse({
            'activities': activities_list,
            'total_count': len(activities_list),
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting recent activities: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


def weekly_visit_trends(request):
    """
    获取本周访问趋势
    """
    try:
        # 获取本周的7天数据
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())  # 本周一
        
        trends = []
        for i in range(7):
            day = week_start + timedelta(days=i)
            
            # 优先从 WeeklyVisitTrend 表获取当日访问量
            try:
                # 从 WeeklyVisitTrend 获取访问计数
                daily_trend, created = WeeklyVisitTrend.objects.get_or_create(
                    date=day,
                    defaults={'visit_count': 0, 'unique_visitors': 0}
                )
                
                # 使用数据库中已存储的值
                daily_count = daily_trend.visit_count
                
                # 如果是今天，我们可能需要更新访问计数
                # 但为了避免重复计算，只在有活动数据但趋势数据为0时才更新
                if day == today and daily_count == 0:
                    # 从 UserActivity 获取实时数据并更新 WeeklyVisitTrend
                    activity_count = UserActivity.objects.filter(
                        timestamp__date=day
                    ).count()
                    
                    if activity_count > 0:
                        # 更新数据库中的访问计数
                        daily_trend.visit_count = activity_count
                        daily_trend.save(update_fields=['visit_count'])
                        daily_count = activity_count
                        
            except Exception as e:
                # 如果 WeeklyVisitTrend 表有问题，回退到原始方法
                try:
                    daily_count = UserActivity.objects.filter(
                        timestamp__date=day
                    ).count()
                except:
                    # 如果 UserActivity 表也不存在，从会话中获取
                    daily_count = 0
                
                # 如果仍然没有数据，尝试从会话中获取
                if daily_count == 0:
                    from django.contrib.sessions.models import Session
                    daily_count = Session.objects.filter(
                        expire_date__date=day
                    ).count()
                
                # 创建或更新 WeeklyVisitTrend 记录
                try:
                    daily_trend, created = WeeklyVisitTrend.objects.get_or_create(
                        date=day,
                        defaults={'visit_count': daily_count, 'unique_visitors': 0}
                    )
                    if not created and daily_trend.visit_count != daily_count:
                        daily_trend.visit_count = daily_count
                        daily_trend.save(update_fields=['visit_count'])
                except:
                    pass  # 如果无法创建 WeeklyVisitTrend 记录，继续使用 daily_count
            
            trends.append({
                'date': day.isoformat(),
                'day_of_week': day.strftime('%a'),  # 星期几的缩写
                'visit_count': daily_count,
                'formatted_date': day.strftime('%m/%d')
            })
        
        return JsonResponse({
            'trends': trends,
            'week_start': week_start.isoformat(),
            'week_end': (week_start + timedelta(days=6)).isoformat(),
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting weekly visit trends: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


def asset_count(request):
    """
    获取资产总数
    """
    try:
        from .models import Asset  # 导入Asset模型
        count = Asset.objects.count()
        return JsonResponse({
            'count': count,
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting asset count: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


def maintenance_record_count(request):
    """
    获取维修记录总数
    """
    try:
        from .models_maintenance_new import ShiftMaintenanceRecord  # 导入维修记录模型
        count = ShiftMaintenanceRecord.objects.count()
        return JsonResponse({
            'count': count,
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting maintenance record count: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


def maintenance_record_count_phase1(request):
    """
    获取一期维修记录总数
    """
    try:
        from .models_maintenance_new import ShiftMaintenanceRecord  # 导入维修记录模型
        from .models import PlantPhase  # 导入Phase模型（使用models.py中的模型）
        
        # 获取一期的Phase对象
        try:
            phase_1 = PlantPhase.objects.get(code='phase_1')
            count = ShiftMaintenanceRecord.objects.filter(phase=phase_1).count()
        except PlantPhase.DoesNotExist:
            # 如果Phase配置不存在，返回0
            count = 0
        
        return JsonResponse({
            'count': count,
            'timestamp': timezone.now().isoformat(),
            'phase': 'phase_1'
        })
    except Exception as e:
        logger.error(f"Error getting maintenance record count for phase 1: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


def maintenance_record_count_phase2(request):
    """
    获取二期维修记录总数
    """
    try:
        from .models_maintenance_new import ShiftMaintenanceRecord  # 导入维修记录模型
        from .models import PlantPhase  # 导入Phase模型（使用models.py中的模型）
        
        # 获取二期的Phase对象
        try:
            phase_2 = PlantPhase.objects.get(code='phase_2')
            count = ShiftMaintenanceRecord.objects.filter(phase=phase_2).count()
        except PlantPhase.DoesNotExist:
            # 如果Phase配置不存在，返回0
            count = 0
        
        return JsonResponse({
            'count': count,
            'timestamp': timezone.now().isoformat(),
            'phase': 'phase_2'
        })
    except Exception as e:
        logger.error(f"Error getting maintenance record count for phase 2: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


def maintenance_manual_count(request):
    """
    获取维修手册总数
    """
    try:
        from .models_maintenance import MaintenanceManual  # 导入维修手册模型
        count = MaintenanceManual.objects.count()
        return JsonResponse({
            'count': count,
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting maintenance manual count: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


def weekly_activity_stats(request):
    """
    获取本周活动统计
    返回每周各天的维修记录、手册更新和未完成任务数量
    """
    try:
        from .models_maintenance_new import ShiftMaintenanceRecord
        from .models_maintenance import MaintenanceManual
        from .models_task_plan import TaskPlan
        from django.db.models import Count
        
        # 获取本周的7天数据
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())  # 本周一
        
        activity_stats = []
        for i in range(7):
            day = week_start + timedelta(days=i)
            
            # 获取当日的维修记录数
            daily_records_count = ShiftMaintenanceRecord.objects.filter(
                created_at__date=day
            ).count()
            
            # 获取当日的手册更新数
            daily_manuals_count = MaintenanceManual.objects.filter(
                created_at__date=day
            ).count()
            
            # 获取当日的未完成任务数（状态为pending的任务）
            daily_pending_tasks_count = TaskPlan.objects.filter(
                date=day,
                status='pending'
            ).count()
            
            activity_stats.append({
                'date': day.isoformat(),
                'day_name': day.strftime('%a'),  # 星期几的缩写
                'records_count': daily_records_count,
                'manuals_count': daily_manuals_count,
                'pending_tasks_count': daily_pending_tasks_count,
                'formatted_date': day.strftime('%m/%d'),
                'day_chinese': ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][day.weekday()]
            })
        
        return JsonResponse({
            'activity_stats': activity_stats,
            'week_start': week_start.isoformat(),
            'week_end': (week_start + timedelta(days=6)).isoformat(),
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting weekly activity stats: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)