from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from db.models_maintenance import MaintenanceRecord, MaintenanceManual, MaintenanceCase
from db.models import Asset, Organization
from maintenance.models import UserProfileExtension
from django.db import transaction
from django.db.models.signals import post_save
from maintenance.signals import create_user_profile_extension, save_user_profile_extension
from django.utils import timezone
from datetime import datetime


class Command(BaseCommand):
    help = '初始化维修系统示例数据'

    def handle(self, *args, **options):
        # 临时断开信号连接以防止重复创建UserProfileExtension
        post_save.disconnect(create_user_profile_extension, sender=User)
        post_save.disconnect(save_user_profile_extension, sender=User)
        
        try:
            # 创建示例组织
            org, created = Organization.objects.get_or_create(
                name='示例工厂',
                defaults={
                    'subdomain': 'sample-factory',
                    'max_assets': 100,
                    'max_users': 50,
                    'max_active_orders': 200
                }
            )
            
            # 创建示例资产/设备
            asset1, created = Asset.objects.get_or_create(
                name='1-1#生产线设备',
                organization=org,
                defaults={
                    'ref': 'PROD-001',
                    'location': '一期车间',
                    'serial_number': 'SN-001',
                    'warranty_expiration_date': '2026-12-31',
                    'purchase_date': '2020-01-15',
                    'asset_type': 'Equipment',
                    'status': 'Active'
                }
            )
            
            asset2, created = Asset.objects.get_or_create(
                name='2-1#生产线设备',
                organization=org,
                defaults={
                    'ref': 'PROD-002',
                    'location': '二期车间',
                    'serial_number': 'SN-002',
                    'warranty_expiration_date': '2026-11-30',
                    'purchase_date': '2021-03-20',
                    'asset_type': 'Equipment',
                    'status': 'Active'
                }
            )
            
            # 创建示例用户（如果不存在）
            user1, created = User.objects.get_or_create(
                username='张三',
                defaults={
                    'email': 'zhangsan@example.com',
                    'first_name': '张',
                    'last_name': '三',
                    'is_staff': True,
                    'is_superuser': False
                }
            )
            
            # 手动创建或更新用户配置文件扩展
            profile1, profile_created = UserProfileExtension.objects.get_or_create(
                user=user1,
                defaults={
                    'plant_phase': 'phase_1',
                    'shift_type': 'long_day_shift'
                }
            )
            
            user2, created = User.objects.get_or_create(
                username='李四',
                defaults={
                    'email': 'lisi@example.com',
                    'first_name': '李',
                    'last_name': '四',
                    'is_staff': True,
                    'is_superuser': False
                }
            )
            
            # 手动创建或更新用户配置文件扩展
            profile2, profile_created = UserProfileExtension.objects.get_or_create(
                user=user2,
                defaults={
                    'plant_phase': 'phase_2',
                    'shift_type': 'rotating_shift'
                }
            )
        
            # 创建维修记录
            record1 = MaintenanceRecord.objects.create(
                organization=org,
                phase='phase_1',
                shift='long_day_shift',
                production_line='1-1#',
                asset=asset1,
                title='轴承更换',
                description='更换1-1#生产线主轴承，发现磨损严重',
                main_operator=user1,
                start_time=datetime(2026, 1, 10, 8, 0, 0),
                end_time=datetime(2026, 1, 10, 12, 0, 0),
                status='completed'
            )
            
            record2 = MaintenanceRecord.objects.create(
                organization=org,
                phase='phase_2',
                shift='rotating_shift',
                production_line='2-1#',
                asset=asset2,
                title='电机维修',
                description='2-1#生产线电机过热故障维修',
                main_operator=user2,
                start_time=datetime(2026, 1, 11, 20, 0, 0),
                end_time=datetime(2026, 1, 12, 2, 0, 0),
                status='completed'
            )
            
            # 添加助手到记录
            record1.assistant_operators.add(user2)
            
            # 创建维修手册
            manual1 = MaintenanceManual.objects.create(
                organization=org,
                production_line='1-1#',
                process='装配工序',
                equipment_name='主装配机',
                title='主装配机定期保养',
                description='主装配机定期保养说明',
                repair_steps='1. 检查润滑油位\n2. 清洁过滤器\n3. 检查皮带张力\n4. 测试安全装置',
                created_by=user1
            )
            
            manual2 = MaintenanceManual.objects.create(
                organization=org,
                production_line='2-1#',
                process='包装工序',
                equipment_name='包装机',
                title='包装机故障排除',
                description='包装机故障排除说明',
                repair_steps='1. 检查传送带\n2. 校准传感器\n3. 更换磨损部件',
                created_by=user2
            )
            
            # 创建维修故障案例
            case1 = MaintenanceCase.objects.create(
                organization=org,
                process='装配工序',
                equipment_name='主装配机',
                fault_reason='润滑不足导致摩擦增大',
                fault_phenomenon='轴承温度异常升高，伴有异常噪音',
                fault_handling_method='1. 立即停机\n2. 检查润滑系统\n3. 补充润滑油\n4. 更换轴承',
                created_by=user1
            )
            
            case2 = MaintenanceCase.objects.create(
                organization=org,
                process='包装工序',
                equipment_name='包装机',
                fault_reason='传感器积尘导致误触发',
                fault_phenomenon='频繁报警，生产中断',
                fault_handling_method='1. 清洁传感器\n2. 调整灵敏度\n3. 定期维护',
                created_by=user2
            )
        finally:
            # 重新连接信号
            post_save.connect(create_user_profile_extension, sender=User)
            post_save.connect(save_user_profile_extension, sender=User)

        self.stdout.write(
            self.style.SUCCESS(
                f'成功创建示例数据：\n'
                f'- 维修记录: {MaintenanceRecord.objects.count()} 条\n'
                f'- 维修手册: {MaintenanceManual.objects.count()} 份\n'
                f'- 故障案例: {MaintenanceCase.objects.count()} 个\n'
                f'- 设备: {Asset.objects.count()} 台\n'
                f'- 用户: {User.objects.count()} 个'
            )
        )