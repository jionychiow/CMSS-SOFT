from django.db import models
from django.contrib.auth.models import User


class ExcelUpload(models.Model):
    """
    用于存储Excel上传记录
    """
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='excel_files/')
    filename = models.CharField(max_length=255)
    uploaded_by = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return f"{self.filename} - {self.uploaded_at}"
    
    class Meta:
        verbose_name = "Excel上传"
        verbose_name_plural = "Excel上传"


class MaintenanceRecord(models.Model):
    """
    维修记录模型 - 对应Excel中的维修记录
    """
    SHIFT_CHOICES = [
        ('早班', '早班'),
        ('中班', '中班'),
        ('晚班', '晚班'),
        ('长白班', '长白班'),
        ('其他', '其他'),
    ]
    
    CHANGE_REASON_CHOICES = [
        ('故障维修', '故障维修'),
        ('定期保养', '定期保养'),
        ('设备改造', '设备改造'),
        ('零件更换', '零件更换'),
        ('其他', '其他'),
    ]
    
    # 基本信息
    record_number = models.CharField(max_length=50, verbose_name="序号")
    month = models.CharField(max_length=20, verbose_name="月份")
    production_line = models.CharField(max_length=100, verbose_name="产线")
    process = models.CharField(max_length=100, verbose_name="工序")
    
    # 设备信息
    equipment_name = models.CharField(max_length=200, verbose_name="设备或工装名称")
    equipment_code = models.CharField(max_length=100, verbose_name="设备编号")
    equipment_part = models.CharField(max_length=200, verbose_name="设备零部件/部位")
    
    # 变更信息
    change_reason = models.CharField(max_length=50, choices=CHANGE_REASON_CHOICES, verbose_name="变更原因")
    status_before = models.TextField(verbose_name="变更前(现状)")
    status_after = models.TextField(verbose_name="变更后（变了什么）")
    
    # 时间信息
    start_datetime = models.DateTimeField(verbose_name="开始日期及时间")
    end_datetime = models.DateTimeField(verbose_name="结束日期及时间")
    duration = models.DurationField(verbose_name="耗用时长")
    
    # 材料与人员
    parts_consumables = models.TextField(verbose_name="零件耗材", blank=True, null=True)
    implementer = models.CharField(max_length=100, verbose_name="实施人")
    confirm_person = models.CharField(max_length=100, verbose_name="确认人", blank=True, null=True)
    acceptor = models.CharField(max_length=100, verbose_name="验收人", blank=True, null=True)
    
    # 效果评估
    effect_evaluation = models.TextField(verbose_name="效果评价", blank=True, null=True)
    evaluator = models.CharField(max_length=100, verbose_name="评价人", blank=True, null=True)
    
    # 其他
    remarks = models.TextField(verbose_name="备注", blank=True, null=True)
    shift_type = models.CharField(max_length=20, choices=SHIFT_CHOICES, verbose_name="班次")
    
    # 系统字段
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="创建人")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新时间")
    imported_from_excel = models.BooleanField(default=False, verbose_name="是否从Excel导入")
    excel_upload = models.ForeignKey(ExcelUpload, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Excel上传记录")
    
    def __str__(self):
        return f"{self.equipment_name} - {self.record_number}"
    
    class Meta:
        verbose_name = "维修记录"
        verbose_name_plural = "维修记录"
        ordering = ['-created_at']


class Equipment(models.Model):
    """
    设备模型
    """
    name = models.CharField(max_length=200, verbose_name="设备名称")
    code = models.CharField(max_length=100, unique=True, verbose_name="设备编号")
    production_line = models.CharField(max_length=100, verbose_name="所属产线")
    process = models.CharField(max_length=100, verbose_name="工序")
    part_details = models.TextField(verbose_name="设备零部件详情", blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    class Meta:
        verbose_name = "设备"
        verbose_name_plural = "设备"
        ordering = ['name']


class MaintenanceHistory(models.Model):
    """
    维修历史记录 - 记录设备的维修历史
    """
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, verbose_name="设备")
    maintenance_record = models.ForeignKey(MaintenanceRecord, on_delete=models.CASCADE, verbose_name="维修记录")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.equipment.name} - {self.maintenance_record.change_reason}"
    
    class Meta:
        verbose_name = "维修历史"
        verbose_name_plural = "维修历史"
        ordering = ['-created_at']