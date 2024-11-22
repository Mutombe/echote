from django.utils.text import slugify
from typing import Optional
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
import requests
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from .serializers import BookSerializer, CommentSerializer, QuoteFeedSerializer, QuoteSerializer, ReactionSerializer, TagSerializer, UserFavoriteSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from rest_framework.decorators import api_view
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
            # Fetch book details from Google API
            book_data = self.api.fetch_book_details(google_books_id)
            if not book_data:
                return None
            
            return Book.objects.create(
                google_books_id=google_books_id,
                title=book_data.get('title', ''),
                authors=book_data.get('authors', []),
                genres=book_data.get('genres', []),
                cover_image=book_data.get('cover_image', '')
            )

@api_view(['GET'])
def search_books(request):
    book_service = BookService()
    query = request.query_params.get('query', '')
    if not query:
        return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    books = book_service.search_books(query)
    return Response(books, status=status.HTTP_200_OK)

class BookViewSet(viewsets.ModelViewSet): 
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    service = BookService()
   

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """Search for books in the database and API if not found."""
        query = request.query_params.get('q')
        if not query:
            return Response({'error': 'No query provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            books = self.service.search_books(query)
            return Response({"results": books}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
          
class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    service = BookService()

    @action(detail=True, methods=['post'], url_path='create-quote')
    def create_quote(self, request, pk=None):
        """Create a quote with a linked book, creating the book if needed."""
        google_books_id = pk
        book = self.service.create_or_get_book(google_books_id)
        if not book:
            return Response({"error": "Unable to fetch or create book."}, status=status.HTTP_404_NOT_FOUND)
        
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
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='toggle-reaction')
    def toggle_reaction(self, request, pk=None):
        """Toggles a reaction on a quote."""
        quote = self.get_object()
        reaction_type = request.data.get('reaction_type')

        if reaction_type not in dict(Reaction.type):
            return Response({'error': 'Invalid reaction type'}, status=status.HTTP_400_BAD_REQUEST)

        reaction, created = Reaction.objects.get_or_create(
            user=request.user,
            quote=quote,
            defaults={'reaction_type': reaction_type}
        )

        if not created:
            if reaction.reaction_type == reaction_type:
                reaction.delete()
                return Response({'status': 'removed'})
            reaction.reaction_type = reaction_type
            reaction.save()

        return Response({'status': 'updated'})
        
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

