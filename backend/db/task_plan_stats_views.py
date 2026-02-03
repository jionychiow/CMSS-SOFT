from django.http import JsonResponse
from django.utils import timezone
from datetime import date
from .models_task_plan import TaskPlan


def today_tasks_count(request):
    """获取今天的任务计划数量"""
    today = timezone.now().date()
    
    # 获取今天的任务数量
    today_tasks_count = TaskPlan.objects.filter(date=today).count()
    
    # 为了调试目的，输出调试信息
    print(f"Today is: {today}")
    print(f"Found {today_tasks_count} tasks for today")
    
    return JsonResponse({
        'count': today_tasks_count, 
        'debug_info': {
            'requested_date': str(today),
            'found_tasks_count': today_tasks_count,
            'server_time': str(timezone.now().isoformat())
        }
    })


def incomplete_tasks_count(request):
    """获取所有未完成的任务数量"""
    # 获取未完成的任务数量
    incomplete_tasks_count = TaskPlan.objects.filter(status__in=['pending', 'in_progress']).count()
    
    # 输出调试信息
    print(f"Found {incomplete_tasks_count} incomplete tasks")
    
    return JsonResponse({
        'count': incomplete_tasks_count, 
        'debug_info': {
            'found_incomplete_tasks_count': incomplete_tasks_count,
            'server_time': str(timezone.now().isoformat())
        }
    })


def in_progress_tasks_count(request):
    """获取所有进行中的任务数量"""
    # 获取进行中的任务数量
    in_progress_tasks_count = TaskPlan.objects.filter(status='in_progress').count()
    
    # 输出调试信息
    print(f"Found {in_progress_tasks_count} in-progress tasks")
    
    return JsonResponse({
        'count': in_progress_tasks_count, 
        'debug_info': {
            'found_in_progress_tasks_count': in_progress_tasks_count,
            'server_time': str(timezone.now().isoformat())
        }
    })