from django.urls import path
from . import views

urlpatterns = [
    path('create-user/', views.create_user, name='create_user'),
    path('update-user/<int:user_id>/', views.update_user, name='update_user'),
    path('delete-user/<int:user_id>/', views.delete_user, name='delete_user'),
    path('list-users/', views.list_users, name='list_users'),
    path('user-permissions/', views.get_user_permissions, name='get_user_permissions'),
    path('get-permissions/', views.get_user_permissions, name='get_user_permissions'),
]