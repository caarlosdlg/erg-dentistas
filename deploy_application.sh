#!/bin/bash

# DentalERP Code Deployment Script
# Run this script AFTER the server setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/opt/dental_erp"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo -e "${BLUE}🚀 Deploying DentalERP Application Code${NC}"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're on the server
if [[ ! -d "$APP_DIR" ]]; then
    print_error "Application directory not found. Run deploy_server_setup.sh first"
    exit 1
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source $APP_DIR/venv/bin/activate

# Stop services during deployment
print_status "Stopping services for deployment..."
sudo supervisorctl stop dental_erp || echo "Service not running"

# Copy environment file
print_status "Setting up environment variables..."
if [ -f ".env.production" ]; then
    cp .env.production $BACKEND_DIR/.env
else
    print_error ".env.production file not found"
    exit 1
fi

# Install/update Python dependencies
print_status "Installing Python dependencies..."
cd $BACKEND_DIR
pip install -r requirements.txt

# Generate secret key if needed
print_status "Generating secure secret key..."
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" $BACKEND_DIR/.env

# Run Django setup commands
print_status "Running Django migrations..."
python manage.py migrate --noinput

print_status "Creating superuser if needed..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@cxrlos.fun', 'DentalERP2025!Admin')
    print('Superuser created: admin / DentalERP2025!Admin')
else:
    print('Superuser already exists')
EOF

print_status "Collecting static files..."
python manage.py collectstatic --noinput --clear

print_status "Compressing static files..."
python manage.py compress --force

# Set permissions
print_status "Setting file permissions..."
sudo chown -R rocky:rocky $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod -R 644 $APP_DIR/logs/*.log

# Test Django configuration
print_status "Testing Django configuration..."
python manage.py check --deploy

# Build frontend if source is available
if [ -d "../frontend" ]; then
    print_status "Building frontend..."
    cd ../frontend
    
    # Install Node.js dependencies
    npm install
    
    # Update API URL for production
    cat > .env.production << EOF
VITE_API_URL=https://cxrlos.fun
VITE_GOOGLE_CLIENT_ID=702715005077-llvs9p0mt3j9mhnmda2loteapg27uqf1.apps.googleusercontent.com
EOF
    
    # Build for production
    npm run build
    
    # Copy build to production directory
    rm -rf $FRONTEND_DIR/dist
    mkdir -p $FRONTEND_DIR
    cp -r dist $FRONTEND_DIR/
    
    print_status "Frontend built and deployed"
fi

# Reload supervisor configuration
print_status "Reloading supervisor configuration..."
sudo supervisorctl reread
sudo supervisorctl update

# Start services
print_status "Starting services..."
sudo supervisorctl start dental_erp
sudo systemctl reload nginx

# Test if services are running
print_status "Checking service status..."
sudo supervisorctl status dental_erp
sudo systemctl status nginx --no-pager -l

# Test application
print_status "Testing application..."
curl -f http://localhost:8000/api/ || print_warning "API test failed - check logs"

print_status "Deployment completed!"
print_warning "Remember to:"
print_warning "1. Set up SSL certificates with Let's Encrypt"
print_warning "2. Configure your domain DNS to point to 150.136.29.8"
print_warning "3. Update email settings in .env"
print_warning "4. Test the application thoroughly"

echo -e "${GREEN}🎉 DentalERP is now deployed at https://cxrlos.fun${NC}"
