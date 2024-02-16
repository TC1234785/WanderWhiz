from django.db import models
from django.contrib.auth.models import *

# Create your models here.
#This is the main data base. We can add new members to our database using predefined attributes here
#A model is simply a table in your database
#in the 'Project' directory, you can run 'py manage.py makemigrations members' and then 'py manage.py migrate' to create the tables based on the models below
#The 


    

# class UserManager(UserManager):
#     def create_user(self, email, password=None):
#         """
#         Creates and saves a User with the given email and password.
#         """
#         if not email:
#             raise ValueError('Users must have an email address')

#         user = self.model(
#             email=self.normalize_email(email),
#         )

#         user.set_password(password)
#         user.save(using=self._db)
#         return user

#     def create_staffuser(self, email, password):
#         """
#         Creates and saves a staff user with the given email and password.
#         """
#         user = self.create_user(
#             email,
#             password=password,
#         )
#         user.staff = True
#         user.save(using=self._db)
#         return user

#     def create_superuser(self, email, password):
#         """
#         Creates and saves a superuser with the given email and password.
#         """
#         user = self.create_user(
#             email,
#             password=password,
#         )
#         user.staff = True
#         user.admin = True
#         user.save(using=self._db)
#         return user

# class User(AbstractBaseUser):
#     email = models.EmailField(
#         verbose_name='email address',
#         max_length=255,
#         unique=True,
#     )
#     is_active = models.BooleanField(default=True)
#     staff = models.BooleanField(default=False) # a admin user; non super-user
#     admin = models.BooleanField(default=False) # a superuser


#     USERNAME_FIELD = 'email'
#     REQUIRED_FIELDS = [] 

#     def get_full_name(self):
#         # The user is identified by their email address
#         return self.email

#     def get_short_name(self):
#         # The user is identified by their email address
#         return self.email

#     def __str__(self):
#         return self.email

#     def has_perm(self, perm, obj=None):
#         return True

#     def has_module_perms(self, app_label):
#         return True

#     @property
#     def is_staff(self):
#         return self.staff

#     @property
#     def is_admin(self):
#         return self.admin
        
#     objects = UserManager()

# class Location(models.Model):
#     location_id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='Location ID',unique=True)
#     latitude = models.DecimalField(max_digits=9, decimal_places=6)
#     longitude= models.DecimalField(max_digits=9, decimal_places=6)


class Business(models.Model):
    business_name = models.CharField(max_length=255)
    business_type = models.CharField(max_length=12, default='Tourist Attraction')
    address = models.CharField(max_length=255)
    rating = models.CharField(max_length=5)
    def __str__(self) -> str:
        return self.business_name



class Itinerary(models.Model):
    itinerary_name = models.CharField(max_length=255)
    business_list = models.ManyToManyField(Business)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return self.itinerary_name
        
        