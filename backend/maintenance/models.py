from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class ShiftType(models.TextChoices):
    LONG_DAY_SHIFT = 'long_day_shift', '长白班'
    ROTATING_SHIFT = 'rotating_shift', '倒班'


class PlantPhase(models.TextChoices):
    PHASE_1 = 'phase_1', '一期'
    PHASE_2 = 'phase_2', '二期'


class UserProfileExtension(models.Model):
    """扩展现有的用户资料模型，添加工厂分期和班次信息"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    plant_phase = models.CharField(
        max_length=20,
        choices=PlantPhase.choices,
        default=PlantPhase.PHASE_1
    )
    shift_type = models.CharField(
        max_length=20,
        choices=ShiftType.choices,
        default=ShiftType.LONG_DAY_SHIFT
    )
    # 权限控制：增删改权限
    can_add = models.BooleanField(default=True)
    can_edit = models.BooleanField(default=True)
    can_delete = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.get_plant_phase_display()} - {self.get_shift_type_display()}"


