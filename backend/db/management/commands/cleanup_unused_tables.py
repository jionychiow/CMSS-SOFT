from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = '清理数据库中无用的表'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # 获取所有表名
            cursor.execute("SHOW TABLES;")
            tables = cursor.fetchall()
            all_tables = [table[0] for table in tables]
            
            # 定义需要保留的表（与维修系统相关的表）
            keep_tables = [
                # Django默认表
                'auth_group',
                'auth_group_permissions',
                'auth_permission',
                'auth_user',
                'auth_user_groups',
                'auth_user_user_permissions',
                'django_admin_log',
                'django_content_type',
                'django_migrations',
                'django_session',
                
                # 用户和认证相关
                'maintenance_userprofile',
                'maintenance_userprofileextension',
                
                # 组织相关
                'db_organization',
                
                # 资产相关
                'db_asset',
                
                # 新增的维修系统表
                'db_maintenancerecord',
                'db_maintenancemanual',
                'db_maintenancecase',
                
                # 维修计划相关
                'db_maintenanceplan',
                
                # 辅助操作员关系表
                'db_maintenancerecord_assistant_operators',
            ]
            
            # 识别需要删除的表
            delete_tables = []
            for table in all_tables:
                if table not in keep_tables:
                    delete_tables.append(table)
            
            # 按依赖关系排序，先删除被引用的表
            ordered_delete_tables = [
                # 首先删除依赖其他表的表
                'excelhandler_maintenancerecord',
                'excelhandler_maintenancehistory',
                'account_emailconfirmation',
                'maintenance_maintenancerecord',
                'maintenance_equipmentmaintenancelibrary',
                
                # 然后删除被引用的表
                'account_emailaddress',
                'excelhandler_equipment',
                'excelhandler_excelupload',
                
                # 最后删除其他表
                'authtoken_token',
                'db_userprofile',
                'django_rest_passwordreset_resetpasswordtoken',
                'django_site',
            ]
            
            # 确保所有需要删除的表都在列表中
            for table in delete_tables:
                if table not in ordered_delete_tables:
                    ordered_delete_tables.append(table)
            
            if delete_tables:
                self.stdout.write(
                    self.style.WARNING(f'将要删除以下 {len(delete_tables)} 个表:')
                )
                for table in delete_tables:
                    self.stdout.write(f'  - {table}')
                
                self.stdout.write(
                    self.style.WARNING('正在自动删除无用表...')
                )
                
                # 按顺序删除表
                for table in ordered_delete_tables:
                    if table in delete_tables:
                        try:
                            # 先尝试删除外键约束
                            cursor.execute(f"SET FOREIGN_KEY_CHECKS = 0;")
                            cursor.execute(f'DROP TABLE IF EXISTS `{table}`;')
                            cursor.execute(f"SET FOREIGN_KEY_CHECKS = 1;")
                            self.stdout.write(
                                self.style.SUCCESS(f'成功删除表: {table}')
                            )
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f'删除表 {table} 失败: {str(e)}')
                            )
                            # 即使失败也继续处理下一个表
            else:
                self.stdout.write(
                    self.style.SUCCESS('没有需要删除的无用表')
                )