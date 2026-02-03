from rest_framework import serializers
from .models import UserProfileExtension
# 使用绝对导入代替相对导入
from db.models_maintenance import MaintenanceRecord
# 注释掉未定义的EquipmentMaintenanceLibrary导入
from django.contrib.auth.models import User
from db.models import Organization
import re

class UserProfileExtensionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfileExtension
        fields = '__all__'

class MaintenanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRecord
        fields = '__all__'
        read_only_fields = ('uuid', 'created_at', 'updated_at')

# 注释掉未定义的EquipmentMaintenanceLibrarySerializer，以解决启动问题
# class EquipmentMaintenanceLibrarySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = EquipmentMaintenanceLibrary
#         fields = '__all__'
#         read_only_fields = ('created_at', 'updated_at')

class UserSerializer(serializers.ModelSerializer):
    userprofileextension = UserProfileExtensionSerializer(required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'userprofileextension')
        read_only_fields = ('id',)

    def validate_username(self, value):
        # 验证用户名必须是汉字
        if not re.match(r'^[\u4e00-\u9fa5_a-zA-Z0-9]+$', value):
            raise serializers.ValidationError("用户名必须是汉字、字母、数字或下划线的组合")
        return value

class MaintenanceRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRecord
        fields = '__all__'
        read_only_fields = ('uuid', 'created_at', 'updated_at')

    def validate_implementers(self, value):
        # 验证实施人姓名必须是汉字
        names = [name.strip() for name in value.split(',') if name.strip()]
        for name in names:
            if not re.match(r'^[\u4e00-\u9fa5]+$', name):
                raise serializers.ValidationError(f"实施人姓名 '{name}' 必须是汉字")
        return value

    def validate_verifiers(self, value):
        if not value:
            return value
        # 验证确认人姓名必须是汉字
        names = [name.strip() for name in value.split(',') if name.strip()]
        for name in names:
            if not re.match(r'^[\u4e00-\u9fa5]+$', name):
                raise serializers.ValidationError(f"确认人姓名 '{name}' 必须是汉字")
        return value

    def validate_acceptors(self, value):
        if not value:
            return value
        # 验证验收人姓名必须是汉字
        names = [name.strip() for name in value.split(',') if name.strip()]
        for name in names:
            if not re.match(r'^[\u4e00-\u9fa5]+$', name):
                raise serializers.ValidationError(f"验收人姓名 '{name}' 必须是汉字")
        return value

    def validate_evaluators(self, value):
        if not value:
            return value
        # 验证评价人姓名必须是汉字
        names = [name.strip() for name in value.split(',') if name.strip()]
        for name in names:
            if not re.match(r'^[\u4e00-\u9fa5]+$', name):
                raise serializers.ValidationError(f"评价人姓名 '{name}' 必须是汉字")
        return value