#!/usr/bin/env python
"""
Script to fix admin user profile and token issue
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

# Disable the problematic signal temporarily
from django.db.models.signals import post_save
from db.models import create_auth_token, UserProfile

# Disconnect the signal temporarily
post_save.disconnect(create_auth_token, sender=UserProfile)

try:
    # Get the admin user
    admin_user = User.objects.get(username='admin')
    print(f"Found admin user: {admin_user}")
    
    # Import required modules
    from db.models import UserProfile, Organization
    from rest_framework.authtoken.models import Token
    
    # Try to get or create a UserProfile for this user
    user_profile, created = UserProfile.objects.get_or_create(user=admin_user)
    
    if created:
        # If it's newly created, assign to default organization
        org, org_created = Organization.objects.get_or_create(
            name='Default Organization',
            defaults={
                'subdomain': 'default',
                'max_assets': 10,
                'max_users': 10,
                'max_active_orders': 100
            }
        )
        user_profile.organization = org
        user_profile.save()
        print(f"Created UserProfile for admin user: {user_profile}")
    else:
        print(f"UserProfile already exists for admin user: {user_profile}")
    
    # Check if auth token exists for the user, create if it doesn't
    token, token_created = Token.objects.get_or_create(user=admin_user)
    if token_created:
        print(f"Created auth token for admin user: {token.key[:8]}...")
    else:
        print(f"Auth token already exists for admin user: {token.key[:8]}...")

    # Reconnect the signal
    post_save.connect(create_auth_token, sender=UserProfile)
    print("Signals restored. Admin user setup completed successfully!")

except Exception as e:
    # Reconnect the signal in case of error
    post_save.connect(create_auth_token, sender=UserProfile)
    print(f"Error occurred: {str(e)}")