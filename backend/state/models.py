from django.db import models
from db.models import BasicInfo, Asset, Organization
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from uuid import UUID
import json

# Empty models file for state app - OEE functionality removed
# This app will be kept as a placeholder but without OEE-related models