from django.core.mail import send_mail
from django.dispatch import receiver
import django.utils.timezone as timezone
from django_rest_passwordreset.signals import reset_password_token_created
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_delete,post_save
import uuid
from rest_framework.authtoken.models import Token

# 导入活动模型
from .models_activity import UserActivity, WeeklyVisitTrend
from django.template.loader import render_to_string
import os
from dotenv import load_dotenv
load_dotenv()

# Create your models here.
Event_choices =(
    ("on", "on"),
    ("off", "off"),

    ("run", "run"),
    ("stop", "stop"),

    ("out of order", "out of order"),
    ("resume out of order", "resume out of order"),

    ("failure", "failure"),
    ("resume failure", "resume failure"),

    ("break in", "break in"),
    ("resume break in", "resume break in"),

    ("break out", "break out"),
    ("resume break out", "resume break out"),

    ("fault", "fault"),
    ("resume fault", "resume fault"),

    ("report", "report"),
 
   )

class PlantPhase(models.Model):
    """工厂分期配置"""
    code = models.CharField(max_length=20, unique=True, verbose_name="期数代码")
    name = models.CharField(max_length=50, verbose_name="期数名称")
    description = models.TextField(blank=True, null=True, verbose_name="描述")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "工厂分期"
        verbose_name_plural = "工厂分期"
        db_table = 'plant_phase_config'

    def __str__(self):
        return self.name


class ProductionLine(models.Model):
    """产线配置"""
    code = models.CharField(max_length=20, verbose_name="产线代码")
    name = models.CharField(max_length=50, verbose_name="产线名称")
    phase = models.ForeignKey(PlantPhase, on_delete=models.CASCADE, verbose_name="所属期数")
    description = models.TextField(blank=True, null=True, verbose_name="描述")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "产线"
        verbose_name_plural = "产线"
        db_table = 'production_line_config'
        unique_together = ['code', 'phase']  # 同一期数内产线代码唯一

    def __str__(self):
        return f"{self.phase.name} - {self.name}"


class Process(models.Model):
    """工序配置"""
    code = models.CharField(max_length=20, unique=True, verbose_name="工序代码")
    name = models.CharField(max_length=50, verbose_name="工序名称")
    description = models.TextField(blank=True, null=True, verbose_name="描述")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "工序"
        verbose_name_plural = "工序"
        db_table = 'process_config'

    def __str__(self):
        return self.name


class ShiftType(models.Model):
    """班次类型配置"""
    code = models.CharField(max_length=20, unique=True, verbose_name="班次代码")
    name = models.CharField(max_length=50, verbose_name="班次名称")
    description = models.TextField(blank=True, null=True, verbose_name="描述")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "班次类型"
        verbose_name_plural = "班次类型"
        db_table = 'shift_type_config'

    def __str__(self):
        return self.name

