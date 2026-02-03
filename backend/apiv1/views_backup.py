from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from .serializers import OrganizationSerializer,AssetSerializer,\
    MaintenancePlanSerializer,MaintenancePlanSerializerWrite\
    ,UserProfileSerializer
from db.models import Organization,Asset,MaintenancePlan,UserProfile
from django.contrib.auth.models import User
from rest_framework import authentication,status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from .permissions import OrganizationCreatePermission,\
    AssetsPermission,MaintenancePermission,UserProfilePermission
from rest_framework.views import APIView
# Create your views here.
import logging
import uuid,os
from dotenv import load_dotenv
load_dotenv()