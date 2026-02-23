# Production User Credentials

**⚠️ IMPORTANT: Keep this file secure and delete after distributing credentials**

## User Accounts Created

### 👑 Admin Users

#### 1. المهندسة ايه (Engineer Aya)
- **Email**: `ayayounes139@icloud.com`
- **PIN**: `1234` (TEMPORARY - Must change on first login)
- **WhatsApp**: 01008015126
- **Role**: Admin (Full access to all features)

#### 2. الدكتور احمد (Dr. Ahmed)
- **Email**: `ahmednassar701@gmail.com`
- **PIN**: `1234` (TEMPORARY - Must change on first login)
- **WhatsApp**: Contact directly
- **Role**: Admin (Full access to all features)

---

### 📊 Accountant Users (محاسب)

#### 3. محاسب (Accountant)
- **Email**: `eliteeee1010@gmail.com`
- **PIN**: `1234` (TEMPORARY - Must change on first login)
- **WhatsApp**: 01040064317
- **Role**: Accountant (Can edit accounting data, cannot manage users)

#### 4. محاسب عبدالرحمن (Accountant Abdelrahman)
- **Email**: `acc.abdelrahman.saberr@gmail.com`
- **PIN**: `1234` (TEMPORARY - Must change on first login)
- **WhatsApp**: 01095996360
- **Role**: Accountant (Can edit accounting data, cannot manage users)

---

### 👤 Regular User

#### 5. مدير المشتريات (Purchase Manager)
- **Email**: `samhmoha@gmail.com`
- **PIN**: `1234` (TEMPORARY - Must change on first login)
- **WhatsApp**: 01128185572
- **Role**: User (View only, can create purchase orders and mark supply done)

---

## Role Permissions Summary

### Admin (مدير)
- ✅ Full access to all features
- ✅ Create, edit, and delete journal entries
- ✅ Create, edit, and delete accounts
- ✅ Manage users (create, edit, delete)
- ✅ Approve/reject purchase orders
- ✅ Export and print all reports

### Accountant (محاسب)
- ✅ View all pages and data
- ✅ Create, edit, and delete journal entries
- ✅ Create, edit, and delete accounts
- ✅ Approve/reject purchase orders
- ✅ Export and print all reports
- ❌ Cannot manage users

### User (مستخدم)
- ✅ View all pages and data
- ✅ Create purchase orders
- ✅ Mark purchase orders as "Supply Done" when approved
- ✅ Export and print reports (read-only)
- ❌ Cannot create, edit, or delete journal entries
- ❌ Cannot create, edit, or delete accounts
- ❌ Cannot approve/reject purchase orders

---

## WhatsApp Messages Template

### For Admin Users:
```
مرحبا [الاسم]،

تم إنشاء حسابك في نظام المحاسبة:
البريد الإلكتروني: [email]
كلمة المرور المؤقتة: 1234

يرجى تغيير كلمة المرور عند أول تسجيل دخول.

رابط النظام: [your-production-url]

شكرا
```

### For Accountant Users:
```
مرحبا [الاسم]،

تم إنشاء حسابك في نظام المحاسبة (محاسب):
البريد الإلكتروني: [email]
كلمة المرور المؤقتة: 1234

يمكنك:
- إنشاء وتعديل القيود اليومية
- إدارة الحسابات
- الموافقة على أوامر الشراء
- تصدير التقارير

يرجى تغيير كلمة المرور عند أول تسجيل دخول.

رابط النظام: [your-production-url]

شكرا
```

### For Purchase Manager:
```
مرحبا [الاسم]،

تم إنشاء حسابك في نظام المحاسبة (مدير المشتريات):
البريد الإلكتروني: [email]
كلمة المرور المؤقتة: 1234

يمكنك:
- إنشاء أوامر الشراء
- وضع علامة "تم التوريد" على أوامر الشراء المعتمدة
- عرض جميع التقارير

يرجى تغيير كلمة المرور عند أول تسجيل دخول.

رابط النظام: [your-production-url]

شكرا
```

---

## Security Notes

1. **All PINs are temporary** - Users must change them on first login
2. **Send credentials via WhatsApp** - Use the numbers provided
3. **Delete this file** - After distributing credentials, delete this file
4. **First login** - Users should change their PIN immediately
5. **Password policy** - Consider enforcing minimum PIN length (4+ digits)

---

## Next Steps

1. ✅ Run `scripts/29-create-production-users.sql` in Supabase
2. ✅ Verify all users were created successfully
3. ✅ Send credentials via WhatsApp to each user
4. ✅ Instruct users to change PIN on first login
5. ✅ Delete this file after distribution

---

**Created**: [Date]
**Last Updated**: [Date]





