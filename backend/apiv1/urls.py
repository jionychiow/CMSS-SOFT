
'''Urls of the app'''
from rest_framework import routers
from .views import  AssetViewSet,MaintenancePlanViewSet,\
    MaintenanceWritePlanViewSet,UserProfileViewSet\
    ,MyMaintenancePlanViewSet,MyProfileViewSet,get_all_users_for_assignment

router = routers.SimpleRouter()

router.register(r'assets', AssetViewSet,basename="all-assets")
router.register(r'maintenances', MaintenancePlanViewSet,\
                basename="all-maintenances-plans")
router.register(r'my-maintenances', MyMaintenancePlanViewSet,\
                basename="my-maintenances-plans")
router.register(r'maintenances-plans', MaintenanceWritePlanViewSet,\
                basename="maintenances-plans")
router.register(r'profile-users', UserProfileViewSet,basename="profile-users")

from django.urls import path

urlpatterns = [
    *router.urls,
    path('my-profile/', MyProfileViewSet.as_view(), name='my-profile'),
    path('all-users-for-assignment/', get_all_users_for_assignment, name='all-users-for-assignment'),
]