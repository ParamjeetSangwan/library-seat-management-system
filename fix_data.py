import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Member, Membership
from datetime import date, timedelta
import random

today = date.today()

# Get all members except first 2 (keep Rahul and Paramjeet as is)
members = list(Member.objects.all()[3:])

# Make 8 members have expired memberships
expired_members = random.sample(members, 8)

for member in expired_members:
    # Cancel active memberships
    member.memberships.filter(status='active').update(status='expired')
    print(f'Expired: {member.full_name}')

# Make 3 members completely inactive
inactive_members = random.sample(
    [m for m in members if m not in expired_members], 3
)
for member in inactive_members:
    member.memberships.filter(status='active').update(status='cancelled')
    member.is_active = False
    member.save()
    print(f'Inactive: {member.full_name}')

print(f'\nDone! Now you have:')
print(f'Active members: {Member.objects.filter(is_active=True).count()}')
print(f'Inactive members: {Member.objects.filter(is_active=False).count()}')
print(f'Active memberships: {Membership.objects.filter(status="active").count()}')
print(f'Expired memberships: {Membership.objects.filter(status="expired").count()}')
print(f'Cancelled memberships: {Membership.objects.filter(status="cancelled").count()}')