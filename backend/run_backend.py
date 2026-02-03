#!/usr/bin/env python
"""
Backend 运行脚本
用于启动 Django 开发服务器、运行迁移等操作
"""
import os
import sys
import subprocess
from django.core.management import execute_from_command_line

def main():
    """主函数，处理命令行参数并启动相应服务"""
    # 检查环境变量决定使用哪个设置
    env = os.getenv('DJANGO_ENV', 'development')
    if env == 'production':
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_production')
    else:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_local')

    # 显示日志配置信息
    log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    print(f"日志文件将保存在: {log_dir}/")
    print(f"常规日志: {os.path.join(log_dir, 'django.log')}")
    print(f"错误日志: {os.path.join(log_dir, 'django_error.log')}")

    # 检查是否有特殊参数
    if len(sys.argv) > 1:
        if sys.argv[1] == 'migrate':
            # 执行数据库迁移
            execute_from_command_line(['manage.py', 'makemigrations'])
            execute_from_command_line(['manage.py', 'migrate'])
            print("数据库迁移完成！")
        elif sys.argv[1] == 'createsuperuser':
            # 创建超级用户
            execute_from_command_line(['manage.py', 'createsuperuser'])
        elif sys.argv[1] == 'collectstatic':
            # 收集静态文件
            execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
        elif sys.argv[1] == 'runserver':
            # 如果指定了runserver，使用指定的主机和端口
            if len(sys.argv) >= 3:
                addrport = sys.argv[2]
            else:
                addrport = '8001'
            print(f"启动后端服务器在 http://0.0.0.0:{addrport.split(':')[-1] if ':' in addrport else addrport}/")
            execute_from_command_line(['manage.py', 'runserver', addrport])
        else:
            # 直接执行传入的命令
            execute_from_command_line(sys.argv)
    else:
        # 默认启动服务器在8001端口
        print("启动后端服务器在 http://0.0.0.0:8001/")
        execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8001'])

if __name__ == '__main__':
    main()