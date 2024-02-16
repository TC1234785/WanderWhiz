from django.urls import path, include
from .views import *

urlpatterns = [
    path('', home, name='home'),
    path('register/', register_user, name='register'),
    path('home/', home, name='home'),
    path('login/', MyLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='login'),name='logout'),
    path('business/new/', create_business_from_req, name='business'),
    path('itineraries/', itinerary_list, name='itinerary_list'),
    path('itineraries/<int:id>/', itinerary_detail, name='itinerary_detail'),
    path('itineraries/<int:id>/update/', itinerary_update, name='itinerary_update'),
    path('itineraries/<int:id>/delete/', delete_itinerary, name='itinerary_delete'),

]
    # path('itineraries/new/', create_itinerary, name='create_itinerary'),

    # path('logout/', signout, name='logout'),