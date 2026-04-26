from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('car_service.api.urls')),
    re_path(r'^web/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'web'),
    }),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]