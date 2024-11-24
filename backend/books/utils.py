import requests
from typing import Dict, List, Optional
from django.core.cache import cache
from django.conf import settings


class GoogleBooksAPI:
    def __init__(self):
        self.api_key = settings.GOOGLE_BOOKS_API_KEY
        self.base_url = "https://www.googleapis.com/books/v1/volumes"

    def search_books(self, query: str) -> List[Dict]:
        """Search for books using Google Books API and cache results."""
        cache_key = f"book_search_{query}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result

        response = requests.get(
            self.base_url, params={"q": query, "key": self.api_key, "maxResults": 20}
        )
        if response.status_code != 200:
            return []

        books = [
            {
                "google_books_id": item.get("id"),
                "title": item.get("volumeInfo", {}).get("title", ""),
                "authors": item.get("volumeInfo", {}).get("authors", []),
                "genres": item.get("volumeInfo", {}).get("categories", []),
                "thumbnail_url": item.get("volumeInfo", {})
                .get("imageLinks", {})
                .get("thumbnail"),
            }
            for item in response.json().get("items", [])
        ]

        cache.set(cache_key, books, 3600)  # Cache for 1 hour
        return books

    def fetch_book_details(self, google_books_id: str) -> Optional[Dict]:
        """Fetch detailed book data by Google Books ID."""
        response = requests.get(
            f"{self.base_url}/{google_books_id}", params={"key": self.api_key}
        )
        if response.status_code != 200:
            return None

        data = response.json().get("volumeInfo", {})
        return {
            "google_books_id": google_books_id,
            "title": data.get("title", ""),
            "authors": data.get("authors", []),
            "genres": data.get("categories", []),
            "cover_image": data.get("imageLinks", {}).get("thumbnail", ""),
        }
