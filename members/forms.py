from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from members.models import User, Itinerary, Business

class LoginForm(UserCreationForm):
    username = forms.CharField(max_length=65,label="Username")
    password = forms.CharField(max_length=65, label="Password",widget=forms.PasswordInput)

class CreateForm(UserCreationForm):
    def init(self, args, **kwargs):
        super(CreateForm, self).init(args, **kwargs)
        for fieldname in ['username', 'password1', 'password2']:
            self.fields[fieldname].help_text = None

class ItineraryForm(forms.ModelForm):
    business_list = forms.ModelMultipleChoiceField(
        queryset=Business.objects.all(),
        widget=forms.CheckboxSelectMultiple
    )
    class Meta:
        model = Itinerary
        fields = ['business_list']


class CustomAuthenticationForm(AuthenticationForm):
    class Meta:
        model = User
        fields = ['username', 'password']
