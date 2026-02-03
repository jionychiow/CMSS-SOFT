from rest_framework import serializers
from db.models_maintenance_new import ShiftMaintenanceRecord


class ShiftMaintenanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftMaintenanceRecord
        fields = '__all__'
        extra_kwargs = {
            'confirm_person': {'required': False},  # 长白班字段，非必填
            'acceptor': {'required': False},        # 倒班字段，非必填
        }
        read_only_fields = ('created_at', 'updated_at', 'created_by')