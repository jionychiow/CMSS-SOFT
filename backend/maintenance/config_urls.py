from django.urls import path
from . import config_views

urlpatterns = [
    # 配置数据相关
    path('get-config-data/', config_views.get_config_data, name='get_config_data'),
    
    # 期数管理
    path('create-phase/', config_views.create_plant_phase, name='create_plant_phase'),
    path('update-phase/<int:phase_id>/', config_views.update_plant_phase, name='update_plant_phase'),
    path('delete-phase/<int:phase_id>/', config_views.delete_plant_phase, name='delete_plant_phase'),
    
    # 产线管理
    path('create-production-line/', config_views.create_production_line, name='create_production_line'),
    path('update-production-line/<int:line_id>/', config_views.update_production_line, name='update_production_line'),
    path('delete-production-line/<int:line_id>/', config_views.delete_production_line, name='delete_production_line'),
    
    # 工序管理
    path('create-process/', config_views.create_process, name='create_process'),
    path('update-process/<int:process_id>/', config_views.update_process, name='update_process'),
    
    # 班次类型管理
    path('create-shift-type/', config_views.create_shift_type, name='create_shift_type'),
    path('update-shift-type/<int:shift_type_id>/', config_views.update_shift_type, name='update_shift_type'),
    path('delete-shift-type/<int:shift_type_id>/', config_views.delete_shift_type, name='delete_shift_type'),
    path('delete-process/<int:process_id>/', config_views.delete_process, name='delete_process'),
]