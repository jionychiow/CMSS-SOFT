from rest_framework import serializers
from .models_task_plan import TaskPlan
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class TaskPlanSerializer(serializers.ModelSerializer):
    assigned_users = UserSerializer(many=True, read_only=True)
    assigned_user_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        many=True, 
        write_only=True,
        required=False
    )
    # 添加关联对象的名称字段
    phase_name = serializers.CharField(source='phase.name', read_only=True)
    process_name = serializers.CharField(source='process.name', read_only=True)
    production_line_name = serializers.CharField(source='production_line.name', read_only=True)

    class Meta:
        model = TaskPlan
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'planned_people_count')

    def create(self, validated_data):
        assigned_user_ids = validated_data.pop('assigned_user_ids', [])
        task_plan = TaskPlan.objects.create(**validated_data)
        
        # 添加分配的用户
        if assigned_user_ids:
            task_plan.assigned_users.set(assigned_user_ids)
            # 由于保存后会自动计算人数，这里不需要手动设置
            task_plan.save()
        
        return task_plan

    def update(self, instance, validated_data):
        assigned_user_ids = validated_data.pop('assigned_user_ids', None)
        
        # 更新基本字段
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # 如果提供了分配用户列表，则更新
        if assigned_user_ids is not None:
            instance.assigned_users.set(assigned_user_ids)
            instance.save()
        
        return instance