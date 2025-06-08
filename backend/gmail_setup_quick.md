# Quick Gmail Setup for Testing

## Step 1: Enable 2FA and App Password
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App-Specific Password for "Mail"
4. Copy the 16-character password

## Step 2: Update .env file
```bash
# Change these lines in your .env file:
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
```

## Step 3: Test the setup
```bash
python manage.py test_emails --type=test --recipient=your-email@example.com
```

## Step 4: Test review notifications
```bash
# This will create sample data and send actual emails
python manage.py test_emails --type=new_review --create-sample --recipient=your-email@example.com
```

## Alternative: Keep Console Backend
If you want to continue with console backend (emails in terminal), 
your system is already production-ready for internal testing!
