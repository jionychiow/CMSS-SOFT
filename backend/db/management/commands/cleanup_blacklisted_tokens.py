import os
import sys
import django
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from db.models_activity import UserActivity

class Command(BaseCommand):
    help = '清理超过7天的黑名单tokens和用户活动记录'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='清理多少天前的数据 (默认: 7天)'
        )

    def handle(self, *args, **options):
        days = options['days']
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # 计算即将被删除的黑名单tokens数量
        old_blacklisted_tokens = BlacklistedToken.objects.filter(token__created_at__lt=cutoff_date)
        token_count = old_blacklisted_tokens.count()
        
        if token_count > 0:
            self.stdout.write(
                self.style.WARNING(f'准备删除 {token_count} 个创建时间早于 {cutoff_date.strftime("%Y-%m-%d %H:%M:%S")} 的黑名单tokens')
            )
            
            # 执行删除
            deleted_token_count, _ = old_blacklisted_tokens.delete()
            
            self.stdout.write(
                self.style.SUCCESS(f'成功删除了 {deleted_token_count} 个旧的黑名单tokens')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'没有找到创建时间早于 {cutoff_date.strftime("%Y-%m-%d %H:%M:%S")} 的黑名单tokens')
            )
        
        # 同时清理旧的未过期tokens（可选，有助于保持数据库整洁）
        old_outstanding_tokens = OutstandingToken.objects.filter(created_at__lt=cutoff_date)
        outstanding_count = old_outstanding_tokens.count()
        
        if outstanding_count > 0:
            self.stdout.write(
                self.style.WARNING(f'发现 {outstanding_count} 个旧的未过期tokens（已超过7天），也将被清理')
            )
            old_outstanding_tokens.delete()
            self.stdout.write(
                self.style.SUCCESS(f'成功清理了 {outstanding_count} 个旧的未过期tokens')
            )
        
        # 清理超过指定天数的用户活动记录
        old_activities = UserActivity.objects.filter(timestamp__lt=cutoff_date)
        activity_count = old_activities.count()
        
        if activity_count > 0:
            self.stdout.write(
                self.style.WARNING(f'准备删除 {activity_count} 条创建时间早于 {cutoff_date.strftime("%Y-%m-%d %H:%M:%S")} 的用户活动记录')
            )
            
            # 执行删除
            deleted_activity_count, _ = old_activities.delete()
            
            self.stdout.write(
                self.style.SUCCESS(f'成功删除了 {deleted_activity_count} 条旧的用户活动记录')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'没有找到创建时间早于 {cutoff_date.strftime("%Y-%m-%d %H:%M:%S")} 的用户活动记录')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'数据清理任务完成 - 总共删除了 {token_count} 个黑名单tokens 和 {activity_count} 条用户活动记录')
        )