from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from maintenance.models import UserProfileExtension


@receiver(post_save, sender=User)
def create_user_profile_extension(sender, instance, created, **kwargs):
    """
    当创建新用户时自动创建UserProfileExtension
    """
    if created:
        try:
            UserProfileExtension.objects.create(user=instance)
        except Exception:
            # 如果已经存在，则跳过（避免重复创建错误）
            pass


@receiver(post_save, sender=User)
def save_user_profile_extension(sender, instance, **kwargs):
    """
    当用户更新时保存UserProfileExtension
    """
    try:
        if hasattr(instance, 'userprofileextension'):
            instance.userprofileextension.save()
    except UserProfileExtension.DoesNotExist:
        # 如果UserProfileExtension不存在，创建一个
        UserProfileExtension.objects.create(user=instance)