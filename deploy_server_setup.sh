#!/bin/bash

# DentalERP Production Deployment Script for Oracle Cloud Rocky Linux
# Domain: cxrlos.fun
# Server: 150.136.29.8

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting DentalERP Production Deployment for cxrlos.fun${NC}"

# Function to print status
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
if [[ ! -f /etc/rocky-release ]]; then
    print_error "This script should be run on the Rocky Linux server"
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo dnf update -y

# Install required packages
print_status "Installing required packages..."
sudo dnf install -y epel-release
sudo dnf install -y python3 python3-pip python3-devel postgresql postgresql-server postgresql-devel \
    nginx redis git curl wget unzip nodejs npm supervisor gcc make

# Start and enable services
print_status "Starting and enabling services..."
sudo systemctl enable --now postgresql redis nginx supervisor

# Initialize PostgreSQL if not already done
if [ ! -f /var/lib/pgsql/data/postgresql.conf ]; then
    print_status "Initializing PostgreSQL..."
    sudo postgresql-setup --initdb
    sudo systemctl start postgresql
fi

# Create database and user
print_status "Setting up database..."
sudo -u postgres psql -c "CREATE DATABASE dental_erp_db;" || echo "Database might already exist"
sudo -u postgres psql -c "CREATE USER dental_erp_user WITH PASSWORD 'DentalERP2025!SecurePass';" || echo "User might already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE dental_erp_db TO dental_erp_user;" || echo "Privileges might already be granted"
sudo -u postgres psql -c "ALTER USER dental_erp_user CREATEDB;" || echo "CREATEDB privilege might already be granted"

# Create application directory
APP_DIR="/opt/dental_erp"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown rocky:rocky $APP_DIR

# Clone or update repository (you'll need to upload the code)
if [ ! -d "$APP_DIR/backend" ]; then
    print_status "Creating project structure..."
    mkdir -p $APP_DIR/backend
    mkdir -p $APP_DIR/frontend
    mkdir -p $APP_DIR/logs
    mkdir -p $APP_DIR/static
    mkdir -p $APP_DIR/media
fi

# Set up Python virtual environment
print_status "Setting up Python virtual environment..."
cd $APP_DIR
python3 -m venv venv
source venv/bin/activate

# Create requirements.txt if not exists (will be replaced with actual file)
if [ ! -f "$APP_DIR/backend/requirements.txt" ]; then
    print_warning "requirements.txt not found. Creating placeholder..."
    cat > $APP_DIR/backend/requirements.txt << EOF
Django>=5.0.14
djangorestframework>=3.14.0
django-cors-headers>=4.3.1
django-filter>=23.3
Pillow>=10.0.1
psycopg2-binary>=2.9.7
gunicorn>=21.2.0
redis>=5.0.0
django-redis>=5.4.0
python-decouple>=3.8
python-dotenv>=1.0.0
djangorestframework-simplejwt>=5.3.0
django-mptt>=0.15.0
whitenoise>=6.6.0
django-compressor>=4.4
rcssmin>=1.1.1
rjsmin>=1.2.1
EOF
fi

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Create Gunicorn configuration
print_status "Creating Gunicorn configuration..."
cat > $APP_DIR/gunicorn.conf.py << EOF
# Gunicorn configuration for DentalERP Production

import multiprocessing

# Server socket
bind = "127.0.0.1:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 60
max_requests = 1000
max_requests_jitter = 50

# Restart workers after this many requests, to help prevent memory leaks
preload_app = True

# Logging
accesslog = "/opt/dental_erp/logs/gunicorn_access.log"
errorlog = "/opt/dental_erp/logs/gunicorn_error.log"
loglevel = "info"

# Process naming
proc_name = "dental_erp"

# Server mechanics
daemon = False
pidfile = "/opt/dental_erp/gunicorn.pid"
user = "rocky"
group = "rocky"
tmp_upload_dir = None

# SSL (will be handled by Nginx)
keyfile = None
certfile = None
EOF

# Create Supervisor configuration for Gunicorn
print_status "Creating Supervisor configuration..."
sudo cat > /etc/supervisord.d/dental_erp.ini << EOF
[program:dental_erp]
directory=/opt/dental_erp/backend
command=/opt/dental_erp/venv/bin/gunicorn dental_erp.wsgi:application -c /opt/dental_erp/gunicorn.conf.py
user=rocky
autostart=true
autorestart=true
stdout_logfile=/opt/dental_erp/logs/supervisor_stdout.log
stderr_logfile=/opt/dental_erp/logs/supervisor_stderr.log
environment=PATH="/opt/dental_erp/venv/bin"
EOF

# Create Nginx configuration
print_status "Creating Nginx configuration..."
sudo cat > /etc/nginx/conf.d/dental_erp.conf << EOF
# DentalERP Nginx Configuration for cxrlos.fun

upstream dental_erp_app {
    server 127.0.0.1:8000;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name cxrlos.fun www.cxrlos.fun;
    
    # Allow Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server configuration
server {
    listen 443 ssl http2;
    server_name cxrlos.fun www.cxrlos.fun;
    
    # SSL configuration (will be updated with Let's Encrypt certificates)
    ssl_certificate /etc/nginx/ssl/dental_erp.crt;
    ssl_certificate_key /etc/nginx/ssl/dental_erp.key;
    
    # SSL settings
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Client max body size for file uploads
    client_max_body_size 50M;
    
    # Frontend static files
    location / {
        root /opt/dental_erp/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Django static files
    location /static/ {
        alias /opt/dental_erp/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Serve compressed files if available
        location ~* \.(css|js)$ {
            gzip_static on;
        }
    }
    
    # Django media files
    location /media/ {
        alias /opt/dental_erp/backend/media/;
        expires 1M;
        add_header Cache-Control "public";
    }
    
    # Django API
    location /api/ {
        proxy_pass http://dental_erp_app;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Django admin
    location /admin/ {
        proxy_pass http://dental_erp_app;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }
}
EOF

# Create SSL directory and temporary certificates
print_status "Creating SSL directory and temporary certificates..."
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/dental_erp.key \
    -out /etc/nginx/ssl/dental_erp.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=cxrlos.fun"

# Configure firewall
print_status "Configuring firewall..."
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload

# Create log directories
print_status "Creating log directories..."
mkdir -p $APP_DIR/logs
touch $APP_DIR/logs/gunicorn_access.log
touch $APP_DIR/logs/gunicorn_error.log
touch $APP_DIR/logs/supervisor_stdout.log
touch $APP_DIR/logs/supervisor_stderr.log

print_status "Basic server setup completed!"
print_warning "Next steps:"
print_warning "1. Upload your Django code to $APP_DIR/backend/"
print_warning "2. Upload your React build to $APP_DIR/frontend/dist/"
print_warning "3. Copy .env.production to $APP_DIR/backend/.env"
print_warning "4. Run Django migrations"
print_warning "5. Collect static files"
print_warning "6. Set up SSL certificates with Let's Encrypt"
print_warning "7. Start services"

echo -e "${BLUE}Server setup script completed!${NC}"
