# Generated by Django 5.1.2 on 2024-11-23 13:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0002_remove_comment_book_comment_quote'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tag',
            name='book',
        ),
    ]
