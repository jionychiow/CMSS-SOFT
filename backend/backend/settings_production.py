"""
Production Django settings for backend project.
"""

from .settings import *

import os
from decouple import config
from pathlib import Path

# PyMySQL compatibility for MySQL
import pymysql
pymysql.install_as_MySQLdb()

# Override settings for production
DEBUG = False

# Allow all hosts in production
ALLOWED_HOSTS = ['*']

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Use environment-specific secret key
SECRET_KEY = config('SECRET_KEY', default='django-insecure-production-key-change-in-production')

# Always use MySQL database for production
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'oee_database')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '12345678')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
    }
}

# MySQL配置添加SQL模式设置
if 'mysql' in DATABASES['default']['ENGINE']:
    DATABASES['default'].setdefault('OPTIONS', {})
    DATABASES['default']['OPTIONS'].setdefault('sql_mode', 'STRICT_TRANS_TABLES')