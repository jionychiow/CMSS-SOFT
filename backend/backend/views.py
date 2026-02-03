from django.http import HttpResponse
from django.shortcuts import render
import os

def index(request):
    """
    Serve the frontend application
    """
    # Try to serve the React build files if they exist
    frontend_build_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'build')
    
    if os.path.exists(frontend_build_path):
        index_file = os.path.join(frontend_build_path, 'index.html')
        if os.path.exists(index_file):
            with open(index_file, 'r', encoding='utf-8') as f:
                content = f.read()
            return HttpResponse(content)
    
    # Fallback response
    return HttpResponse(
        "<h1>Welcome to CMMS-OEE Software</h1><p>Frontend build files not found. Please build the React app first.</p>"
    )