from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import maintenance_stats_views

router = DefaultRouter()
router.register(r'maintenance-records', views.MaintenanceRecordViewSet)
# 注释掉未定义的EquipmentMaintenanceLibraryViewSet
# router.register(r'equipment-library', views.EquipmentMaintenanceLibraryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('config/', include('maintenance.config_urls')),  # 配置数据相关接口
    path('user-permissions/', views.get_user_permissions, name='user-permissions'),
    path('statistics/', views.get_maintenance_statistics, name='maintenance-statistics'),
    # 维修率统计相关接口
    path('maintenance-rate-stats/', maintenance_stats_views.get_maintenance_rate_stats, name='maintenance-rate-stats'),
    path('maintenance-trends/', maintenance_stats_views.get_maintenance_trends, name='maintenance-trends'),
    path('maintenance-by-line-process/', maintenance_stats_views.get_maintenance_by_line_process, name='maintenance-by-line-process'),
    # 注释掉缺失的函数调用
    # path('shift-maintenance-records/', views.maintenance_record_list, name='maintenance_record_list'),
    # path('shift-maintenance-records/<int:pk>/', views.maintenance_record_detail, name='maintenance_record_detail'),
    # path('get-current-user-permissions/', views.get_current_user_permissions, name='get_current_user_permissions'),
    # path('get-available-phases-shifts/', views.get_available_phases_shifts, name='get_available_phases_shifts'),
]