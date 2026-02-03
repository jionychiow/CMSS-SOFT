from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class DbConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'db'
    
    def ready(self):
        # 导入模型以确保信号处理器被注册
        from . import models
        
        # 启动token清理调度器
        try:
            from .token_cleanup_scheduler import start_cleanup_scheduler
            start_cleanup_scheduler()
            logger.info("Token清理调度器已启动")
        except Exception as e:
            logger.error(f"启动Token清理调度器失败: {str(e)}")
