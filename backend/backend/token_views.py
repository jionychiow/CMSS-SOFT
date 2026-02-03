from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class SSOObtainPairView(TokenObtainPairView):
    """
    自定义Token获取视图，实现单点登录功能
    当用户登录时，会将该用户之前的所有tokens加入黑名单
    """
    def post(self, request, *args, **kwargs):
        # 首先调用父类的post方法获取token
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 获取用户名
        username = request.data.get('username')
        password = request.data.get('password')

        # 验证用户凭据
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # 将该用户之前的所有活跃tokens加入黑名单
        self.blacklist_user_tokens(user)

        # 生成新的token
        token_data = serializer.validated_data

        return Response(token_data, status=status.HTTP_200_OK)

    def blacklist_user_tokens(self, user):
        """
        将指定用户的所有现有tokens加入黑名单
        """
        try:
            # 获取该用户的所有现有tokens
            outstanding_tokens = OutstandingToken.objects.filter(user=user)

            # 批量创建黑名单记录，提高性能
            blacklisted_tokens = []
            for token in outstanding_tokens:
                # 检查token是否已经在黑名单中
                if not BlacklistedToken.objects.filter(token=token).exists():
                    blacklisted_tokens.append(BlacklistedToken(token=token))
            
            # 批量插入
            if blacklisted_tokens:
                BlacklistedToken.objects.bulk_create(blacklisted_tokens, ignore_conflicts=True)
                logger.info(f"已将用户 {user.username} 的 {len(blacklisted_tokens)} 个tokens加入黑名单")
        except Exception as e:
            # 记录错误但不中断登录过程
            logger.error(f"将用户 {user.username} 的tokens加入黑名单时出错: {str(e)}")


class SSOTokenRefreshView(TokenObtainPairView):
    """
    自定义Token刷新视图，也可以选择性地实施单点登录策略
    """
    pass