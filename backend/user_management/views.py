from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from db.models import UserProfile
import re


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # 只有认证用户才能添加新用户
def create_user(request):
    """
    创建新用户
    要求：用户名必须是中文，需要密码和权限信息
    """
    data = request.data
    
    username = data.get('username', '').strip()
    password = data.get('password', '')
    plant_phase = data.get('plant_phase', '')  # 工厂分期：'phase_1'(一期) 或 'phase_2'(二期)
    shift_type = data.get('shift_type', '')   # 班次类型：'long_day_shift'(长白班) 或 'rotating_shift'(倒班)
    user_type = data.get('type', 'Operator')  # 用户类型：'Admin'(管理员) 或 'Operator'(操作员)
    
    # 权限字段
    can_add_assets = data.get('can_add_assets', True)
    can_edit_assets = data.get('can_edit_assets', True)
    can_delete_assets = data.get('can_delete_assets', False)
    
    can_add_maintenance_records = data.get('can_add_maintenance_records', True)
    can_edit_maintenance_records = data.get('can_edit_maintenance_records', True)
    can_delete_maintenance_records = data.get('can_delete_maintenance_records', False)
    
    can_add_manuals = data.get('can_add_manuals', False)
    can_edit_manuals = data.get('can_edit_manuals', False)
    can_delete_manuals = data.get('can_delete_manuals', False)
    
    can_add_cases = data.get('can_add_cases', False)
    can_edit_cases = data.get('can_edit_cases', False)
    can_delete_cases = data.get('can_delete_cases', False)
    
    # 验证用户名必须是中文
    if not username:
        return Response({'error': '用户名不能为空'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 使用正则表达式检查用户名是否包含中文字符
    chinese_pattern = re.compile(r'[\u4e00-\u9fff]+')
    if not chinese_pattern.search(username):
        return Response({'error': '用户名必须包含中文字符'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 验证密码
    if not password:
        return Response({'error': '密码不能为空'}, status=status.HTTP_400_BAD_REQUEST)
    
    # 验证权限信息
    valid_phases = ['phase_1', 'phase_2', 'both']  # 'both' 表示可以访问两个阶段
    valid_shifts = ['long_day_shift', 'rotating_shift', 'both']  # 'both' 表示可以访问两种班次
    valid_types = ['Admin', 'Operator']  # 改为 Operator
    
    if plant_phase and plant_phase not in valid_phases:
        return Response({'error': '无效的工厂分期，应为 \'phase_1\'、\'phase_2\' 或 \'both\''}, status=status.HTTP_400_BAD_REQUEST)
    
    if shift_type and shift_type not in valid_shifts:
        return Response({'error': '无效的班次类型，应为 \'long_day_shift\'、\'rotating_shift\' 或 \'both\''}, status=status.HTTP_400_BAD_REQUEST)
    
    if user_type not in valid_types:
        return Response({'error': '无效的用户类型，应为 \'Admin\' 或 \'Operator\''}, status=status.HTTP_400_BAD_REQUEST)
    
    # 检查用户名是否已存在
    if User.objects.filter(username=username).exists():
        return Response({'error': '用户名已存在'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # 创建用户
        user = User.objects.create(
            username=username,
            password=make_password(password)  # 加密密码
        )
        
        # 创建用户资料
        user_profile = UserProfile.objects.create(
            user=user,
            type=user_type,
            plant_phase=plant_phase,
            shift_type=shift_type,
            # 设置权限
            can_add_assets=can_add_assets,
            can_edit_assets=can_edit_assets,
            can_delete_assets=can_delete_assets,
            can_add_maintenance_records=can_add_maintenance_records,
            can_edit_maintenance_records=can_edit_maintenance_records,
            can_delete_maintenance_records=can_delete_maintenance_records,
            can_add_manuals=can_add_manuals,
            can_edit_manuals=can_edit_manuals,
            can_delete_manuals=can_delete_manuals,
            can_add_cases=can_add_cases,
            can_edit_cases=can_edit_cases,
            can_delete_cases=can_delete_cases,
            # 可以根据当前用户来设置组织
            organization=request.user.userprofile.organization if hasattr(request.user, 'userprofile') else None
        )
        
        return Response({
            'message': '用户创建成功',
            'user_id': user.id,
            'username': user.username,
            'plant_phase': user_profile.plant_phase,
            'shift_type': user_profile.shift_type,
            'type': user_profile.type,
            'can_add_assets': user_profile.can_add_assets,
            'can_edit_assets': user_profile.can_edit_assets,
            'can_delete_assets': user_profile.can_delete_assets,
            'can_add_maintenance_records': user_profile.can_add_maintenance_records,
            'can_edit_maintenance_records': user_profile.can_edit_maintenance_records,
            'can_delete_maintenance_records': user_profile.can_delete_maintenance_records,
            'can_add_manuals': user_profile.can_add_manuals,
            'can_edit_manuals': user_profile.can_edit_manuals,
            'can_delete_manuals': user_profile.can_delete_manuals,
            'can_add_cases': user_profile.can_add_cases,
            'can_edit_cases': user_profile.can_edit_cases,
            'can_delete_cases': user_profile.can_delete_cases
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': f'创建用户失败: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    """
    更新用户信息（仅管理员可访问）
    """
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以更新用户信息'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        # 获取或创建用户资料，处理没有用户资料的用户
        user_profile, created = UserProfile.objects.get_or_create(user=user)
        
        data = request.data
        
        # 更新用户信息
        if 'username' in data:
            username = data.get('username', '').strip()
            if username and username != user.username:
                # 验证新用户名是否包含中文
                chinese_pattern = re.compile(r'[\u4e00-\u9fff]+')
                if not chinese_pattern.search(username):
                    return Response({'error': '用户名必须包含中文字符'}, status=status.HTTP_400_BAD_REQUEST)
                
                # 检查新用户名是否已存在
                if User.objects.filter(username=username).exclude(id=user_id).exists():
                    return Response({'error': '用户名已存在'}, status=status.HTTP_400_BAD_REQUEST)
                
                user.username = username
        
        # 更新密码（如果提供了新密码）
        if 'password' in data and data['password']:
            password = data.get('password', '')
            if len(password) < 6:
                return Response({'error': '密码长度至少6位'}, status=status.HTTP_400_BAD_REQUEST)
            user.password = make_password(password)
        
        # 更新用户资料信息
        if 'plant_phase' in data:
            plant_phase = data.get('plant_phase', '')
            valid_phases = ['phase_1', 'phase_2', 'both']
            if plant_phase and plant_phase not in valid_phases:
                return Response({'error': '无效的工厂分期'}, status=status.HTTP_400_BAD_REQUEST)
            user_profile.plant_phase = plant_phase
            
        if 'shift_type' in data:
            shift_type = data.get('shift_type', '')
            valid_shifts = ['long_day_shift', 'rotating_shift', 'both']
            if shift_type and shift_type not in valid_shifts:
                return Response({'error': '无效的班次类型'}, status=status.HTTP_400_BAD_REQUEST)
            user_profile.shift_type = shift_type
            
        if 'type' in data:
            user_type = data.get('type', '')
            valid_types = ['Admin', 'Operator']
            if user_type not in valid_types:
                return Response({'error': '无效的用户类型'}, status=status.HTTP_400_BAD_REQUEST)
            user_profile.type = user_type
        
        # 更新权限字段
        if 'can_add_assets' in data:
            user_profile.can_add_assets = data.get('can_add_assets', True)
        if 'can_edit_assets' in data:
            user_profile.can_edit_assets = data.get('can_edit_assets', True)
        if 'can_delete_assets' in data:
            user_profile.can_delete_assets = data.get('can_delete_assets', False)
        if 'can_add_maintenance_records' in data:
            user_profile.can_add_maintenance_records = data.get('can_add_maintenance_records', True)
        if 'can_edit_maintenance_records' in data:
            user_profile.can_edit_maintenance_records = data.get('can_edit_maintenance_records', True)
        if 'can_delete_maintenance_records' in data:
            user_profile.can_delete_maintenance_records = data.get('can_delete_maintenance_records', False)
        if 'can_add_manuals' in data:
            user_profile.can_add_manuals = data.get('can_add_manuals', False)
        if 'can_edit_manuals' in data:
            user_profile.can_edit_manuals = data.get('can_edit_manuals', False)
        if 'can_delete_manuals' in data:
            user_profile.can_delete_manuals = data.get('can_delete_manuals', False)
        if 'can_add_cases' in data:
            user_profile.can_add_cases = data.get('can_add_cases', False)
        if 'can_edit_cases' in data:
            user_profile.can_edit_cases = data.get('can_edit_cases', False)
        if 'can_delete_cases' in data:
            user_profile.can_delete_cases = data.get('can_delete_cases', False)
        
        user.save()
        user_profile.save()
        
        return Response({
            'message': '用户信息更新成功',
            'user_id': user.id,
            'username': user.username,
            'plant_phase': user_profile.plant_phase,
            'shift_type': user_profile.shift_type,
            'type': user_profile.type,
            'can_add_assets': user_profile.can_add_assets,
            'can_edit_assets': user_profile.can_edit_assets,
            'can_delete_assets': user_profile.can_delete_assets,
            'can_add_maintenance_records': user_profile.can_add_maintenance_records,
            'can_edit_maintenance_records': user_profile.can_edit_maintenance_records,
            'can_delete_maintenance_records': user_profile.can_delete_maintenance_records,
            'can_add_manuals': user_profile.can_add_manuals,
            'can_edit_manuals': user_profile.can_edit_manuals,
            'can_delete_manuals': user_profile.can_delete_manuals,
            'can_add_cases': user_profile.can_add_cases,
            'can_edit_cases': user_profile.can_edit_cases,
            'can_delete_cases': user_profile.can_delete_cases
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': '用户不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'更新用户失败: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """
    删除用户（仅管理员可访问）
    """
    if not hasattr(request.user, 'userprofile') or request.user.userprofile.type != 'Admin':
        return Response({'error': '只有管理员可以删除用户'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        
        # 防止管理员删除自己
        if user.id == request.user.id:
            return Response({'error': '不能删除自己的账户'}, status=status.HTTP_400_BAD_REQUEST)
        
        username = user.username
        
        # 在删除用户前，先处理相关对象，避免级联删除问题
        from db.models_maintenance import MaintenanceRecord, MaintenanceManual, MaintenanceStep
        
        # 处理该用户作为主操作员的维护记录
        maint_records = MaintenanceRecord.objects.filter(main_operator=user)
        admin_user = User.objects.filter(is_superuser=True).first()  # 获取一个管理员用户
        if admin_user:
            for record in maint_records:
                record.main_operator = admin_user  # 将主操作员改为管理员
                record.save()
        
        # 从协助人员中移除该用户
        assist_maint_records = MaintenanceRecord.objects.filter(assistant_operators=user)
        for record in assist_maint_records:
            record.assistant_operators.remove(user)
        
        # 删除该用户创建的维护手册
        user_manuals = MaintenanceManual.objects.filter(created_by=user)
        user_manuals.delete()
        
        # 注意：MaintenanceStep 没有 created_by 字段，不需要单独删除
        
        # 删除UserProfile
        try:
            user_profile = UserProfile.objects.get(user=user)
            user_profile.delete()
        except UserProfile.DoesNotExist:
            pass  # 用户可能没有UserProfile
        
        # 最后删除用户
        user.delete()
        
        return Response({
            'message': f'用户 {username} 删除成功'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'error': '用户不存在'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'删除用户失败: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_permissions(request):
    """
    获取当前用户的权限信息
    """
    try:
        user_profile = request.user.userprofile
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'plant_phase': user_profile.plant_phase,
            'shift_type': user_profile.shift_type,
            'type': user_profile.type,
            'can_access_both_phases': user_profile.plant_phase == 'both' or user_profile.type == 'Admin',
            'can_access_both_shifts': user_profile.shift_type == 'both' or user_profile.type == 'Admin',
            # 返回详细权限
            'can_add_assets': user_profile.can_add_assets,
            'can_edit_assets': user_profile.can_edit_assets,
            'can_delete_assets': user_profile.can_delete_assets,
            'can_add_maintenance_records': user_profile.can_add_maintenance_records,
            'can_edit_maintenance_records': user_profile.can_edit_maintenance_records,
            'can_delete_maintenance_records': user_profile.can_delete_maintenance_records,
            'can_add_manuals': user_profile.can_add_manuals,
            'can_edit_manuals': user_profile.can_edit_manuals,
            'can_delete_manuals': user_profile.can_delete_manuals,
            'can_add_cases': user_profile.can_add_cases,
            'can_edit_cases': user_profile.can_edit_cases,
            'can_delete_cases': user_profile.can_delete_cases
        })
    except UserProfile.DoesNotExist:
        # 如果用户没有资料，创建一个默认资料
        user_profile, created = UserProfile.objects.get_or_create(user=request.user)
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'plant_phase': user_profile.plant_phase,
            'shift_type': user_profile.shift_type,
            'type': user_profile.type,
            'can_access_both_phases': user_profile.plant_phase == 'both' or user_profile.type == 'Admin',
            'can_access_both_shifts': user_profile.shift_type == 'both' or user_profile.type == 'Admin',
            # 返回详细权限
            'can_add_assets': user_profile.can_add_assets,
            'can_edit_assets': user_profile.can_edit_assets,
            'can_delete_assets': user_profile.can_delete_assets,
            'can_add_maintenance_records': user_profile.can_add_maintenance_records,
            'can_edit_maintenance_records': user_profile.can_edit_maintenance_records,
            'can_delete_maintenance_records': user_profile.can_delete_maintenance_records,
            'can_add_manuals': user_profile.can_add_manuals,
            'can_edit_manuals': user_profile.can_edit_manuals,
            'can_delete_manuals': user_profile.can_delete_manuals,
            'can_add_cases': user_profile.can_add_cases,
            'can_edit_cases': user_profile.can_edit_cases,
            'can_delete_cases': user_profile.can_delete_cases
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """
    列出用户的基本信息（根据权限过滤）
    按照严格的期别和班次进行隔离
    """
    try:
        # 获取当前用户的权限信息
        current_user_profile = getattr(request.user, 'userprofile', None)
        
        # 构建查询条件
        users_query = User.objects.prefetch_related('userprofile').all()
        
        # 如果不是管理员，根据权限严格过滤用户
        if current_user_profile and current_user_profile.type != 'Admin':
            # 获取当前用户的期别和班次
            current_phase = current_user_profile.plant_phase
            current_shift = current_user_profile.shift_type
            
            # 严格过滤：只显示具有相同期别和班次的用户
            filtered_users = []
            for user in users_query:
                try:
                    user_profile = user.userprofile
                    
                    # 严格匹配：期别和班次都必须完全一致
                    if (current_phase and user_profile.plant_phase and 
                        current_phase == user_profile.plant_phase and
                        current_shift and user_profile.shift_type and 
                        current_shift == user_profile.shift_type):
                        filtered_users.append(user)
                        
                except UserProfile.DoesNotExist:
                    # 如果用户没有资料，不显示给普通用户
                    continue
            
            all_users = filtered_users
        else:
            # 管理员可以看到所有用户
            all_users = users_query
        
        users_data = []
        for user in all_users:
            try:
                profile = user.userprofile
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'plant_phase': profile.plant_phase,
                    'shift_type': profile.shift_type,
                    'type': profile.type,
                    # 权限字段
                    'can_add_assets': profile.can_add_assets,
                    'can_edit_assets': profile.can_edit_assets,
                    'can_delete_assets': profile.can_delete_assets,
                    'can_add_maintenance_records': profile.can_add_maintenance_records,
                    'can_edit_maintenance_records': profile.can_edit_maintenance_records,
                    'can_delete_maintenance_records': profile.can_delete_maintenance_records,
                    'can_add_manuals': profile.can_add_manuals,
                    'can_edit_manuals': profile.can_edit_manuals,
                    'can_delete_manuals': profile.can_delete_manuals,
                    'can_add_cases': profile.can_add_cases,
                    'can_edit_cases': profile.can_edit_cases,
                    'can_delete_cases': profile.can_delete_cases
                }
            except UserProfile.DoesNotExist:
                # 如果用户没有资料，使用默认值
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'plant_phase': '',
                    'shift_type': '',
                    'type': 'Operator',  # 默认类型
                    # 默认权限
                    'can_add_assets': False,
                    'can_edit_assets': False,
                    'can_delete_assets': False,
                    'can_add_maintenance_records': False,
                    'can_edit_maintenance_records': False,
                    'can_delete_maintenance_records': False,
                    'can_add_manuals': False,
                    'can_edit_manuals': False,
                    'can_delete_manuals': False,
                    'can_add_cases': False,
                    'can_edit_cases': False,
                    'can_delete_cases': False
                }
            users_data.append(user_data)
        return Response(users_data)
    except Exception as e:
        return Response({'error': f'获取用户列表失败: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user_info(request):
    """
    获取当前用户信息，包括权限信息
    """
    try:
        user_profile = request.user.userprofile
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'plant_phase': user_profile.plant_phase,
            'shift_type': user_profile.shift_type,
            'type': user_profile.type
        })
    except UserProfile.DoesNotExist:
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'plant_phase': None,
            'shift_type': None,
            'type': 'Reporter'  # 默认类型
        })