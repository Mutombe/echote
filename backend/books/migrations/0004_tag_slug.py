# Generated by Django 5.1.2 on 2024-11-23 15:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("books", "0003_remove_tag_book"),
    ]

    operations = [
        migrations.AddField(
            model_name="tag",
            name="slug",
            field=models.SlugField(blank=True, unique=True),
        ),
    ]
