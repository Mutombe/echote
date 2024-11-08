from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuoteViewSet

# Initialize the default router
router = DefaultRouter()

# Register the QuoteViewSet to the router
router.register(r'quotes', QuoteViewSet, basename='quote')
router.register(r'books', views.BookViewSet)
router.register(r'tags', views.TagViewSet)
router.register(r'reactions', views.ReactionViewSet)
router.register(r'comments', views.CommentViewSet)
router.register(r'favorites', views.UserFavoriteViewSet)

# Include the router URLs into the main URL patterns
urlpatterns = [
    path('api/', include(router.urls)),
]
