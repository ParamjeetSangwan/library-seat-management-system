import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import csv
from core.models import Member, Seat, Membership, Payment, Attendance

# Members
with open('tableau_members.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['member_id','full_name','status','seat_number','membership_status','join_date'])
    for m in Member.objects.all():
        seat = getattr(m, 'seat', None)
        ms = m.memberships.filter(status='active').first()
        w.writerow([m.member_id, m.full_name,
                    'Active' if m.is_active else 'Inactive',
                    seat.seat_number if seat else 'Not assigned',
                    ms.status if ms else 'No membership',
                    str(m.created_at.date())])

# Payments
with open('tableau_payments.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['payment_id','member_name','amount','payment_mode','payment_date','month','year'])
    for p in Payment.objects.select_related('member').all():
        w.writerow([p.payment_id, p.member.full_name, float(p.amount),
                    p.payment_mode, str(p.payment_date.date()),
                    p.payment_date.strftime('%B'), p.payment_date.year])

# Attendance
with open('tableau_attendance.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['attendance_id','member_name','date','day_of_week','month','year'])
    for a in Attendance.objects.select_related('member').all():
        w.writerow([a.attendance_id, a.member.full_name,
                    str(a.date), a.date.strftime('%A'),
                    a.date.strftime('%B'), a.date.year])

# Memberships
with open('tableau_memberships.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['membership_id','member_name','start_date','end_date','fee_paid','status','month','year'])
    for ms in Membership.objects.select_related('member').all():
        w.writerow([ms.membership_id, ms.member.full_name,
                    str(ms.start_date), str(ms.end_date),
                    float(ms.fee_paid), ms.status,
                    ms.start_date.strftime('%B'), ms.start_date.year])

# Seats
with open('tableau_seats.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['seat_number','status','member_name'])
    for s in Seat.objects.select_related('member').order_by('seat_number'):
        w.writerow([s.seat_number,
                    'Occupied' if s.is_occupied else 'Vacant',
                    s.member.full_name if s.member else ''])

print("All 5 CSV files exported!")