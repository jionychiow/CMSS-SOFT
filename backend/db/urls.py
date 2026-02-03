from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_new
from . import views_task_plan
from . import task_plan_stats_views
from . import stats_views
from . import excel_views
from . import asset_excel_views
from . import task_plan_excel_handler
from . import views_advanced_management

router = DefaultRouter()

# 新增的维修相关视图集
router.register(r'maintenance-records', views.MaintenanceRecordViewSet, basename='maintenance-record')
router.register(r'maintenance-manuals', views.MaintenanceManualViewSet, basename='maintenance-manual')
router.register(r'maintenance-cases', views.MaintenanceCaseViewSet, basename='maintenance-case')
router.register(r'maintenance-steps', views.MaintenanceStepViewSet, basename='maintenance-step')

# 新的班次维修记录视图集
router.register(r'shift-maintenance-records', views_new.ShiftMaintenanceRecordViewSet, basename='shift-maintenance-record')

# 现有的视图集
router.register(r'assets', views.AssetViewSet)
router.register(r'organizations', views.OrganizationViewSet)
router.register(r'userprofiles', views.UserProfileViewSet)
router.register(r'maintenance-plans', views.MaintenancePlanViewSet)
router.register(r'task-plans', views_task_plan.TaskPlanViewSet, basename='task-plans')

urlpatterns = [
    # 任务计划统计API (必须在router之前，否则会被router捕获)
    path('task-plans/today-tasks/', task_plan_stats_views.today_tasks_count, name='task-plans-today-tasks'),
    path('task-plans/incomplete-tasks/', task_plan_stats_views.incomplete_tasks_count, name='task-plans-incomplete-tasks'),
    path('task-plans/in-progress-tasks/', task_plan_stats_views.in_progress_tasks_count, name='task-plans-in-progress-tasks'),
    path('task-plans/status-distribution/', stats_views.today_task_status_distribution, name='task-status-distribution'),
    path('', include(router.urls)),
    # Excel相关API
    path('excel/download-template/', excel_views.download_excel_template, name='download-excel-template'),
    path('excel/download-records/', excel_views.download_filtered_records, name='download-records'),
    path('excel/upload-records/', excel_views.upload_excel_records, name='upload-records'),
    # 资产Excel相关API
    path('asset-excel/download-template/', asset_excel_views.download_asset_template, name='download-asset-template'),
    path('asset-excel/download-assets/', asset_excel_views.download_filtered_assets, name='download-assets'),
    path('asset-excel/upload-assets/', asset_excel_views.upload_asset_records, name='upload-assets'),
    # 用户相关API
    path('users/', views.get_users, name='get-users'),
    # 配置数据相关API
    path('phases/', views.get_phases, name='get-phases'),
    path('processes/', views.get_processes, name='get-processes'),
    path('production-lines/', views.get_production_lines, name='get-production-lines'),
    # 任务计划Excel相关API
    path('task-plan-excel/download-template/', task_plan_excel_handler.download_task_plan_template, name='download-task-plan-template'),
    path('task-plan-excel/download-task-plans/', task_plan_excel_handler.download_filtered_task_plans, name='download-task-plans'),
    path('task-plan-excel/upload-task-plans/', task_plan_excel_handler.upload_task_plan_records, name='upload-task-plans'),
    # 高级管理API
    path('advanced-management/configurations/', views_advanced_management.get_all_configurations, name='get-all-configurations'),
    path('advanced-management/phases/', views_advanced_management.add_phase, name='add-phase'),
    path('advanced-management/phases/<int:phase_id>/', views_advanced_management.update_phase, name='update-phase'),
    path('advanced-management/phases/<int:phase_id>/delete/', views_advanced_management.delete_phase, name='delete-phase'),
    path('advanced-management/processes/', views_advanced_management.add_process, name='add-process'),
    path('advanced-management/processes/<int:process_id>/', views_advanced_management.update_process, name='update-process'),
    path('advanced-management/processes/<int:process_id>/delete/', views_advanced_management.delete_process, name='delete-process'),
    path('advanced-management/production-lines/', views_advanced_management.add_production_line, name='add-production-line'),
    path('advanced-management/production-lines/<int:line_id>/', views_advanced_management.update_production_line, name='update-production-line'),
    path('advanced-management/production-lines/<int:line_id>/delete/', views_advanced_management.delete_production_line, name='delete-production-line'),
    # 统计API
    path('stats/active-users/', stats_views.active_users_count, name='stats-active-users'),
    path('stats/today-visits/', stats_views.today_visits_count, name='stats-today-visits'),
    path('stats/recent-activities/', stats_views.recent_activities, name='stats-recent-activities'),
    path('stats/weekly-trends/', stats_views.weekly_visit_trends, name='stats-weekly-trends'),
    path('stats/weekly-activity-stats/', stats_views.weekly_activity_stats, name='stats-weekly-activity-stats'),
    path('stats/assets-count/', stats_views.asset_count, name='stats-assets-count'),
    path('stats/maintenance-records-count/', stats_views.maintenance_record_count, name='stats-maintenance-records-count'),
    path('stats/maintenance-records-count-phase1/', stats_views.maintenance_record_count_phase1, name='stats-maintenance-records-count-phase1'),
    path('stats/maintenance-records-count-phase2/', stats_views.maintenance_record_count_phase2, name='stats-maintenance-records-count-phase2'),
    path('stats/maintenance-manuals-count/', stats_views.maintenance_manual_count, name='stats-maintenance-manuals-count'),
]