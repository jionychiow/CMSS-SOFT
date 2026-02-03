import pandas as pd
from datetime import datetime, timedelta
from django.utils import timezone
from .models import UserProfileExtension
# 使用绝对导入代替相对导入
from db.models_maintenance import MaintenanceRecord
# 注释掉未定义的EquipmentMaintenanceLibrary导入
from django.contrib.auth.models import User
from django.db import transaction
import logging

logger = logging.getLogger(__name__)


def import_maintenance_records_from_excel(file_path, shift_type, plant_phase):
    """
    从Excel文件导入维修记录
    """
    try:
        # 读取Excel文件
        df = pd.read_excel(file_path, header=2)  # 从第3行开始读取表头
        
        # 清理列名，移除"Unnamed: "前缀
        df.columns = [col.split('.')[-1] if 'Unnamed:' in str(col) else col for col in df.columns]
        
        # 移除完全空的行
        df = df.dropna(how='all')
        
        imported_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # 跳过空行
                if pd.isna(row.iloc[0]):  # 假设第一列是序号，如果是空的则跳过
                    continue
                    
                # 构建维修记录对象
                record_data = {
                    'record_id': int(row.iloc[0]) if not pd.isna(row.iloc[0]) else index + 1,  # 使用索引+1作为默认ID
                    'month': int(row.iloc[1]) if not pd.isna(row.iloc[1]) else 1,  # 默认1月
                    'production_line': str(row.iloc[2]) if not pd.isna(row.iloc[2]) else '',
                    'process': str(row.iloc[3]) if not pd.isna(row.iloc[3]) else '',
                    'equipment_name': str(row.iloc[4]) if not pd.isna(row.iloc[4]) else '',
                    'equipment_id': str(row.iloc[5]) if not pd.isna(row.iloc[5]) else '',
                    'equipment_part': str(row.iloc[6]) if not pd.isna(row.iloc[6]) else '',
                    'change_reason': str(row.iloc[7]) if not pd.isna(row.iloc[7]) else '',
                    'before_change': str(row.iloc[8]) if not pd.isna(row.iloc[8]) else '',
                    'after_change': str(row.iloc[9]) if not pd.isna(row.iloc[9]) else '',
                    'start_time': pd.to_datetime(row.iloc[10]) if not pd.isna(row.iloc[10]) else timezone.now(),
                    'end_time': pd.to_datetime(row.iloc[11]) if not pd.isna(row.iloc[11]) else timezone.now(),
                    'implementers': str(row.iloc[12]) if not pd.isna(row.iloc[12]) else '',
                    'verifiers': str(row.iloc[13]) if not pd.isna(row.iloc[13]) else '',
                    'acceptors': str(row.iloc[14]) if not pd.isna(row.iloc[14]) else '',
                    'evaluators': str(row.iloc[15]) if not pd.isna(row.iloc[15]) else '',
                    'remarks': str(row.iloc[16]) if not pd.isna(row.iloc[16]) else '',
                    'shift_type': shift_type,
                    'plant_phase': plant_phase,
                }
                
                # 计算持续时间
                start_time = record_data['start_time']
                end_time = record_data['end_time']
                duration = end_time - start_time
                record_data['duration'] = duration
                record_data['duration_minutes'] = int(duration.total_seconds() / 60)
                
                # 检查是否已存在相同ID的记录
                record, created = MaintenanceRecord.objects.update_or_create(
                    record_id=record_data['record_id'],
                    defaults=record_data
                )
                
                if created:
                    imported_count += 1
                else:
                    logger.info(f"Updated existing record with ID: {record_data['record_id']}")
                    
            except Exception as e:
                error_msg = f"Error processing row {index + 1}: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)
                
        return {
            'success': True,
            'imported_count': imported_count,
            'errors': errors
        }
        
    except Exception as e:
        error_msg = f"Failed to import Excel file: {str(e)}"
        logger.error(error_msg)
        return {
            'success': False,
            'imported_count': 0,
            'errors': [error_msg]
        }


def import_equipment_library_from_dict(equipment_data_list):
    """
    从字典列表导入设备维修资料库
    """
    imported_count = 0
    errors = []
    
    for data in equipment_data_list:
        try:
            equipment, created = EquipmentMaintenanceLibrary.objects.update_or_create(
                equipment_name=data.get('equipment_name', ''),
                defaults={
                    'equipment_part': data.get('equipment_part', ''),
                    'maintenance_procedure': data.get('maintenance_procedure', ''),
                    'parameters': data.get('parameters', {}),
                    'images': data.get('images', []),
                    'videos': data.get('videos', []),
                }
            )
            
            if created:
                imported_count += 1
                
        except Exception as e:
            error_msg = f"Error importing equipment {data.get('equipment_name', '')}: {str(e)}"
            logger.error(error_msg)
            errors.append(error_msg)
            
    return {
        'success': True,
        'imported_count': imported_count,
        'errors': errors
    }