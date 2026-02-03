from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_excel, name='upload_excel'),
    path('download-template/', views.download_excel_template, name='download_excel_template'),
    path('export/', views.export_data_to_excel, name='export_data_to_excel'),
    path('read/<int:record_id>/', views.read_uploaded_excel, name='read_uploaded_excel'),
]