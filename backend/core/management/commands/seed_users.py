from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils.dateparse import parse_datetime

class Command(BaseCommand):
    help = 'Seeds the database with users (legacy and new)'

    def handle(self, *args, **options):
        self.stdout.write('Seeding users...')

        new_users = [
            {'username': 'coach@gmail.com', 'email': 'coach@gmail.com', 'password': 'coach123'},
            {'username': 'athlete@gmail.com', 'email': 'athlete@gmail.com', 'password': 'athlete123'},
        ]

        for u_data in new_users:
            # We use distinct logic here to ensure we don't overwrite a legacy user if names collide (unlikely here)
            # and to properly hash the password.
            if not User.objects.filter(username=u_data['username']).exists():
                user = User.objects.create_user(
                    username=u_data['username'],
                    email=u_data['email'],
                    password=u_data['password']
                )
                user.is_active = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created new user: {u_data['username']}"))
            else:
                # If they exist, we might want to reset the password to ensure login works 
                user = User.objects.get(username=u_data['username'])
                user.set_password(u_data['password'])
                user.save()
                self.stdout.write(self.style.WARNING(f"Updated existing user password: {u_data['username']}"))
