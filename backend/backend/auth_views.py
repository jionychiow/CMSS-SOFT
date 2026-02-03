from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class SSOAuthTokenView(ObtainAuthToken):
    """
    自定义Token获取视图，实现单点登录功能
    当用户登录时，会将该用户之前的所有tokens加入黑名单
    """
    
    def post(self, request, *args, **kwargs):
        # 获取用户名和密码
        username = request.data.get('username')
        password = request.data.get('password')

        # 验证用户凭据
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'non_field_errors': ['Unable to log in with provided credentials.']}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # 将该用户之前的所有活跃tokens加入黑名单
        self.blacklist_user_tokens(user)

        # 获取或创建新的token
        token, created = Token.objects.get_or_create(user=user)

        return Response({'token': token.key})

    def blacklist_user_tokens(self, user):
        """
        将指定用户的所有现有tokens加入黑名单
        注意：对于DRF Token Authentication，我们只是删除旧的Token
        """
        try:
            # 删除该用户现有的所有DRF tokens（实现单点登录）
            from rest_framework.authtoken.models import Token
            existing_tokens = Token.objects.filter(user=user)
            
            token_count = existing_tokens.count()
            if token_count > 0:
                existing_tokens.delete()
                logger.info(f"已删除用户 {user.username} 的 {token_count} 个旧的DRF tokens")
            
            # 同时也要处理JWT tokens，以防万一用户同时使用两种认证方式
            # 先检查模型是否可用
            try:
                outstanding_tokens = OutstandingToken.objects.filter(user=user)
                blacklisted_tokens = []
                for token in outstanding_tokens:
                    if not BlacklistedToken.objects.filter(token=token).exists():
                        blacklisted_tokens.append(BlacklistedToken(token=token))
                
                if blacklisted_tokens:
                    BlacklistedToken.objects.bulk_create(blacklisted_tokens, ignore_conflicts=True)
                    logger.info(f"已将用户 {user.username} 的 {len(blacklisted_tokens)} 个JWT tokens加入黑名单")
            except Exception as jwt_exception:
                # 如果JWT相关模型不可用，记录错误但不影响基本功能
                logger.warning(f"处理用户 {user.username} 的JWT tokens时出错: {str(jwt_exception)}")
                
        except Exception as e:
            logger.error(f"处理用户 {user.username} 的tokens时出错: {str(e)}")