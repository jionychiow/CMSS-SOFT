#!/usr/bin/env python
"""
Script to create a superuser with a known password for testing
"""
import os
import sys
import django
from django.contrib.auth import get_user_model

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_local')
django.setup()

User = get_user_model()

# Create superuser if it doesn't exist
username = 'admin'
email = 'admin@example.com'
password = 'admin123'  # Use a more secure password in production

try:
    user = User.objects.get(username=username)
    print(f"User '{username}' already exists.")
except User.DoesNotExist:
    user = User.objects.create_superuser(username, email, password)
    print(f"Superuser '{username}' created successfully.")

# Update the password in any case
user.set_password(password)
user.save()
print(f"Password updated for user '{username}'. New password: {password}")