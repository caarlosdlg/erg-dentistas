#!/bin/bash

# SSL Certificate Setup with Let's Encrypt for cxrlos.fun

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔒 Setting up SSL certificates for cxrlos.fun${NC}"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if domain is pointing to server
print_status "Checking domain resolution..."
if ! nslookup cxrlos.fun | grep -q "150.136.29.8"; then
    print_warning "Domain cxrlos.fun might not be pointing to this server (150.136.29.8)"
    print_warning "Make sure your DNS A record is set correctly before continuing"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install Certbot
print_status "Installing Certbot..."
sudo dnf install -y python3-certbot python3-certbot-nginx

# Create webroot directory for Let's Encrypt validation
print_status "Creating webroot directory..."
sudo mkdir -p /var/www/html
sudo chown -R nginx:nginx /var/www/html

# Temporarily modify Nginx config for Let's Encrypt validation
print_status "Preparing Nginx for certificate validation..."
sudo cat > /etc/nginx/conf.d/temp_letsencrypt.conf << EOF
server {
    listen 80;
    server_name cxrlos.fun www.cxrlos.fun;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

# Test and reload Nginx
print_status "Testing Nginx configuration..."
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
print_status "Obtaining SSL certificate from Let's Encrypt..."
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/html \
    --email admin@cxrlos.fun \
    --agree-tos \
    --no-eff-email \
    -d cxrlos.fun \
    -d www.cxrlos.fun

# Update Nginx configuration with real certificates
print_status "Updating Nginx configuration with SSL certificates..."
sudo cat > /etc/nginx/conf.d/dental_erp.conf << EOF
# DentalERP Nginx Configuration for cxrlos.fun with SSL

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
    
    # SSL configuration with Let's Encrypt certificates
    ssl_certificate /etc/letsencrypt/live/cxrlos.fun/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cxrlos.fun/privkey.pem;
    
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

# Remove temporary configuration
sudo rm -f /etc/nginx/conf.d/temp_letsencrypt.conf

# Test and reload Nginx
print_status "Testing updated Nginx configuration..."
sudo nginx -t
sudo systemctl reload nginx

# Set up automatic certificate renewal
print_status "Setting up automatic certificate renewal..."
sudo crontab -l > /tmp/crontab_backup 2>/dev/null || true
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'") | sudo crontab -

# Test SSL configuration
print_status "Testing SSL configuration..."
sleep 5
curl -I https://cxrlos.fun || print_warning "SSL test failed - check configuration"

print_status "SSL setup completed!"
print_status "Your site should now be available at https://cxrlos.fun"
print_warning "Certificate will auto-renew via cron job"

echo -e "${GREEN}🔒 SSL certificates successfully configured!${NC}"
