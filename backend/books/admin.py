from django.contrib import admin
from .models import Book, Quote, Tag, Reaction, Comment

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'authors', 'created_at')
    search_fields = ('title', 'authors')

@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'text', 'created_at')
    search_fields = ('text', 'book__title')
    list_filter = ('created_at',)

@admin.register(Reaction)
class ReactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'quote', 'type')
    list_filter = ('type',)
