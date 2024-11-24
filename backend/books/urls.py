from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuoteViewSet, BookViewSet, TagViewSet, ReactionViewSet, CommentViewSet, UserFavoriteViewSet

# Initialize the default router
router = DefaultRouter()

router.register(r'quotes', QuoteViewSet, basename='quote')  
router.register(r'books', BookViewSet, basename='book')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'reactions', ReactionViewSet, basename='reaction')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'favorites', UserFavoriteViewSet, basename='favorite')

# Include the router URLs into the main URL patterns
urlpatterns = [
    path('api/', include(router.urls)),
]
