from rest_framework import serializers
from .models import Book, Quote, Tag, Reaction, Comment, UserFavorite
from django.utils.text import slugify


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = "__all__"


class QuoteSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False, default=list
    )
    book = BookSerializer(read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    

    class Meta:
        model = Quote
        fields = ["id", "user", "book", "text", "context", "tags", "created_at"]
        read_only_fields = ["user", "book"]

    def create(self, validated_data):
        tags_data = validated_data.pop("tags")
        quote = Quote.objects.create(**validated_data)

        # Handle tag creation and association
        for tag_name in tags_data:
            tag_name = tag_name.lower().strip()
            slug = slugify(tag_name)
            tag, _ = Tag.objects.get_or_create(
                name=tag_name, defaults={"slug": slug}
            )
            quote.tags.add(tag)

        return quote

    def update(self, instance, validated_data):
        tags_data = validated_data.pop("tags")
        instance.text = validated_data.get("text", instance.text)
        instance.context = validated_data.get("context", instance.context)
        instance.save()

        # Handle tag creation and association
        instance.tags.clear()
        for tag_name in tags_data:
            tag_name = tag_name.lower().strip()
            slug = slugify(tag_name)
            tag, _ = Tag.objects.get_or_create(
                name=tag_name,
                defaults={"slug": slug}
            )
            instance.tags.add(tag)
        return instance


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ["id", "user", "type"]


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = "__all__"


class QuoteFeedSerializer(serializers.ModelSerializer):
    reactions = ReactionSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    tags = serializers.StringRelatedField(many=True)  # Assuming tags use the name field

    class Meta:
        model = Quote
        fields = [
            "id",
            "user",
            "book",
            "text",
            "context",
            "tags",
            "reactions",
            "comments",
            "created_at",
        ]

    # def to_representation(self, instance):
    #   representation = super().to_representation(instance)
    #  representation['reactions'] = ReactionSerializer(instance.reactions.all(), many=True).data
    # return representation


class UserFavoriteSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")
    book = BookSerializer(read_only=True)

    class Meta:
        model = UserFavorite
        fields = ["id", "user", "book", "created_at"]
