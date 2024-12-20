from django.urls import path, include
from . import views

urlpatterns = [
    path("signup", views.UserRegister.as_view(), name="signup"),
    path("login", views.UserLogin.as_view(), name="login"),
    path("logout", views.UserLogout.as_view(), name="logout"),
    path("user", views.UserView.as_view(), name="user"),
    path("users", views.AllUsers.as_view(), name="users"),
]