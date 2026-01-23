from django.core.management.base import BaseCommand
from core.models import Exercise

class Command(BaseCommand):
    help = 'Seeds the database with standard exercises'

    def handle(self, *args, **options):
        self.stdout.write('Seeding exercises...')
        
        # Data extracted from original dump
        exercises_data = [
            {"pk": 1, "fields": {"name": "Barbell Bench Press", "description": "Compound chest exercise.", "body_part": "CH", "owner": None}},
            {"pk": 2, "fields": {"name": "Clean", "description": "", "body_part": "FB", "owner": None}},
            {"pk": 3, "fields": {"name": "Jerk", "description": "", "body_part": "OT", "owner": None}},
            {"pk": 4, "fields": {"name": "Clean & Jerk", "description": "", "body_part": "OT", "owner": None}},
            {"pk": 5, "fields": {"name": "Snatch", "description": "", "body_part": "OT", "owner": None}},
            {"pk": 6, "fields": {"name": "Power Clean", "description": "", "body_part": "OT", "owner": None}},
            {"pk": 7, "fields": {"name": "Power Snatch", "description": "", "body_part": "OT", "owner": None}},
            {"pk": 8, "fields": {"name": "Power jerk", "description": "", "body_part": "OT", "owner": None}},
            {"pk": 9, "fields": {"name": "Hip Thrusts", "description": "Greta's favourite", "body_part": "LG", "owner": None}},
        ]

        for e_data in exercises_data:
            fields = e_data['fields']
            Exercise.objects.update_or_create(
                id=e_data['pk'],
                defaults={
                    'name': fields['name'],
                    'description': fields['description'],
                    'body_part': fields['body_part'],
                    'owner': None 
                }
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded exercises'))
