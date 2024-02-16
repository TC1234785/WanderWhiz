from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, logout, login as auth_login
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy 
from django.http import HttpResponse
from project.settings import GOOGLE_API_KEY
from .models import User, Business, Itinerary
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
# from django.contrib.auth.models import User
# from django.template import loader
# from django.contrib.auth.decorators import login_required
# Create your views here.
#These functions will be called to render templates made in the 'templates' directory

class MyLoginView(LoginView):
    redirect_authenticated_user = True
    
    def get_success_url(self):
        return reverse_lazy('home') 
    
    def form_invalid(self, form):
        messages.error(self.request,'Invalid username or password')
        return self.render_to_response(self.get_context_data(form=form))
        


def register_user(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get("username")
            raw_password = form.cleaned_data.get("password1")
            user = authenticate(username=username, password=raw_password)
            auth_login(request, user)
            return redirect('home')
        else:
            messages.error(request, "There was an error creating the user. Please try again.")
    else:
        form = UserCreationForm()
    return render(request, 'registration/createuser.html', {'form': form})
    

def home(request):
    if request.user.is_authenticated:
        context = {'key': GOOGLE_API_KEY}
        return render(request, 'registration/home.html', context)
    else:
        return redirect('login')
# def login_user(request):
#     if request.user.is_authenticated:
#         return redirect('home')
#     else:
#         if request.method == 'POST':
#             username = request.POST["username"]
#             password = request.POST["password"]
#             user = authenticate(request, username=username, password=password)
#             if user is not None:
#                 auth_login(request, user)
#                 messages.success(request, f"User has been authenticated. Welcome {user.get_username()}!")
#                 return redirect('home')
#             else:
#                 messages.error(request, "There was an error logging in. Please try again...")
#                 return render(request, 'registration/login.html')
#         else:
#             return render(request, 'registration/login.html', {})

# def signout(request):
#     if request.user.is_authenticated:
#         logout(request)
#         messages.success(request, "You have been logged out! :)")
#         return redirect('registration/login.html')
#     else:
#         return redirect('home')




@csrf_exempt
def create_business_from_req(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        itinerary_count = Itinerary.objects.count()
        itinerary = Itinerary.objects.create(
            itinerary_name=f'New Itinerary {itinerary_count + 1}',
            user_id=request.user
        )
        for business in data:
            if not itinerary.business_list.filter(business_name=business['name']).exists():
                new_business = Business.objects.create(
                    business_name=business['name'],
                    address=business['address'],
                    business_type=business['type'],
                    rating=business['rating']
                )
                itinerary.business_list.add(new_business)
        response_data = {'message': 'Businesses added successfully'}
        return JsonResponse(response_data)
    response_data = {'error': 'Method not allowed'}
    return JsonResponse(response_data, status=405)


def itinerary_list(request):
    itineraries = Itinerary.objects.all()
    return render(request, 'itinerary_list.html', {'itineraries': itineraries})

def itinerary_detail(request, id):
    itinerary = get_object_or_404(Itinerary, id=id)
    return render(request, 'itinerary_detail.html', {'itinerary': itinerary})

def itinerary_update(request, id):
    itinerary = get_object_or_404(Itinerary, id=id)
    businesses = Business.objects.all()  # Retrieve all available businesses
    if request.method == 'POST':
        itinerary_name = request.POST.get('itinerary_name')
        selected_businesses = request.POST.getlist('businesses')  # Get the selected businesses as a list
        # Update the itinerary name
        itinerary.itinerary_name = itinerary_name
        # Clear the existing business list and add the selected businesses
        itinerary.business_list.clear()
        for business_id in selected_businesses:
            business = get_object_or_404(Business, id=business_id)
            itinerary.business_list.add(business)
        # Save the updated itinerary
        itinerary.save()
        # Redirect to the itinerary detail page or any other desired page
        return redirect('itinerary_detail', id=id)
    return render(request, 'itinerary_update.html', {'itinerary': itinerary, 'businesses': businesses})

    
def delete_itinerary(request, id):
    itinerary = get_object_or_404(Itinerary, id=id)
    itinerary.delete()
    messages.success(request, "Itinerary deleted successfully.")
    return redirect('itinerary_list')
