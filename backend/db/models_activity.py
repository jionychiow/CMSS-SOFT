from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from uuid import uuid4


class UserActivity(models.Model):
    """
    用户活动记录模型
    用于跟踪用户的各种活动，如登录、创建资产、创建维护记录等
    """
    ACTIVITY_TYPES = [
        ('login', '用户登录'),
        ('logout', '用户登出'),
        ('create_asset', '创建资产'),
        ('edit_asset', '编辑资产'),
        ('create_maintenance', '创建维护记录'),
        ('edit_maintenance', '编辑维护记录'),
        ('create_task_plan', '创建任务计划'),
        ('edit_task_plan', '编辑任务计划'),
        ('view_dashboard', '查看仪表板'),
        ('other', '其他活动'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用户')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES, verbose_name='活动类型')
    description = models.TextField(blank=True, verbose_name='活动描述')
    timestamp = models.DateTimeField(default=timezone.now, verbose_name='时间戳')
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name='IP地址')
    user_agent = models.TextField(blank=True, verbose_name='用户代理')
    
    class Meta:
        verbose_name = '用户活动'
        verbose_name_plural = '用户活动'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_activity_type_display()} - {self.timestamp}"


class WeeklyVisitTrend(models.Model):
    """
    每周访问趋势模型
    用于记录每日访问量以生成趋势图
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    date = models.DateField(verbose_name='日期')
    visit_count = models.IntegerField(default=0, verbose_name='访问次数')
    unique_visitors = models.IntegerField(default=0, verbose_name='独立访客数')
    
    class Meta:
        verbose_name = '每周访问趋势'
        verbose_name_plural = '每周访问趋势'
        ordering = ['-date']
        unique_together = [['date']]
    
    def __str__(self):
        return f"{self.date} - {self.visit_count} 访问"