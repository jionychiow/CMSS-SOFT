from django.db import models
from django.contrib.auth.models import User
from db.models import BasicInfo, PlantPhase, ProductionLine, Process


class TaskPlan(BasicInfo):
    """
    任务计划模型
    """
    STATUS_CHOICES = [
        ('pending', '待处理'),
        ('in_progress', '进行中'),
        ('completed', '已完成'),
        ('cancelled', '已取消'),
    ]
    
    # 基本信息
    date = models.DateField(verbose_name="日期", null=True, blank=True)
    task_description = models.TextField(verbose_name="任务计划", blank=True)
    assigned_users = models.ManyToManyField(User, verbose_name="任务实施人", blank=True)
    planned_people_count = models.IntegerField(verbose_name="计划人数", default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="状态")
    progress = models.FloatField(verbose_name="完成进度(%)", default=0.0)  # 0.0 到 100.0 之间的数值
    completed_at = models.DateTimeField(verbose_name="完成时间", null=True, blank=True)
    
    # 关联字段
    phase = models.ForeignKey(PlantPhase, on_delete=models.SET_NULL, blank=True, null=True, verbose_name="期别")
    process = models.ForeignKey(Process, on_delete=models.SET_NULL, blank=True, null=True, verbose_name="工序")
    production_line = models.ForeignKey(ProductionLine, on_delete=models.SET_NULL, blank=True, null=True, verbose_name="产线")
    
    class Meta:
        verbose_name = "任务计划"
        verbose_name_plural = "任务计划"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # 更新计划人数为分配用户的数量
        self.planned_people_count = self.assigned_users.count()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.task_description[:50]} - {self.date}"