from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *
from .models_maintenance import *
from .models_maintenance_new import *
from .models_task_plan import TaskPlan
from .models_activity import UserActivity, WeeklyVisitTrend


class UserActivitySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = '__all__'
        read_only_fields = ('id', 'user', 'timestamp')


class WeeklyVisitTrendSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyVisitTrend
        fields = '__all__'
        read_only_fields = ('id',)