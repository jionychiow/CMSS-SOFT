from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from .serializers import OrganizationSerializer,AssetSerializer,\
    MaintenancePlanSerializer,MaintenancePlanSerializerWrite\
    ,UserProfileSerializer
from db.models import Organization,Asset,MaintenancePlan,UserProfile
from django.contrib.auth.models import User
from rest_framework import authentication,status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from .permissions import OrganizationCreatePermission,\
    AssetsPermission,MaintenancePermission,UserProfilePermission
from rest_framework.views import APIView
# Create your views here.
import logging
import uuid,os
from dotenv import load_dotenv
load_dotenv()


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    serializer_class = OrganizationSerializer
    queryset = Organization.objects.all()
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [OrganizationCreatePermission]

    @action(detail=True, methods=['post'])
    def add_admin(self, request, pk=None):
        from django.contrib.auth.models import User
        organization = self.get_object()
        try:
            user = User.objects.get(email=request.data['email'])
        except User.DoesNotExist:
            user = User.objects.create(
                username=request.data['username'],
                email=request.data['email'],
                first_name=request.data['first_name'],
                last_name=request.data['last_name'],
                is_staff=True
            )
            user.set_password(request.data['password'])
            user.save()
        
        try:
            user_profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            user_profile = UserProfile.objects.create(
                user=user,
                organization=organization,
                type='Admin'
            )
        
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)


class AssetViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing MaintenancePlan
    """
    serializer_class = AssetSerializer
    queryset = Asset.objects.all()
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [AssetsPermission]
    
    def get_queryset(self, *args, **kwargs):
        # 检查并确保用户有有效的用户配置文件和组织
        try:
            user_profile = getattr(self.request.user, 'userprofile', None)
            if user_profile is None:
                # 创建一个新的UserProfile
                from db.models import UserProfile, Organization
                # 创建默认组织（如果需要的话）
                default_org, created = Organization.objects.get_or_create(
                    name='Default Organization',
                    defaults={'subdomain': 'default', 'max_assets': 100, 'max_users': 10, 'max_active_orders': 50}
                )
                user_profile = UserProfile.objects.create(
                    user=self.request.user,
                    organization=default_org
                )
        except Exception as e:
            print(f"Error ensuring user profile: {e}")
            return Asset.objects.none()  # 返回空查询集
        
        if(user_profile.type == 'Admin'):
            return Asset.objects.filter(organization=user_profile.organization)
        else:
            return Asset.objects.filter(organization=user_profile.organization, created_by=self.request.user)

    def perform_create(self, serializer):
        # 在创建资产时自动关联到当前用户和组织
        user_profile = getattr(self.request.user, 'userprofile', None)
        if user_profile is None:
            # 创建一个新的UserProfile
            from db.models import UserProfile, Organization
            # 创建默认组织（如果需要的话）
            default_org, created = Organization.objects.get_or_create(
                name='Default Organization',
                defaults={'subdomain': 'default', 'max_assets': 100, 'max_users': 10, 'max_active_orders': 50}
            )
            user_profile = UserProfile.objects.create(
                user=self.request.user,
                organization=default_org
            )
        
        # 设置资产的组织和创建者
        serializer.save(organization=user_profile.organization, created_by=self.request.user)


class MaintenancePlanViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing MaintenancePlan
    """
    serializer_class = MaintenancePlanSerializer
    queryset = MaintenancePlan.objects.all()
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes =[MaintenancePermission]
    
    def get_queryset(self, *args, **kwargs):
        # 检查并确保用户有有效的用户配置文件和组织
        try:
            user_profile = getattr(self.request.user, 'userprofile', None)
            if user_profile is None:
                # 创建一个新的UserProfile
                from db.models import UserProfile, Organization
                # 创建默认组织（如果需要的话）
                default_org, created = Organization.objects.get_or_create(
                    name='Default Organization',
                    defaults={'subdomain': 'default', 'max_assets': 100, 'max_users': 10, 'max_active_orders': 50}
                )
                user_profile = UserProfile.objects.create(
                    user=self.request.user,
                    organization=default_org
                )
        except Exception as e:
            print(f"Error ensuring user profile: {e}")
            return MaintenancePlan.objects.none()  # 返回空查询集
        
        if(user_profile.type == 'Admin'):
            return MaintenancePlan.objects.filter(asset__organization=user_profile.organization).select_related('asset','assigned_to')
        else:
            return MaintenancePlan.objects.filter(asset__organization=user_profile.organization, created_by=self.request.user).select_related('asset','assigned_to')
    
    def perform_create(self, serializer):
        # 在创建维护计划时自动关联到当前用户
        user_profile = getattr(self.request.user, 'userprofile', None)
        if user_profile is None:
            # 创建一个新的UserProfile
            from db.models import UserProfile, Organization
            # 创建默认组织（如果需要的话）
            default_org, created = Organization.objects.get_or_create(
                name='Default Organization',
                defaults={'subdomain': 'default', 'max_assets': 100, 'max_users': 10, 'max_active_orders': 50}
            )
            user_profile = UserProfile.objects.create(
                user=self.request.user,
                organization=default_org
            )
        
        # 设置维护计划的组织
        asset = serializer.validated_data.get('asset')
        if asset:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save(created_by=self.request.user)


class MaintenanceWritePlanViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing MaintenancePlan
    """
    serializer_class = MaintenancePlanSerializerWrite
    queryset = MaintenancePlan.objects.all()
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes =[MaintenancePermission]
    
    def ensure_user_profile(self):
        """确保用户有UserProfile，如果没有则创建一个"""
        try:
            user_profile = getattr(self.request.user, 'userprofile', None)
            if user_profile is None:
                # 创建一个新的UserProfile
                from db.models import UserProfile, Organization
                # 创建默认组织（如果需要的话）
                default_org, created = Organization.objects.get_or_create(
                    name='Default Organization',
                    defaults={'subdomain': 'default', 'max_assets': 100, 'max_users': 10, 'max_active_orders': 50}
                )
                user_profile = UserProfile.objects.create(
                    user=self.request.user,
                    organization=default_org
                )
            return user_profile
        except Exception as e:
            print(f"Error ensuring user profile: {e}")
            return None
    
    def get_queryset(self, *args, **kwargs):
        # 检查并确保用户有有效的用户配置文件和组织
        user_profile = self.ensure_user_profile()
        if not user_profile or not user_profile.organization:
            return MaintenancePlan.objects.none()  # 返回空查询集
        return MaintenancePlan.objects.filter(asset__organization=user_profile.organization).select_related('asset','assigned_to')

    def perform_create(self, serializer):
        # 在创建维护计划时自动关联到当前用户
        user_profile = self.ensure_user_profile()
        if user_profile is None:
            return
        
        # 设置维护计划的组织
        asset = serializer.validated_data.get('asset')
        if asset:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save(created_by=self.request.user)


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing MaintenancePlan
    """
    serializer_class = UserProfileSerializer
    queryset = UserProfile.objects.all()
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [UserProfilePermission]
    def get_queryset(self, *args, **kwargs):
        # 检查并确保用户有有效的用户配置文件和组织
        user_profile = self.ensure_user_profile()
        
        # 如果是管理员，则返回所有用户
        if user_profile and hasattr(user_profile, 'type') and user_profile.type == 'Admin':
            return UserProfile.objects.select_related('user')
        
        # 对于普通用户，只返回同一组织内的用户
        if not user_profile or not user_profile.organization:
            return UserProfile.objects.none()  # 返回空查询集
        return UserProfile.objects.filter(organization=user_profile.organization).select_related('user')
    
    def ensure_user_profile(self):
        """确保用户有UserProfile，如果没有则创建一个"""
        try:
            user_profile = getattr(self.request.user, 'userprofile', None)
            if user_profile is None:
                # 创建一个新的UserProfile
                from db.models import UserProfile, Organization
                # 创建默认组织（如果需要的话）
                default_org, created = Organization.objects.get_or_create(
                    name='Default Organization',
                    defaults={'subdomain': 'default', 'max_assets': 100, 'max_users': 10, 'max_active_orders': 50}
                )
                user_profile = UserProfile.objects.create(
                    user=self.request.user,
                    organization=default_org
                )
            return user_profile
        except Exception as e:
            print(f"Error ensuring user profile: {e}")
            return None

    def create(self,request, *args, **kwargs):
        # 确保用户有有效的用户配置文件和组织
        user_profile = self.ensure_user_profile()
        if not user_profile or not user_profile.organization:
            return Response({"detail": "Unable to create or access user organization."}, status.HTTP_400_BAD_REQUEST)

        max_allowed_users = UserProfile.objects.filter(organization=user_profile.organization).count()
        if(max_allowed_users >= user_profile.organization.max_users):
            return Response({"detail":"You reached your max Orders possible"},status.HTTP_402_PAYMENT_REQUIRED)
        
        
        try:
            is_email_exist = UserProfile.objects.filter(user__email=request.data['email']).count()
            if (is_email_exist > 0) :
                return Response({"detail":"E-mail already exist" },status.HTTP_400_BAD_REQUEST)
        except Exception as ex:
            return Response({"detail":"Bad Request" },status.HTTP_400_BAD_REQUEST)
        try :
            temp_password = uuid.uuid4()
            subject = "Invitation from: " + str(request.user.first_name) + ' ' + str(request.user.first_name)
            text = "Hello " + request.data['first_name'] + " " + request.data['last_name'] + ",\n"
            text += 'You have been invite to OEE & CMMS Software as a new User.\nYour Username is: ' + request.data['username'] + '\n' +'Temporary password is: ' + str(temp_password)  + '\n'+\
                    'You can access through: localhost\n'
            
            email = request.data['email']
            email_sent = send_mail( subject, text, os.getenv('EMAIL_HOST_USER'), [email] )
            logging.warning(email_sent)

        except Exception as ex:
            return Response({"detail":"Bad Request" },status.HTTP_400_BAD_REQUEST)
        
        
        try :
            user_type = request.data['type']
        except Exception as ex:
            return Response({"detail":"Bad Request" },status.HTTP_400_BAD_REQUEST)
        
        try :
            user = User.objects.create(
                username=request.data['username'],
                email=request.data['email'],
                first_name=request.data['first_name'],
                last_name=request.data['last_name'],
            )
            user.set_password(request.data['password'])
            user.save()
        except Exception as ex:
            return Response({"detail":"Bad Request" },status.HTTP_400_BAD_REQUEST)

        try :
            userprofile = UserProfile.objects.create(type=user_type,user=user, organization=request.user.userprofile.organization)
            serialiser = UserProfileSerializer(userprofile)
            return Response(serialiser.data,status.HTTP_201_CREATED)
        except Exception as ex:
            return Response({"detail":"Bad Request" },status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if(instance.user == request.user):
            return Response({"detail":"You cannot delete your own user"},status.HTTP_400_BAD_REQUEST)
        if(instance.user.userprofile.organization == request.user.userprofile.organization):
            
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        return Response({"detail":"You cannot delete outside of your organization"},status.HTTP_401_UNAUTHORIZED)


class MyMaintenancePlanViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing MaintenancePlan
    """
    serializer_class = MaintenancePlanSerializer
    queryset = MaintenancePlan.objects.all()
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes =[MaintenancePermission]
    def get_queryset(self, *args, **kwargs):
        # 检查并确保用户有有效的用户配置文件和组织
        user_profile = self.ensure_user_profile()
        if not user_profile or not user_profile.organization:
            return MaintenancePlan.objects.none()  # 返回空查询集
        return MaintenancePlan.objects.filter(asset__organization=user_profile.organization,\
                                              assigned_to=self.request.user)\
                                                .exclude(status='Completed')\
                                                .exclude(status='Cancelled').select_related('asset','assigned_to')

    def ensure_user_profile(self):
        """确保用户有UserProfile，如果没有则创建一个"""
        try:
            user_profile = getattr(self.request.user, 'userprofile', None)
            if user_profile is None:
                # 创建一个新的UserProfile
                from db.models import UserProfile, Organization
                # 创建默认组织（如果需要的话）
                default_org, created = Organization.objects.get_or_create(
                    name='Default Organization',
                    defaults={'subdomain': 'default', 'max_assets': 100, 'max_users': 10, 'max_active_orders': 50}
                )
                user_profile = UserProfile.objects.create(
                    user=self.request.user,
                    organization=default_org
                )
            return user_profile
        except Exception as e:
            print(f"Error ensuring user profile: {e}")
            return None


class MyProfileViewSet(APIView):
    """
    A view for getting the current user's profile
    """
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [UserProfilePermission]
    
    def get(self, request):
        try:
            user_profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(user_profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users_for_assignment(request):
    """
    获取所有用户列表，用于分配任务时选择实施人
    返回所有活跃用户（与任务计划保持一致）
    """
    try:
        # 获取所有活跃用户及其关联的UserProfile（如果存在）
        users = User.objects.filter(is_active=True).select_related('userprofile').all()
        
        # 构建响应
        result = []
        for user in users:
            # 检查用户是否有UserProfile
            if hasattr(user, 'userprofile') and user.userprofile:
                profile = user.userprofile
                result.append({
                    'id': profile.id,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    },
                    'type': profile.type,
                    'plant_phase': profile.plant_phase,
                    'shift_type': profile.shift_type
                })
            else:
                # 如果没有UserProfile，则创建一个基本结构
                result.append({
                    'id': None,  # 没有UserProfile时ID为None
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    },
                    'type': 'Operator',  # 默认类型
                    'plant_phase': None,
                    'shift_type': None
                })
        
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)