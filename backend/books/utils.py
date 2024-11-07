import requests
# books/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
import os
from typing import Dict, List, Optional
import requests
from django.core.cache import cache
from .models import Book, Quote, Tag

def fetch_books_by_title(title, api_key):
    """
    Fetches books matching the title from the Google Books API.

    Args:
        title (str): The title of the book to search for.
        api_key (str): Your Google Books API key.

    Returns:
        list: A list of dictionaries containing book information.
    """
    url = f"https://www.googleapis.com/books/v1/volumes?q=intitle:{title}&key={api_key}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad HTTP status codes
        data = response.json()
        
        # Extracting book information
        books = []
        for book in data.get("items", []):
            volume_info = book.get("volumeInfo", {})
            books.append({
                "title": volume_info.get("title", "N/A"),
                "authors": volume_info.get("authors", ["N/A"]),
                "published_date": volume_info.get("publishedDate", "N/A"),
                "description": volume_info.get("description", "N/A"),
                "thumbnail": volume_info.get("imageLinks", {}).get("thumbnail", "N/A")
            })
        return books
    except requests.exceptions.RequestException as e:
        print(f"Failed to retrieve data: {e}")
        return []

# utils.py
from typing import List, Dict, Optional
import os
import requests
from django.core.cache import cache
from .models import Book

class GoogleBooksAPI:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_BOOKS_API_KEY')
        self.base_url = "https://www.googleapis.com/books/v1/volumes"

    def search_books(self, query: str) -> List[Dict]:
        """Search books from Google Books API and cache results."""
        cache_key = f"book_search_{query}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result

        response = requests.get(
            self.base_url,
            params={'q': query, 'key': self.api_key, 'maxResults': 20}
        )
        if response.status_code != 200:
            return []

        books = []
        for item in response.json().get('items', []):
            volume_info = item.get('volumeInfo', {})
            books.append({
                'google_books_id': item.get('id'),
                'title': volume_info.get('title', ''),
                'authors': volume_info.get('authors', []),
                'genres': volume_info.get('categories', []),
                'thumbnail_url': volume_info.get('imageLinks', {}).get('thumbnail')
            })

        cache.set(cache_key, books, 3600)  # Cache for 1 hour
        return books

    def fetch_book_details(self, google_books_id: str) -> Optional[Dict]:
        """Fetch detailed book data by Google Books ID."""
        response = requests.get(
            f"{self.base_url}/{google_books_id}",
            params={'key': self.api_key}
        )
        if response.status_code != 200:
            return None

        data = response.json().get('volumeInfo', {})
        return {
            'google_books_id': google_books_id,
            'title': data.get('title', ''),
            'authors': data.get('authors', []),
            'genres': data.get('categories', []),
            'cover_image': data.get('imageLinks', {}).get('thumbnail', '')
        }

