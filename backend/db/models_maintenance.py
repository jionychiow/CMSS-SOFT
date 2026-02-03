from django.db import models
from django.contrib.auth.models import User
from .models import Asset, Organization
import uuid
from django.utils import timezone


class MaintenanceRecord(models.Model):
    """
    维修记录模型
    工厂分一期和二期，班次分长白班和倒班
    """
    PHASE_CHOICES = [
        ('phase_1', '一期'),
        ('phase_2', '二期'),
    ]
    
    SHIFT_CHOICES = [
        ('long_day_shift', '长白班'),
        ('rotating_shift', '倒班'),
    ]
    
    LINE_CHOICES = [
        # 一期生产线: 1-10#
        ('1-1#', '1-1#'),
        ('1-2#', '1-2#'),
        ('1-3#', '1-3#'),
        ('1-4#', '1-4#'),
        ('1-5#', '1-5#'),
        ('1-6#', '1-6#'),
        ('1-7#', '1-7#'),
        ('1-8#', '1-8#'),
        ('1-9#', '1-9#'),
        ('1-10#', '1-10#'),
        # 二期生产线: 2-1 to 2-9#
        ('2-1#', '2-1#'),
        ('2-2#', '2-2#'),
        ('2-3#', '2-3#'),
        ('2-4#', '2-4#'),
        ('2-5#', '2-5#'),
        ('2-6#', '2-6#'),
        ('2-7#', '2-7#'),
        ('2-8#', '2-8#'),
        ('2-9#', '2-9#'),
    ]
    
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, blank=True, null=True)
    
    # 生产线信息
    phase = models.CharField(max_length=20, choices=PHASE_CHOICES, verbose_name='工厂分期')
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, verbose_name='班次')
    production_line = models.CharField(max_length=10, choices=LINE_CHOICES, verbose_name='生产线')
    
    # 设备信息
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, verbose_name='设备')
    
    # 维修信息
    title = models.CharField(max_length=255, verbose_name='维修标题')
    description = models.TextField(verbose_name='维修描述')
    
    # 维修人员信息
    main_operator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maintenances_led', verbose_name='主操作员')
    assistant_operators = models.ManyToManyField(User, blank=True, related_name='maintenances_assisted', verbose_name='协助人员')
    
    # 时间信息
    start_time = models.DateTimeField(verbose_name='开始时间')
    end_time = models.DateTimeField(verbose_name='结束时间')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # 状态
    STATUS_CHOICES = [
        ('open', '开启'),
        ('in_progress', '进行中'),
        ('completed', '完成'),
        ('cancelled', '取消'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open', verbose_name='状态')
    
    class Meta:
        verbose_name = '维修记录'
        verbose_name_plural = '维修记录'
        ordering = ['-start_time']
    
    def __str__(self):
        return f"{self.title} - {self.production_line} - {self.shift}"


class MaintenanceManual(models.Model):
    """
    维修手册模型 - 包含维修步骤、图片和视频
    """

    
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, blank=True, null=True)
    
    # 设备信息
    production_line = models.CharField(max_length=10, verbose_name='生产线')
    process = models.CharField(max_length=50, verbose_name='工段')
    equipment_name = models.CharField(max_length=255, verbose_name='设备名称')
    
    # 期数信息
    phase = models.CharField(max_length=20, blank=True, null=True, verbose_name='期数')
    
    # 维修内容
    title = models.CharField(max_length=255, verbose_name='手册标题')
    description = models.TextField(verbose_name='手册描述')
    
    # 其他信息
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='创建者')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '维修手册'
        verbose_name_plural = '维修手册'
        ordering = ['production_line', 'process', 'equipment_name']


class MaintenanceStep(models.Model):
    """
    维修步骤模型 - 存储每个维修步骤的详细信息
    """
    manual = models.ForeignKey(MaintenanceManual, on_delete=models.CASCADE, related_name='steps', verbose_name='所属手册')
    step_number = models.PositiveIntegerField(verbose_name='步骤序号')
    title = models.CharField(max_length=255, verbose_name='步骤标题')
    description = models.TextField(verbose_name='步骤描述')
    image = models.ImageField(upload_to='maintenance_steps/images/', blank=True, null=True, verbose_name='步骤图片')
    video = models.FileField(upload_to='maintenance_steps/videos/', blank=True, null=True, verbose_name='步骤视频')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '维修步骤'
        verbose_name_plural = '维修步骤'
        ordering = ['manual', 'step_number']
    
    def __str__(self):
        return f"步骤 {self.step_number} - {self.title}"


class MaintenanceCase(models.Model):
    """
    维修故障案例模型 - 包含故障原因、现象和处理方法
    """
    PROCESS_CHOICES = [
        ('molding', '成型工段'),
        ('assembly', '装配工段'),
        ('packaging', '包装工段'),
        ('quality_control', '质量控制'),
        ('maintenance', '维修工段'),
        ('other', '其他'),
    ]
    
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, blank=True, null=True)
    
    # 设备信息
    process = models.CharField(max_length=50, choices=PROCESS_CHOICES, verbose_name='工段')
    equipment_name = models.CharField(max_length=255, verbose_name='设备名称')
    
    # 故障信息
    fault_reason = models.TextField(verbose_name='故障原因')
    fault_phenomenon = models.TextField(verbose_name='故障现象')
    fault_handling_method = models.TextField(verbose_name='故障处理方法')
    
    # 多媒体内容
    images = models.ImageField(upload_to='maintenance_cases/images/', blank=True, null=True, verbose_name='故障图片')
    videos = models.FileField(upload_to='maintenance_cases/videos/', blank=True, null=True, verbose_name='故障视频')
    
    # 其他信息
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='创建者')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '维修故障案例'
        verbose_name_plural = '维修故障案例'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.equipment_name} - {self.fault_reason[:30]}..."