class BasicInfo(models.Model):
    uuid = models.UUIDField(primary_key = True,default = uuid.uuid4,editable = False)
    created_at = models.DateTimeField(default = timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
   
    class Meta:
        abstract = True

class Organization(BasicInfo):
    
    name = models.CharField(max_length=250)
    subdomain = models.CharField(max_length=250)
    max_assets = models.IntegerField(default=3)
    max_users = models.IntegerField(default=2)
    max_active_orders = models.IntegerField(default=100)

    def __str__(self):
        return 'Organization ' + self.name

    
class UserProfile(BasicInfo):
    
    organization = models.ForeignKey(Organization,on_delete=models.CASCADE,blank=True,null=True)
    user = models.OneToOneField(User,on_delete=models.CASCADE,blank=True,null=True)
    profile_photo = models.ImageField(default='default.jpg', upload_to='profile_images')
    type = models.CharField(max_length=50,default='Admin', choices=[('Admin', 'Admin'), ('Operator', 'Operator'),])
    plant_phase = models.CharField(max_length=20, blank=True, null=True, choices=[
        ('phase_1', '一期'), 
        ('phase_2', '二期')
    ], verbose_name="工厂分期")
    shift_type = models.CharField(max_length=20, blank=True, null=True, choices=[
        ('long_day_shift', '长白班'), 
        ('rotating_shift', '倒班')
    ], verbose_name="班次类型")
    # 权限控制字段
    can_add_assets = models.BooleanField(default=True, verbose_name="可添加设备")
    can_edit_assets = models.BooleanField(default=True, verbose_name="可编辑设备")
    can_delete_assets = models.BooleanField(default=False, verbose_name="可删除设备")
    
    can_add_maintenance_records = models.BooleanField(default=True, verbose_name="可添加维修记录")
    can_edit_maintenance_records = models.BooleanField(default=True, verbose_name="可编辑维修记录")
    can_delete_maintenance_records = models.BooleanField(default=False, verbose_name="可删除维修记录")
    
    can_add_manuals = models.BooleanField(default=False, verbose_name="可添加维修手册")
    can_edit_manuals = models.BooleanField(default=False, verbose_name="可编辑维修手册")
    can_delete_manuals = models.BooleanField(default=False, verbose_name="可删除维修手册")
    
    can_add_cases = models.BooleanField(default=False, verbose_name="可添加任务计划")
    can_edit_cases = models.BooleanField(default=False, verbose_name="可编辑任务计划")
    can_delete_cases = models.BooleanField(default=False, verbose_name="可删除任务计划")

    
    def __str__(self):
        return self.user.username
    
class Asset(models.Model):
    uuid = models.UUIDField(primary_key = True,default = uuid.uuid4,editable = False)
    organization = models.ForeignKey(Organization,on_delete=models.CASCADE,blank=True,null=True)
    name = models.CharField(max_length=250,default='',blank=True,null=True)
    ref = models.CharField(max_length=250,default='',blank=True,null=True)
    created_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated_at = models.DateTimeField(auto_now=True)
    photo = models.ImageField(default='default.jpg', upload_to='profile_images')
    purchase_date =  models.DateTimeField(blank=True, null=True)
    asset_type = models.CharField(max_length=100, default="Other", choices=[('Vehicle', 'Vehicle'), ('Equipment', 'Equipment'), ('Building', 'Building'), ('Furniture', 'Furniture'), ('IT', 'IT'), ('Other', 'Other')])
    location = models.CharField(max_length=250, blank=True, null=True)
    serial_number = models.CharField(max_length=100, default='')
    warranty_expiration_date = models.DateTimeField(blank=True, null=True)

    # 新增字段：期别、工序和产线（使用外键关联数据库配置）
    phase = models.ForeignKey(PlantPhase, on_delete=models.SET_NULL, blank=True, null=True, verbose_name="期数")
    process = models.ForeignKey(Process, on_delete=models.SET_NULL, blank=True, null=True, verbose_name="工序")
    production_line = models.ForeignKey('ProductionLine', on_delete=models.SET_NULL, blank=True, null=True, verbose_name="产线")

    cost = models.DecimalField(max_digits=10, decimal_places=2,default=0)
    current_value = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True,default=0)
    status = models.CharField(max_length=50,default='Active', choices=[('Active', 'Active'), ('Inactive', 'Inactive'), ('Under Maintenance', 'Under Maintenance'), ('Retired', 'Retired')])
    state = models.CharField(max_length=50,choices=Event_choices,default='',blank=True)
    def __str__(self):
        return self.name

class MaintenancePlan(BasicInfo):
    name = models.CharField(max_length=250,default='',blank=True,null=True)
    ref = models.CharField(max_length=250,default='',blank=True,null=True)
    created_by = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True,related_name='created_by')
    assigned_to = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True,related_name='assigned_to')
    asset = models.ForeignKey(Asset,on_delete=models.CASCADE,blank=True,null=True)
    planned_starting_date = models.DateTimeField(blank=True, null=True)
    planned_finished = models.DateTimeField(blank=True, null=True)
    started_at = models.DateTimeField(blank=True, null=True)
    finished_at = models.DateTimeField(blank=True, null=True)
    instructions = models.FileField(blank=True, null=True,upload_to='instructions')
    type = models.CharField(max_length=100, default="Planned", choices=[('Planned', 'Planned'),('Other', 'Other'),('UnPlanned', 'UnPlanned')])
    priority = models.CharField(max_length=50, default='Medium', choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')])
    status = models.CharField(max_length=50, default='Pending', choices=[('Pending', 'Pending'), ('In Progress', 'In Progress'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')])
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

@receiver(post_delete, sender=UserProfile)
def delete_user_after_custom_client_user_delete(sender, instance, **kwargs):
    user = User.objects.get(id=instance.user.id)
    user.delete()

@receiver(post_save, sender=UserProfile)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance.user)

@receiver(post_save, sender=MaintenancePlan)
def synchronize_asset_status(sender, instance=None, created=False, **kwargs):
    asset = instance.asset
    status_map={
        'In Progress':'Under Maintenance',
        'Pending':'Active',
        'Cancelled':'Active',
        'Completed':'Active'
    }
    if asset.status not in ['Inactive','Retired']:
        asset.status= status_map[instance.status]
        asset.save()
    
@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    """
    Handles password reset tokens
    When a token is created, an e-mail needs to be sent to the user
    :param sender: View Class that sent the signal
    :param instance: View Instance that sent the signal
    :param reset_password_token: Token Model Object
    :param args:
    :param kwargs:
    :return:
    """
    context = {
        'current_user': reset_password_token.user,
        'username': reset_password_token.user.username,
        'email': reset_password_token.user.email,
        'pin_code': reset_password_token.key
    }
    email_html_message = render_to_string('db/user_reset_password.html', context)
    send_mail( "Password reset", email_html_message, os.getenv('EMAIL_HOST_USER'), [reset_password_token.user.email] )