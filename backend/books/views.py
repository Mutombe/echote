from django.utils.text import slugify
from typing import Optional
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
import requests
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .serializers import BookSerializer, CommentSerializer, QuoteFeedSerializer, QuoteSerializer, ReactionSerializer, TagSerializer, UserFavoriteSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db.models import Count, Prefetch
from .models import Book, Quote, Tag, Reaction, Comment, UserFavorite
from .utils import GoogleBooksAPI
class BookService:
    def __init__(self):
        self.api = GoogleBooksAPI()
        
    def search_books(self, query: str):
        """Delegates book search to GoogleBooksAPI and formats for frontend."""
        return self.api.search_books(query)
    
    def create_or_get_book(self, google_books_id: str) -> Optional[Book]:
        """Get book from DB or create from API"""
        try:
            return Book.objects.get(google_books_id=google_books_id)
        except Book.DoesNotExist:
            response = requests.get(
                f"{self.base_url}/{google_books_id}",
                params={'key': self.api_key}
            )
            
            if response.status_code != 200:
                return None
            
            data = response.json()
            volume_info = data.get('volumeInfo', {})
            
            return Book.objects.create(
                google_books_id=google_books_id,
                title=volume_info.get('title', ''),
                authors=volume_info.get('authors', []),
                genres=volume_info.get('categories', []),
                thumbnail_url=volume_info.get('imageLinks', {}).get('thumbnail')
            )
        
class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer

    @action(detail=True, methods=['post'], url_path='create-quote')
    def create_quote(self, request, pk=None):
        service = BookService()
        book = service.create_or_get_book(google_books_id=pk)
        serializer = QuoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Assign the book to the quote data
        serializer.save(user=request.user, book=book)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='add-reaction')
    def add_reaction(self, request, pk=None):
        """Allows a user to react to a quote"""
        quote = self.get_object()
        serializer = ReactionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, quote=quote)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['get'], url_path='feed')
    def feed(self, request):
        quotes = Quote.objects.select_related('user', 'book')\
            .prefetch_related(
                Prefetch('reactions', queryset=Reaction.objects.select_related('user')),
                'tags',
                Prefetch('comments', queryset=Comment.objects.select_related('user'))
            )\
            .annotate(reaction_count=Count('reactions'))\
            .order_by('-created_at')
        
        # Use the custom feed serializer for the feed response
        serializer = QuoteFeedSerializer(quotes, many=True)
        return Response({'quotes': serializer.data})

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q')
        if query:
            google_books_api = GoogleBooksAPI()
            books = google_books_api.search_books(query)
            return Response(books, status=status.HTTP_200_OK)
        return Response({'error': 'No query provided'}, status=status.HTTP_400_BAD_REQUEST)
    
class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ReactionViewSet(viewsets.ModelViewSet):
    queryset = Reaction.objects.select_related('user', 'quote')
    serializer_class = ReactionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related('user', 'book')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class UserFavoriteViewSet(viewsets.ModelViewSet):
    queryset = UserFavorite.objects.select_related('user', 'book')
    serializer_class = UserFavoriteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

@action(detail=True, methods=['post'], url_path='toggle-reaction')
def toggle_reaction(request, quote_id):
    quote = get_object_or_404(Quote, id=quote_id)
    reaction_type = request.POST.get('reaction_type')
    
    if reaction_type not in dict(Reaction.type):
        return JsonResponse({'error': 'Invalid reaction type'}, status=400)
    
    reaction, created = Reaction.objects.get_or_create(
        user=request.user,
        quote=quote,
        defaults={'reaction_type': reaction_type}
    )
    
    if not created:
        if reaction.reaction_type == reaction_type:
            reaction.delete()
            return JsonResponse({'status': 'removed'})
        reaction.reaction_type = reaction_type
        reaction.save()
    
    return JsonResponse({'status': 'updated'})

