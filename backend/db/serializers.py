from rest_framework import serializers
from .models import Asset, Organization, UserProfile, MaintenancePlan
from .models_maintenance import MaintenanceRecord, MaintenanceManual, MaintenanceCase
from django.contrib.auth.models import User


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    main_operator_username = serializers.CharField(source='main_operator.username', read_only=True)
    assistant_operators_data = serializers.SerializerMethodField()
    
    class Meta:
        model = MaintenanceRecord
        fields = '__all__'
        read_only_fields = ('uuid', 'created_at', 'updated_at')
    
    def get_assistant_operators_data(self, obj):
        return [{'id': user.id, 'username': user.username} for user in obj.assistant_operators.all()]


from .models_maintenance import MaintenanceRecord, MaintenanceManual, MaintenanceCase, MaintenanceStep

class MaintenanceStepSerializer(serializers.ModelSerializer):
    # 不要在序列化时使用 SerializerMethodField，保留原始字段用于输入/输出
    # image 和 video 字段会自动处理文件上传和序列化
    
    class Meta:
        model = MaintenanceStep
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class MaintenanceManualSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    steps = serializers.SerializerMethodField()
    
    class Meta:
        model = MaintenanceManual
        fields = '__all__'
        read_only_fields = ('uuid', 'created_at', 'updated_at', 'created_by')
    
    def validate(self, attrs):
        # 在验证阶段确保必要字段存在
        request = self.context.get('request')
        if request and hasattr(request, 'user') and not self.instance:  # 仅在创建时检查
            # 如果没有提供组织信息，尝试从用户配置中获取
            if 'organization' not in attrs or not attrs['organization']:
                user_profile = getattr(request.user, 'userprofile', None)
                if user_profile and user_profile.organization:
                    attrs['organization'] = user_profile.organization
        
        return attrs
    
    def create(self, validated_data):
        # 自动设置创建者为当前用户
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
            
            # 确保组织信息已设置
            if 'organization' not in validated_data or not validated_data['organization']:
                user_profile = getattr(request.user, 'userprofile', None)
                if user_profile and user_profile.organization:
                    validated_data['organization'] = user_profile.organization
                else:
                    # 如果无法获取组织信息，可以尝试获取第一个可用的组织
                    from .models import Organization
                    first_org = Organization.objects.first()
                    if first_org:
                        validated_data['organization'] = first_org
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # 在更新时也确保组织信息正确
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # 如果提供了组织信息但为空，尝试从用户配置中获取
            if 'organization' in validated_data and not validated_data['organization']:
                user_profile = getattr(request.user, 'userprofile', None)
                if user_profile and user_profile.organization:
                    validated_data['organization'] = user_profile.organization
        
        return super().update(instance, validated_data)
    
    def get_steps(self, obj):
        steps = obj.steps.all()  # 使用预加载的数据
        print(f"DEBUG: Found {len(steps)} steps for manual {obj.title}")
        # 获取上下文中的request对象并传递给子序列化器
        context = self.context.copy()
        step_serializer = MaintenanceStepSerializer(steps, many=True, context=context)
        serialized_steps = step_serializer.data
        print(f"DEBUG: Serialized {len(serialized_steps)} steps with images: {[s.get('image') for s in serialized_steps if s.get('image')]}, videos: {[s.get('video') for s in serialized_steps if s.get('video')]}")
        return serialized_steps


class MaintenanceCaseSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = MaintenanceCase
        fields = '__all__'
        read_only_fields = ('uuid', 'created_at', 'updated_at')


# 现有的序列化器保持不变
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'
        read_only_fields = ('uuid', 'created_at', 'updated_at')

class MaintenancePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenancePlan
        fields = '__all__'