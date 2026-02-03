#!/usr/bin/env python
"""用于启动Django服务器的脚本，固定使用8001端口"""

import os
import sys
from django.core.management import execute_from_command_line

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    # 如果没有提供命令，则默认启动服务器在8001端口
    if len(sys.argv) == 1:
        sys.argv = ['manage.py', 'runserver', '8001']
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()