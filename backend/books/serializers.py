from rest_framework import serializers
from .models import Book, Quote, Tag, Reaction, Comment, UserFavorite
from django.utils.text import slugify


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = "__all__"

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']

class QuoteSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tags_list = serializers.ListField(
        child=serializers.CharField(), 
        write_only=True, 
        required=False, 
        default=list,
        source='tags'
    )
    book = BookSerializer(read_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Quote
        fields = ["id", "user", "book", "text", "context", "tags", "tags_list", "created_at"]
        read_only_fields = ["user", "book"]

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'avatar': obj.user.profile.avatar.url if hasattr(obj.user, 'profile') and obj.user.profile.avatar else None
        }

    def create(self, validated_data):
        tags_data = validated_data.pop("tags")
        quote = Quote.objects.create(**validated_data)

        for tag_name in tags_data:
            tag_name = tag_name.lower().strip()
            slug = slugify(tag_name)
            tag, _ = Tag.objects.get_or_create(
                name=tag_name,
                defaults={"slug": slug}
            )
            quote.tags.add(tag)

        return quote

    def update(self, instance, validated_data):
        if 'tags' in validated_data:
            tags_data = validated_data.pop("tags")
            instance.tags.clear()
            for tag_name in tags_data:
                tag_name = tag_name.lower().strip()
                slug = slugify(tag_name)
                tag, _ = Tag.objects.get_or_create(
                    name=tag_name,
                    defaults={"slug": slug}
                )
                instance.tags.add(tag)
        
        return super().update(instance, validated_data)


class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ["id", "user", "type"]


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 
            'user', 
            'quote', 
            'parent', 
            'content', 
            'created_at', 
            'updated_at', 
            'replies'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'avatar': obj.user.profile.avatar.url if hasattr(obj.user, 'profile') and obj.user.profile.avatar else None
        }

    def get_replies(self, obj):
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True).data


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
