import os
import sys
import django
from django.conf import settings
from django.core.management import call_command
from django.db import models
from django.utils import timezone
from datetime import timedelta
import threading
import time
import logging

logger = logging.getLogger(__name__)

class TokenCleanupScheduler:
    """
    Token清理调度器 - 定期清理超过7天的黑名单tokens
    """
    
    def __init__(self):
        self.is_running = False
        self.thread = None
    
    def cleanup_tokens(self):
        """
        执行token清理
        """
        try:
            logger.info("开始执行黑名单token清理任务")
            call_command('cleanup_blacklisted_tokens', days=7)
            logger.info("黑名单token清理任务完成")
        except Exception as e:
            logger.error(f"黑名单token清理任务失败: {str(e)}")
    
    def start_scheduler(self):
        """
        启动调度器 - 每24小时运行一次清理任务
        """
        if self.is_running:
            return
            
        self.is_running = True
        
        def run_schedule():
            while self.is_running:
                try:
                    # 等待24小时（86400秒）再执行下一次清理
                    time.sleep(24 * 60 * 60)  # 24小时
                    self.cleanup_tokens()
                except Exception as e:
                    logger.error(f"调度器运行错误: {str(e)}")
                    if not self.is_running:
                        break
        
        self.thread = threading.Thread(target=run_schedule, daemon=True)
        self.thread.start()
        logger.info("Token清理调度器已启动")
    
    def stop_scheduler(self):
        """
        停止调度器
        """
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=5)  # 等待最多5秒
        logger.info("Token清理调度器已停止")

# 全局调度器实例
scheduler = TokenCleanupScheduler()

def start_cleanup_scheduler():
    """
    启动token清理调度器
    """
    scheduler.start_scheduler()

def stop_cleanup_scheduler():
    """
    停止token清理调度器
    """
    scheduler.stop_scheduler()