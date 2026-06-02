import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import bcrypt
from core.models import Member, Seat, Membership, Payment, Attendance, Admin
from datetime import date, timedelta
import random

names = [
    ('Amit Kumar', 'Rajesh Kumar'), ('Priya Sharma', 'Suresh Sharma'),
    ('Rohit Singh', 'Vikram Singh'), ('Neha Gupta', 'Anil Gupta'),
    ('Vikash Yadav', 'Ramesh Yadav'), ('Pooja Verma', 'Dinesh Verma'),
    ('Rahul Mishra', 'Sunil Mishra'), ('Anjali Joshi', 'Mahesh Joshi'),
    ('Deepak Tiwari', 'Rakesh Tiwari'), ('Sunita Patel', 'Haresh Patel'),
    ('Manish Dubey', 'Girish Dubey'), ('Kavita Singh', 'Mohan Singh'),
    ('Rajesh Pandey', 'Umesh Pandey'), ('Suman Rai', 'Naresh Rai'),
    ('Arun Saxena', 'Dinesh Saxena'), ('Meena Chauhan', 'Sohan Chauhan'),
    ('Suresh Lodhi', 'Ganesh Lodhi'), ('Rekha Bhatt', 'Ramesh Bhatt'),
    ('Vinod Jain', 'Mukesh Jain'), ('Seema Tomar', 'Rakesh Tomar'),
    ('Naveen Garg', 'Praveen Garg'), ('Geeta Chaudhary', 'Ratan Chaudhary'),
    ('Pankaj Arora', 'Sanjay Arora'), ('Ritu Bajaj', 'Vijay Bajaj'),
    ('Ashok Kapoor', 'Trilok Kapoor'),
]

cities = ['Rohtak', 'Karnal', 'Panipat', 'Sonipat', 'Hisar',
          'Ambala', 'Gurugram', 'Faridabad', 'Rewari', 'Bhiwani']

h = bcrypt.hashpw(b'test123', bcrypt.gensalt()).decode()
admin = Admin.objects.first()
today = date.today()
created = 0

# Use guaranteed unique mobile starting from 9000000001
base_mobile = 9000000001

for i, (name, father) in enumerate(names):
    mobile = str(base_mobile + i)
    email = f'member{base_mobile + i}@library.com'

    # Skip if somehow exists
    if Member.objects.filter(mobile=mobile).exists():
        print(f'Skipping {name} - mobile exists')
        continue
    if Member.objects.filter(email=email).exists():
        print(f'Skipping {name} - email exists')
        continue

    member = Member.objects.create(
        full_name=name, father_name=father,
        mobile=mobile, email=email,
        password_hash=h,
        address=f'{random.randint(1,999)}, {random.choice(cities)}, Haryana',
        is_email_verified=True, is_active=True
    )

    # Assign seat
    seat = Seat.objects.filter(is_occupied=False).first()
    if seat:
        seat.member = member
        seat.is_occupied = True
        seat.assigned_date = today - timedelta(days=random.randint(30, 180))
        seat.save()

    # Add membership
    days_ago = random.randint(0, 60)
    start = today - timedelta(days=days_ago)
    end = start + timedelta(days=30)
    status = 'active' if end >= today else 'expired'

    membership = Membership.objects.create(
        member=member, start_date=start,
        end_date=end, fee_paid=500, status=status
    )

    Payment.objects.create(
        member=member, membership=membership,
        amount=500,
        payment_mode=random.choice(['cash', 'cash', 'online']),
        recorded_by=admin
    )

    # Previous month for some members
    if random.random() > 0.5:
        prev_start = start - timedelta(days=30)
        prev_end = start - timedelta(days=1)
        prev_ms = Membership.objects.create(
            member=member, start_date=prev_start,
            end_date=prev_end, fee_paid=500, status='expired'
        )
        Payment.objects.create(
            member=member, membership=prev_ms,
            amount=500, payment_mode='cash',
            recorded_by=admin
        )

    # Add attendance records
    dates_used = set()
    for _ in range(random.randint(8, 25)):
        att_date = today - timedelta(days=random.randint(0, 29))
        if att_date not in dates_used:
            dates_used.add(att_date)
            try:
                Attendance.objects.create(
                    member=member,
                    date=att_date,
                    marked_by=admin
                )
            except:
                pass

    created += 1
    print(f'✅ Created: {name} | Mobile: {mobile} | Seat: {seat.seat_number if seat else "None"}')

print(f'\n🎉 Done! Created {created} members with full data!')