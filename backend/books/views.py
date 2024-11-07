# books/models.py
from django.utils.text import slugify
from typing import Dict, List, Optional
import requests
from django.core.cache import cache
from django.conf import settings
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db.models import Count, Prefetch
from .models import Book, Quote, Tag, Reaction, Comment
class BookService:
    def __init__(self):
        self.api_key = settings.GOOGLE_BOOKS_API_KEY
        self.base_url = "https://www.googleapis.com/books/v1/volumes"
    
    def search_books(self, query: str) -> List[Dict]:
        """Search books and format response for frontend"""
        cache_key = f"book_search_{query}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        response = requests.get(
            self.base_url,
            params={
                'q': query,
                'key': self.api_key,
                'maxResults': 20
            }
        )
        
        if response.status_code != 200:
            return []
        
        books = []
        for item in response.json().get('items', []):
            volume_info = item.get('volumeInfo', {})
            book_data = {
                'google_books_id': item.get('id'),
                'title': volume_info.get('title', ''),
                'authors': volume_info.get('authors', []),
                'genres': volume_info.get('categories', []),
                'thumbnail_url': volume_info.get('imageLinks', {}).get('thumbnail')
            }
            books.append(book_data)
        
        cache.set(cache_key, books, 3600)  # Cache for 1 hour
        return books
    
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

@login_required
def search_books(request):
    query = request.GET.get('q', '')
    service = BookService()
    books = service.search_books(query) if query else []
    return JsonResponse({'books': books, 'query': query})

@login_required
def create_quote(request, google_books_id):
    if request.method == 'POST':
        service = BookService()
        book = service.create_or_get_book(google_books_id)
        
        if not book:
            return JsonResponse({'error': 'Book not found'}, status=404)
        
        quote = Quote.objects.create(
            user=request.user,
            book=book,
            content=request.POST['content'],
            context=request.POST.get('context', '')
        )
        
        # Handle tags
        tags = request.POST.getlist('tags')
        for tag_name in tags:
            tag, _ = Tag.objects.get_or_create(
                name=tag_name.lower(),
                defaults={'slug': slugify(tag_name)}
            )
            quote.tags.add(tag)
        
        
    return JsonResponse({'quote_id': quote.id})


@login_required
@require_POST
def toggle_reaction(request, quote_id):
    quote = get_object_or_404(Quote, id=quote_id)
    reaction_type = request.POST.get('reaction_type')
    
    if reaction_type not in dict(Reaction.REACTION_TYPES):
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

def quote_feed(request):
    quotes = Quote.objects.select_related('user', 'book')\
        .prefetch_related(
            Prefetch('reactions', queryset=Reaction.objects.select_related('user')),
            'tags',
            Prefetch('comments', queryset=Comment.objects.select_related('user'))
        )\
        .annotate(reaction_count=Count('reactions'))\
        .order_by('-created_at')
    
    return JsonResponse({'quotes': quotes})
