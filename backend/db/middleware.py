from django.utils import timezone
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver
from .models_activity import UserActivity
from django.contrib.sessions.models import Session
import json


class ActivityTrackingMiddleware:
    """
    用户活动跟踪中间件
    自动记录用户的各种活动
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # 只对已认证的用户记录活动
        if hasattr(request, 'user') and request.user.is_authenticated:
            # 获取客户端IP地址
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # 根据请求路径确定活动类型
            activity_type = self.get_activity_type(request)
            if activity_type:
                try:
                    # 生成更有意义的描述
                    description = self.generate_activity_description(activity_type, request)
                    
                    # 尝试记录活动，但如果表不存在则忽略错误
                    UserActivity.objects.create(
                        user=request.user,
                        activity_type=activity_type,
                        description=description,
                        ip_address=ip_address,
                        user_agent=user_agent
                    )
                    
                    # 同时更新今天的访问趋势数据
                    from django.utils import timezone
                    from .models_activity import WeeklyVisitTrend
                    today = timezone.now().date()
                    
                    # 获取或创建今天的访问趋势记录
                    trend_record, created = WeeklyVisitTrend.objects.get_or_create(
                        date=today,
                        defaults={'visit_count': 0, 'unique_visitors': 0}
                    )
                    
                    # 增加访问计数
                    trend_record.visit_count += 1
                    trend_record.save(update_fields=['visit_count'])
                    
                except Exception as e:
                    # 如果表不存在或其他错误，记录到日志但不影响正常流程
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"无法记录用户活动: {str(e)}")
        
        # 对于未认证用户，也记录访问趋势
        else:
            from django.utils import timezone
            from .models_activity import WeeklyVisitTrend
            today = timezone.now().date()
            
            # 获取或创建今天的访问趋势记录
            try:
                trend_record, created = WeeklyVisitTrend.objects.get_or_create(
                    date=today,
                    defaults={'visit_count': 0, 'unique_visitors': 0}
                )
                
                # 增加访问计数
                trend_record.visit_count += 1
                trend_record.save(update_fields=['visit_count'])
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"无法更新访问趋势数据: {str(e)}")
        
        return response

    def get_client_ip(self, request):
        """获取客户端IP地址"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def generate_activity_description(self, activity_type, request):
        """生成更有意义的活动描述"""
        username = request.user.username
        path = request.path.lower()
        
        descriptions = {
            'create_asset': f"用户 {username} 创建了新设备",
            'edit_asset': f"用户 {username} 编辑了设备信息",
            'view_asset': f"用户 {username} 查看了设备信息",
            'create_maintenance': f"用户 {username} 创建了新的维护记录",
            'edit_maintenance': f"用户 {username} 编辑了维护记录",
            'view_maintenance': f"用户 {username} 查看了维护记录",
            'create_task_plan': f"用户 {username} 创建了新的任务计划",
            'edit_task_plan': f"用户 {username} 编辑了任务计划",
            'view_task_plan': f"用户 {username} 查看了任务计划",
            'view_dashboard': f"用户 {username} 访问了仪表板",
        }
        
        # 如果是其他特定路径，根据路径生成描述
        if activity_type == 'other':
            if '/api/db/production-lines/' in path:
                return f"用户 {username} 查看了生产线信息"
            elif '/api/db/processes/' in path:
                return f"用户 {username} 查看了工序信息"
            elif '/api/db/users/' in path:
                return f"用户 {username} 查看了用户信息"
            elif '/api/db/phases/' in path:
                return f"用户 {username} 查看了期数信息"
            elif '/api/db/maintenance-manuals/' in path:
                return f"用户 {username} 查看了维护手册信息"
            else:
                return f"用户 {username} 访问了 {request.path}"
        
        return descriptions.get(activity_type, f"用户 {username} 执行了 {activity_type} 操作")

    def get_activity_type(self, request):
        """根据请求路径确定活动类型"""
        path = request.path.lower()
        
        # 检查具体的API路径模式
        if '/api/v1/assets/' in path or '/api/db/assets/' in path:
            if request.method in ['POST']:
                return 'create_asset'
            elif request.method in ['PUT', 'PATCH']:
                return 'edit_asset'
            else:
                return 'view_asset'
        elif '/api/v1/maintenances/' in path or '/api/v1/maintenance-plans/' in path:
            if request.method in ['POST']:
                return 'create_maintenance'
            elif request.method in ['PUT', 'PATCH']:
                return 'edit_maintenance'
            else:
                return 'view_maintenance'
        elif '/api/db/maintenance-records/' in path or '/api/db/task-plans/' in path:
            if request.method in ['POST']:
                return 'create_task_plan'
            elif request.method in ['PUT', 'PATCH']:
                return 'edit_task_plan'
            else:
                return 'view_task_plan'
        elif '/api/db/production-lines/' in path:
            return 'view_asset'  # 生产线相关
        elif '/api/db/processes/' in path:
            return 'view_asset'  # 工序相关
        elif '/api/db/users/' in path:
            return 'view_dashboard'  # 用户管理
        elif '/api/db/phases/' in path:
            return 'view_asset'  # 期数相关
        elif '/api/db/maintenance-manuals/' in path:
            return 'view_asset'  # 维护手册相关
        elif '/api/maintenance/config/' in path or '/api/v1/my-profile/' in path:
            return 'view_dashboard'
        elif '/dashboard' in path:
            return 'view_dashboard'
        elif '/api/db/' in path and ('/stats/' not in path):  # 更多db相关的API
            # 检查是否是特定操作
            if request.method in ['POST']:
                return 'create_asset'  # 大多数db下的POST都是创建资源
            else:
                return 'view_asset'  # 大多数db下的GET都是查看资源
        
        # 特殊处理：如果是主页或仪表板相关统计
        if path in ['/', '/dashboard/', '/dashboards/', '/api/db/stats/active-users/',
                    '/api/db/stats/today-visits/', '/api/db/stats/recent-activities/',
                    '/api/db/stats/weekly-trends/']:
            return 'view_dashboard'
        
        # 默认返回other
        return 'other'


@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """记录用户登录事件"""
    try:
        ip_address = get_client_ip_from_request(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        UserActivity.objects.create(
            user=user,
            activity_type='login',
            description=f"用户 {user.username} 登录系统",
            ip_address=ip_address,
            user_agent=user_agent
        )
    except Exception as e:
        # 如果表不存在或其他错误，记录到日志但不影响正常流程
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"无法记录登录活动: {str(e)}")


@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    """记录用户登出事件"""
    if user:  # 确保用户存在
        try:
            ip_address = get_client_ip_from_request(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            UserActivity.objects.create(
                user=user,
                activity_type='logout',
                description=f"用户 {user.username} 登出系统",
                ip_address=ip_address,
                user_agent=user_agent
            )
        except Exception as e:
            # 如果表不存在或其他错误，记录到日志但不影响正常流程
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"无法记录登出活动: {str(e)}")


@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    """记录用户登录失败事件"""
    from django.contrib.auth.models import User
    
    ip_address = get_client_ip_from_request(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    # 尝试获取用户对象，如果失败则使用临时用户
    username = credentials.get('username', 'unknown')
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        # 创建一个临时用户用于记录失败的登录尝试
        # 但我们不实际创建用户，只是记录活动
        # 这种情况下我们可以跳过记录，或者用一个特殊标记
        return
    
    UserActivity.objects.create(
        user=user,
        activity_type='other',
        description=f"用户 {username} 登录失败",
        ip_address=ip_address,
        user_agent=user_agent
    )


def get_client_ip_from_request(request):
    """从请求中获取客户端IP地址"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip