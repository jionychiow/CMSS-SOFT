#!/usr/bin/env python
"""
Script to ensure the admin user has a UserProfile
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

# Get the admin user
try:
    admin_user = User.objects.get(username='admin')
    print(f"Found admin user: {admin_user}")
    
    # Try to get or create a UserProfile for this user
    from db.models import UserProfile, Organization
    from rest_framework.authtoken.models import Token
    
    # Check if UserProfile already exists
    user_profile, created = UserProfile.objects.get_or_create(user=admin_user)
    
    if created:
        # If it's newly created, assign to default organization or create one
        org, org_created = Organization.objects.get_or_create(
            name='Default Organization',
            defaults={'description': 'Default organization for admin user'}
        )
        user_profile.organization = org
        user_profile.save()
        print(f"Created UserProfile for admin user: {user_profile}")
    else:
        print(f"UserProfile already exists for admin user: {user_profile}")
    
    # Check if auth token exists for the user, create if it doesn't
    token, token_created = Token.objects.get_or_create(user=admin_user)
    if token_created:
        print(f"Created auth token for admin user: {token.key}")
    else:
        print(f"Auth token already exists for admin user: {token.key}")
        
except User.DoesNotExist:
    print("Admin user does not exist. Creating admin user...")
    admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print(f"Created admin user: {admin_user}")
    
    # Create UserProfile for the new admin user
    from db.models import UserProfile, Organization
    from rest_framework.authtoken.models import Token
    
    org, org_created = Organization.objects.get_or_create(
        name='Default Organization',
        defaults={'description': 'Default organization for admin user'}
    )
    
    user_profile = UserProfile.objects.create(user=admin_user, organization=org)
    print(f"Created UserProfile for admin user: {user_profile}")
    
    # Create auth token for the new admin user
    token = Token.objects.create(user=admin_user)
    print(f"Created auth token for admin user: {token.key}")

print("Setup completed successfully!")