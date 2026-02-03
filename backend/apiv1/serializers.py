"""Serializers of the app"""
from rest_framework import serializers
from db.models import Organization,Asset,MaintenancePlan,UserProfile


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer"""
    class Meta:
        model = Organization
        exclude = []
class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = UserProfile
        exclude = []
        depth=1

class AssetSerializer(serializers.ModelSerializer):
    """Serializer"""
    # 自定义字段以避免深度序列化问题
    phase_name = serializers.CharField(source='phase.name', read_only=True, allow_null=True)
    process_name = serializers.CharField(source='process.name', read_only=True, allow_null=True)
    production_line_name = serializers.CharField(source='production_line.name', read_only=True, allow_null=True)
    
    # 添加代码字段用于输入
    phase_code = serializers.CharField(required=False, allow_null=True, write_only=True)
    process_code = serializers.CharField(required=False, allow_null=True, write_only=True)
    production_line_code = serializers.CharField(required=False, allow_null=True, write_only=True)
    
    class Meta:
        model = Asset
        exclude = ['phase', 'process', 'production_line']  # 排除原来的外键字段
        depth = 0  # 移除深度序列化，手动处理外键字段
    
    def to_internal_value(self, data):
        # 添加日志来调试
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"AssetSerializer.to_internal_value called with data keys: {list(data.keys())}")
        
        # 确保必填字段有默认值
        if not data.get('asset_type'):
            data = data.copy()  # 避免修改原始数据
            data['asset_type'] = 'Equipment'
        
        if not data.get('serial_number'):
            data = data.copy()
            data['serial_number'] = data.get('ref', '') or data.get('name', '') or ''
        
        if not data.get('cost'):
            data = data.copy()
            data['cost'] = '0'
        
        if not data.get('status'):
            data = data.copy()
            data['status'] = 'Active'
        
        # 调用父类方法
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"AssetSerializer.create called with validated_data keys: {list(validated_data.keys())}")
        
        from db.models import PlantPhase, Process, ProductionLine
        
        # 提取代码值并转换为外键对象
        phase_code = validated_data.pop('phase_code', None)
        process_code = validated_data.pop('process_code', None)
        production_line_code = validated_data.pop('production_line_code', None)
        
        logger.info(f"Processing codes - phase_code: {phase_code}, process_code: {process_code}, production_line_code: {production_line_code}")
        
        # 获取对应的外键对象
        phase = None
        if phase_code:
            try:
                phase = PlantPhase.objects.get(code=phase_code)
                logger.info(f"Found phase: {phase.name} with code: {phase_code}")
            except PlantPhase.DoesNotExist:
                logger.warning(f"Phase with code '{phase_code}' not found in database")
                pass  # 如果找不到则设为None
        
        process = None
        if process_code:
            try:
                process = Process.objects.get(code=process_code)
                logger.info(f"Found process: {process.name} with code: {process_code}")
            except Process.DoesNotExist:
                logger.warning(f"Process with code '{process_code}' not found in database")
                pass  # 如果找不到则设为None
        
        production_line = None
        if production_line_code:
            try:
                production_line = ProductionLine.objects.get(code=production_line_code)
                logger.info(f"Found production_line: {production_line.name} with code: {production_line_code}")
            except ProductionLine.DoesNotExist:
                logger.warning(f"Production line with code '{production_line_code}' not found in database")
                pass  # 如果找不到则设为None
        
        # 确保必填字段有值
        # 设置合理的默认值
        if 'asset_type' not in validated_data or not validated_data['asset_type']:
            validated_data['asset_type'] = 'Equipment'
        
        if 'serial_number' not in validated_data or not validated_data['serial_number']:
            validated_data['serial_number'] = validated_data.get('ref', '') or validated_data.get('name', '')
        
        if 'cost' not in validated_data or not validated_data['cost']:
            validated_data['cost'] = 0
        
        if 'status' not in validated_data or not validated_data['status']:
            validated_data['status'] = 'Active'
        
        # 创建资产对象
        asset = Asset.objects.create(
            phase=phase,
            process=process,
            production_line=production_line,
            **validated_data
        )
        
        logger.info(f"Asset created with phase: {asset.phase}, process: {asset.process}, production_line: {asset.production_line}")
        return asset
    
    def update(self, instance, validated_data):
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"AssetSerializer.update called with validated_data keys: {list(validated_data.keys())}")
        
        from db.models import PlantPhase, Process, ProductionLine
        
        # 提取代码值并转换为外键对象
        phase_code = validated_data.pop('phase_code', None)
        process_code = validated_data.pop('process_code', None)
        production_line_code = validated_data.pop('production_line_code', None)
        
        logger.info(f"Processing update codes - phase_code: {phase_code}, process_code: {process_code}, production_line_code: {production_line_code}")
        
        # 获取对应的外键对象
        if phase_code is not None:
            try:
                instance.phase = PlantPhase.objects.get(code=phase_code)
                logger.info(f"Updated phase to: {instance.phase.name} with code: {phase_code}")
            except PlantPhase.DoesNotExist:
                logger.warning(f"Phase with code '{phase_code}' not found in database for update")
                instance.phase = None
        
        if process_code is not None:
            try:
                instance.process = Process.objects.get(code=process_code)
                logger.info(f"Updated process to: {instance.process.name} with code: {process_code}")
            except Process.DoesNotExist:
                logger.warning(f"Process with code '{process_code}' not found in database for update")
                instance.process = None
        
        if production_line_code is not None:
            try:
                instance.production_line = ProductionLine.objects.get(code=production_line_code)
                logger.info(f"Updated production_line to: {instance.production_line.name} with code: {production_line_code}")
            except ProductionLine.DoesNotExist:
                logger.warning(f"Production line with code '{production_line_code}' not found in database for update")
                instance.production_line = None  # 修复了这里的bug
        
        # 确保必填字段有值
        if 'asset_type' in validated_data and not validated_data['asset_type']:
            validated_data['asset_type'] = 'Equipment'
        
        if 'serial_number' in validated_data and not validated_data['serial_number']:
            if validated_data.get('ref'):
                validated_data['serial_number'] = validated_data['ref']
            elif validated_data.get('name'):
                validated_data['serial_number'] = validated_data['name']
            else:
                validated_data['serial_number'] = instance.serial_number  # 保留原有值
        
        if 'cost' in validated_data and not validated_data['cost']:
            validated_data['cost'] = 0
        
        if 'status' in validated_data and not validated_data['status']:
            validated_data['status'] = 'Active'
        
        # 更新其他字段
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        logger.info(f"Asset updated with phase: {instance.phase}, process: {instance.process}, production_line: {instance.production_line}")
        return instance
class MaintenancePlanSerializer(serializers.ModelSerializer):
    """Serializer"""
    class Meta:
        model = MaintenancePlan
        exclude = []
        depth= 2
class MaintenancePlanSerializerWrite(serializers.ModelSerializer):
    """Serializer"""
    class Meta:
        model = MaintenancePlan
        exclude = []

