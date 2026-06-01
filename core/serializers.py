from rest_framework import serializers
from .models import (Member, Admin, Seat, Membership,
                     Payment, Attendance, SeatChangeRequest,
                     Notification, Setting, EmailOtp)
from django.utils import timezone


# ─── AUTH ────────────────────────────────────────────────────
class MemberRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = Member
        fields = ['full_name', 'father_name', 'mobile', 'email',
                  'password', 'address', 'profile_photo', 'aadhar_photo']

    def validate_mobile(self, value):
        if Member.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("Mobile number already registered.")
        return value

    def validate_email(self, value):
        if Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value


class MemberLoginSerializer(serializers.Serializer):
    mobile   = serializers.CharField()
    password = serializers.CharField(write_only=True)


# ─── MEMBER ──────────────────────────────────────────────────
class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Member
        fields = ['member_id', 'full_name', 'father_name', 'mobile',
                  'email', 'address', 'profile_photo', 'aadhar_photo',
                  'is_email_verified', 'is_active', 'created_at']


# ─── SEAT ────────────────────────────────────────────────────
class SeatSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()

    class Meta:
        model  = Seat
        fields = ['seat_id', 'seat_number', 'is_occupied',
                  'member_id', 'member_name', 'assigned_date']

    def get_member_name(self, obj):
        return obj.member.full_name if obj.member else None


class SeatDetailSerializer(serializers.ModelSerializer):
    member          = MemberSerializer(read_only=True)
    active_membership = serializers.SerializerMethodField()
    payment_history = serializers.SerializerMethodField()
    attendance_this_month = serializers.SerializerMethodField()

    class Meta:
        model  = Seat
        fields = ['seat_id', 'seat_number', 'is_occupied',
                  'assigned_date', 'member',
                  'active_membership', 'payment_history',
                  'attendance_this_month']

    def get_active_membership(self, obj):
        try:
            if not obj.member:
                return None
            m = Membership.objects.filter(
                member=obj.member, status='active'
            ).first()
            if m:
                return {
                    'membership_id': m.membership_id,
                    'start_date':    str(m.start_date),
                    'end_date':      str(m.end_date),
                    'fee_paid':      str(m.fee_paid),
                    'status':        m.status,
                    'days_remaining': m.days_remaining,
                }
            return None
        except Exception as e:
            return None

    def get_payment_history(self, obj):
        try:
            if not obj.member:
                return []
            payments = Payment.objects.filter(
                member=obj.member
            ).order_by('-payment_date')[:10]
            return [{
                'payment_id':   p.payment_id,
                'amount':       str(p.amount),
                'payment_mode': p.payment_mode,
                'payment_date': str(p.payment_date),
                'notes':        p.notes,
            } for p in payments]
        except Exception as e:
            return []

    def get_attendance_this_month(self, obj):
        try:
            if not obj.member:
                return 0
            today = timezone.now().date()
            return Attendance.objects.filter(
                member=obj.member,
                date__year=today.year,
                date__month=today.month
            ).count()
        except Exception as e:
            return 0

# ─── MEMBERSHIP ──────────────────────────────────────────────
class MembershipSerializer(serializers.ModelSerializer):
    days_remaining = serializers.ReadOnlyField()
    member_name    = serializers.CharField(source='member.full_name',
                                           read_only=True)

    class Meta:
        model  = Membership
        fields = ['membership_id', 'member', 'member_name', 'start_date',
                  'end_date', 'fee_paid', 'status',
                  'days_remaining', 'created_at']


# ─── PAYMENT ─────────────────────────────────────────────────
class PaymentSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name',
                                        read_only=True)

    class Meta:
        model  = Payment
        fields = ['payment_id', 'member', 'member_name', 'membership',
                  'amount', 'payment_mode', 'payment_date',
                  'recorded_by', 'notes']


# ─── ATTENDANCE ──────────────────────────────────────────────
class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name',
                                        read_only=True)
    seat_number = serializers.SerializerMethodField()

    class Meta:
        model  = Attendance
        fields = ['attendance_id', 'member', 'member_name',
                  'seat_number', 'date', 'marked_at']

    def get_seat_number(self, obj):
        try:
            return obj.member.seat.seat_number
        except Exception:
            return None


# ─── SEAT CHANGE REQUEST ─────────────────────────────────────
class SeatChangeRequestSerializer(serializers.ModelSerializer):
    member_name          = serializers.CharField(source='member.full_name',
                                                 read_only=True)
    current_seat_number  = serializers.IntegerField(
                               source='current_seat.seat_number',
                               read_only=True)
    requested_seat_number = serializers.IntegerField(
                               source='requested_seat.seat_number',
                               read_only=True)

    class Meta:
        model  = SeatChangeRequest
        fields = ['request_id', 'member', 'member_name',
                  'current_seat', 'current_seat_number',
                  'requested_seat', 'requested_seat_number',
                  'status', 'requested_at', 'resolved_at']


# ─── NOTIFICATION ─────────────────────────────────────────────
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['notification_id', 'member', 'title',
                  'message', 'type', 'is_read', 'created_at']


# ─── SETTING ─────────────────────────────────────────────────
class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Setting
        fields = ['setting_id', 'key', 'value', 'updated_at']