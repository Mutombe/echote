from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User


class Book(models.Model):
    title = models.CharField(max_length=255)
    authors = models.JSONField(help_text="List of authors")
    description = models.TextField(blank=True, null=True)
    cover_image = models.URLField(blank=True, null=True)
    google_books_id = models.CharField(max_length=100, unique=True)
    genres = models.JSONField(
        default=list, help_text="List of genres/categories", null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["title"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.title} by {self.authors}"


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}"


class Quote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quotes")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="quotes")
    text = models.TextField(help_text="The quote text")
    context = models.TextField(
        blank=True, help_text="Additional context or chapter info"
    )
    tags = models.ManyToManyField(Tag, related_name="quotes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.text[:50]}..."


class Reaction(models.Model):
    REACTION_CHOICES = [
        ("LIKE", "👍"),
        ("LOVE", "❤️"),
        ("THINK", "🤔"),
        ("INSPIRE", "✨"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name="reactions")
    type = models.CharField(choices=REACTION_CHOICES, max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "quote"]
        indexes = [
            models.Index(fields=["type"]),
        ]

    def __str__(self):
        return f"{self.user.username} reacted with {self.type} on {self.quote.text}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    quote = models.ForeignKey(
        Quote, related_name="comments", on_delete=models.CASCADE, null=True
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} commented on {self.book.title}"


class UserFavorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, related_name="favorites", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "book")

    def __str__(self):
        return f"{self.user.username} favorited {self.book.title}"
