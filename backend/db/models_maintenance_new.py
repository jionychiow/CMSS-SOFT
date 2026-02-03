import re
from django.db import models
from django.contrib.auth.models import User
from db.models import BasicInfo, Asset, PlantPhase, ShiftType
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from django.conf import settings
from rest_framework.authtoken.models import Token
from django.utils import timezone
from datetime import datetime


class ShiftMaintenanceRecord(BasicInfo):
    """
    按工厂分期和班次分类的维修记录模型
    """
    CHANGE_REASON_CHOICES = [
        ('maintenance', '维保'),
        ('repair', '维修'),
        ('technical_modification', '技改'),
    ]

    # 工厂分期和班次（新增字段，使用外键关联数据库配置）
    phase = models.ForeignKey(PlantPhase, on_delete=models.CASCADE, verbose_name="工厂分期")
    shift_type = models.ForeignKey(ShiftType, on_delete=models.CASCADE, verbose_name="班次类型")
    
    # Excel表格中的公共字段
    serial_number = models.CharField(max_length=20, verbose_name="序号", unique=True, blank=True, null=True)
    month = models.CharField(max_length=10, verbose_name="月份", blank=True, null=True)
    production_line = models.CharField(max_length=50, verbose_name="产线", blank=True, null=True)
    process = models.CharField(max_length=50, verbose_name="工序", blank=True, null=True)
    equipment_name = models.CharField(max_length=200, verbose_name="设备或工装名称", blank=True, null=True)
    equipment_number = models.CharField(max_length=100, verbose_name="设备编号", blank=True, null=True)
    equipment_part = models.CharField(max_length=200, verbose_name="设备零部件/部位", blank=True, null=True)
    change_reason = models.CharField(max_length=50, choices=CHANGE_REASON_CHOICES, verbose_name="变更原因", blank=True, null=True)
    before_change = models.TextField(verbose_name="变更前(现状）", blank=True, null=True)
    after_change = models.TextField(verbose_name="变更后（变了什么）", blank=True, null=True)
    start_datetime = models.DateTimeField(verbose_name="开始日期及时间", blank=True, null=True)
    end_datetime = models.DateTimeField(verbose_name="结束日期及时间", blank=True, null=True)
    duration = models.FloatField(verbose_name="耗用时长(小时)", blank=True, null=True)
    parts_consumables = models.TextField(verbose_name="零件耗材", blank=True, null=True)
    implementer = models.CharField(max_length=100, verbose_name="实施人", blank=True, null=True)
    
    # 长白班特有字段
    confirm_person = models.CharField(max_length=100, verbose_name="确认人", blank=True, null=True)  # 长白班特有
    
    # 倒班特有字段
    acceptor = models.CharField(max_length=100, verbose_name="验收人", blank=True, null=True)  # 倒班特有
    
    # 公共字段
    remarks = models.TextField(verbose_name="备注", blank=True, null=True)
    
    # 关联字段
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, blank=True, null=True, verbose_name="关联资产")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="分配给")
    
    class Meta:
        verbose_name = "班次维修记录"
        verbose_name_plural = "班次维修记录"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # 如果序号为空，则自动生成唯一序号
        if not self.serial_number:
            self.serial_number = self.generate_unique_serial_number()
        
        # 如果月份为空，则自动设置为当前月份
        if not self.month:
            self.month = str(timezone.now().month)
        
        # 自动计算耗用时长（如果开始时间和结束时间都存在）
        if self.start_datetime and self.end_datetime:
            duration_delta = self.end_datetime - self.start_datetime
            # 将时间差转换为小时
            self.duration = duration_delta.total_seconds() / 3600
        
        super().save(*args, **kwargs)

    def generate_unique_serial_number(self):
        """生成唯一的序号，格式如：1CB-000001、1DB-000001"""
        # 获取代码前缀用于简写
        phase_code = self.phase.code.replace('phase_', '')  # 得到 '1' 或 '2'
        shift_code = ''
        if self.shift_type.code == 'long_day_shift':
            shift_code = 'CB'  # 长白班
        elif self.shift_type.code == 'rotating_shift':
            shift_code = 'DB'  # 倒班
        else:
            shift_code = 'XX'  # 默认
        
        # 构建序号前缀，格式为：1CB-
        prefix = f"{phase_code}{shift_code}-"
        
        # 查找当前前缀下最大的序号
        existing_records = ShiftMaintenanceRecord.objects.filter(
            serial_number__startswith=prefix
        ).order_by('-serial_number')
        
        if existing_records.exists():
            # 找到最大序号并递增
            last_record = existing_records.first()
            last_number = re.search(r'-([0-9]+)$', last_record.serial_number)
            if last_number:
                new_number = int(last_number.group(1)) + 1
            else:
                new_number = 1
        else:
            new_number = 1
        
        # 格式化序号，保持6位数字
        serial_number = f"{prefix}{new_number:06d}"
        
        # 确保序号唯一性（以防并发情况）
        counter = 0
        original_serial = serial_number
        while ShiftMaintenanceRecord.objects.filter(serial_number=serial_number).exists():
            counter += 1
            serial_number = f"{original_serial[:-6]}{(new_number + counter):06d}"
        
        return serial_number

    def __str__(self):
        return f"{self.phase} {self.shift_type} - {self.equipment_name}"