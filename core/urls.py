from django.urls import path
from . import views

urlpatterns = [

    # ── AUTH ──────────────────────────────────────────
    path('auth/send-otp/',        views.send_otp,        name='send-otp'),
    path('auth/verify-otp/',      views.verify_otp,      name='verify-otp'),
    path('auth/register/',        views.register_member, name='register'),
    path('auth/member/login/',    views.member_login,    name='member-login'),
    path('auth/admin/login/',     views.admin_login,     name='admin-login'),

    # ── SEATS ─────────────────────────────────────────
    path('seats/',                      views.seat_map,     name='seat-map'),
    path('seats/<int:seat_id>/',        views.seat_detail,  name='seat-detail'),
    path('seats/assign/',               views.assign_seat,  name='assign-seat'),

    # ── SEAT CHANGE REQUESTS ──────────────────────────
    path('seat-requests/',                          views.pending_seat_requests,  name='pending-seat-requests'),
    path('seat-requests/create/',                   views.request_seat_change,    name='request-seat-change'),
    path('seat-requests/<int:request_id>/resolve/', views.resolve_seat_request,   name='resolve-seat-request'),

    # ── MEMBERSHIP ────────────────────────────────────
    path('memberships/add/',                    views.add_membership,    name='add-membership'),
    path('memberships/cancel/<int:member_id>/', views.cancel_membership, name='cancel-membership'),

    # ── ATTENDANCE ────────────────────────────────────
    path('attendance/mark/',                    views.mark_attendance,   name='mark-attendance'),
    path('attendance/today/',                   views.today_attendance,  name='today-attendance'),
    path('attendance/member/<int:member_id>/',  views.member_attendance, name='member-attendance'),

    # ── PAYMENTS ──────────────────────────────────────
    path('payments/pending/',                   views.pending_payments,  name='pending-payments'),
    path('payments/member/<int:member_id>/',    views.member_payments,   name='member-payments'),

    # ── NOTIFICATIONS ─────────────────────────────────
    path('notifications/<int:member_id>/',               views.member_notifications,    name='member-notifications'),
    path('notifications/read/<int:notification_id>/',    views.mark_notification_read,  name='mark-read'),

    # ── MEMBERS ───────────────────────────────────────
    path('members/',                    views.all_members,   name='all-members'),
    path('members/<int:member_id>/',    views.member_detail, name='member-detail'),

    # ── SETTINGS ──────────────────────────────────────
    path('settings/',         views.get_settings,    name='get-settings'),
    path('settings/update/',  views.update_setting,  name='update-setting'),

    # ── ANALYTICS ─────────────────────────────────────
    path('analytics/',  views.analytics_overview, name='analytics'),
    
    # ── SETTING ─────────────────────────────────────
    path('admin/update/', views.update_admin, name='update-admin'),

    # ── EDITING ─────────────────────────────────────
    path('seats/update-total/', views.update_total_seats, name='update-total-seats'),

    # ── EXPORT ─────────────────────────────────────
    path('export/members/',    views.export_members_excel,    name='export-members'),
    path('export/payments/',   views.export_payments_excel,   name='export-payments'),
    path('export/attendance/', views.export_attendance_excel, name='export-attendance'),

]