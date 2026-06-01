from django.db import models
from django.utils import timezone


class Admin(models.Model):
    admin_id      = models.AutoField(primary_key=True)
    name          = models.CharField(max_length=100)
    mobile        = models.CharField(max_length=15, unique=True)
    email         = models.CharField(max_length=100, unique=True)
    password_hash = models.CharField(max_length=255)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admins'

    def __str__(self):
        return self.name


class Member(models.Model):
    member_id         = models.AutoField(primary_key=True)
    full_name         = models.CharField(max_length=100)
    father_name       = models.CharField(max_length=100)
    mobile            = models.CharField(max_length=15, unique=True)
    email             = models.CharField(max_length=100, unique=True)
    password_hash     = models.CharField(max_length=255)
    address           = models.TextField()
    profile_photo     = models.ImageField(upload_to='profiles/', null=True, blank=True)
    aadhar_photo      = models.ImageField(upload_to='aadhar/', null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
    is_active         = models.BooleanField(default=True)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'members'

    def __str__(self):
        return self.full_name


class Seat(models.Model):
    seat_id       = models.AutoField(primary_key=True)
    seat_number   = models.IntegerField(unique=True)
    member        = models.OneToOneField(
                        Member, on_delete=models.SET_NULL,
                        null=True, blank=True,
                        related_name='seat')
    is_occupied   = models.BooleanField(default=False)
    assigned_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'seats'

    def __str__(self):
        return f"Seat {self.seat_number}"


class Membership(models.Model):
    STATUS_CHOICES = [
        ('active',    'Active'),
        ('expired',   'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    membership_id = models.AutoField(primary_key=True)
    member        = models.ForeignKey(Member, on_delete=models.CASCADE,
                                      related_name='memberships')
    start_date    = models.DateField()
    end_date      = models.DateField()
    fee_paid      = models.DecimalField(max_digits=8, decimal_places=2)
    status        = models.CharField(max_length=9, choices=STATUS_CHOICES,
                                     default='active')
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'memberships'

    def __str__(self):
        return f"{self.member.full_name} - {self.start_date} to {self.end_date}"

    @property
    def days_remaining(self):
        delta = self.end_date - timezone.now().date()
        return max(delta.days, 0)


class Payment(models.Model):
    MODE_CHOICES = [
        ('cash',   'Cash'),
        ('online', 'Online'),
    ]
    payment_id   = models.AutoField(primary_key=True)
    member       = models.ForeignKey(Member, on_delete=models.CASCADE,
                                     related_name='payments')
    membership   = models.ForeignKey(Membership, on_delete=models.CASCADE,
                                     related_name='payments')
    amount       = models.DecimalField(max_digits=8, decimal_places=2)
    payment_mode = models.CharField(max_length=6, choices=MODE_CHOICES,
                                    default='cash')
    payment_date = models.DateTimeField(auto_now_add=True)
    recorded_by  = models.ForeignKey(Admin, on_delete=models.RESTRICT,
                                     related_name='recorded_payments')
    notes        = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return f"{self.member.full_name} - ₹{self.amount}"


class Attendance(models.Model):
    attendance_id = models.AutoField(primary_key=True)
    member        = models.ForeignKey(Member, on_delete=models.CASCADE,
                                      related_name='attendance')
    date          = models.DateField()
    marked_by     = models.ForeignKey(Admin, on_delete=models.RESTRICT,
                                      related_name='marked_attendance')
    marked_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table  = 'attendance'
        unique_together = ('member', 'date')

    def __str__(self):
        return f"{self.member.full_name} - {self.date}"


class SeatChangeRequest(models.Model):
    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    request_id        = models.AutoField(primary_key=True)
    member            = models.ForeignKey(Member, on_delete=models.CASCADE,
                                          related_name='seat_requests')
    current_seat      = models.ForeignKey(Seat, on_delete=models.RESTRICT,
                                          related_name='change_requests_from')
    requested_seat    = models.ForeignKey(Seat, on_delete=models.RESTRICT,
                                          related_name='change_requests_to')
    status            = models.CharField(max_length=8, choices=STATUS_CHOICES,
                                         default='pending')
    requested_at      = models.DateTimeField(auto_now_add=True)
    resolved_at       = models.DateTimeField(null=True, blank=True)
    resolved_by       = models.ForeignKey(Admin, on_delete=models.SET_NULL,
                                          null=True, blank=True,
                                          related_name='resolved_requests')

    class Meta:
        db_table = 'seat_change_requests'

    def __str__(self):
        return f"{self.member.full_name}: Seat {self.current_seat.seat_number} → {self.requested_seat.seat_number}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('payment', 'Payment'),
        ('expiry',  'Expiry'),
        ('seat',    'Seat'),
        ('general', 'General'),
    ]
    notification_id = models.AutoField(primary_key=True)
    member          = models.ForeignKey(Member, on_delete=models.CASCADE,
                                        related_name='notifications')
    title           = models.CharField(max_length=100)
    message         = models.TextField()
    type            = models.CharField(max_length=7, choices=TYPE_CHOICES,
                                       default='general')
    is_read         = models.BooleanField(default=False)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'

    def __str__(self):
        return f"{self.member.full_name} - {self.title}"


class Setting(models.Model):
    setting_id = models.AutoField(primary_key=True)
    key        = models.CharField(max_length=50, unique=True)
    value      = models.CharField(max_length=100)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'settings'

    def __str__(self):
        return f"{self.key} = {self.value}"


class EmailOtp(models.Model):
    otp_id     = models.AutoField(primary_key=True)
    email      = models.CharField(max_length=100)
    otp_code   = models.CharField(max_length=6)
    is_used    = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'email_otp'

    def __str__(self):
        return f"{self.email} - {self.otp_code}"