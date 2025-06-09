#!/bin/bash

# DentalERP Complete Deployment Script for cxrlos.fun
# This script orchestrates the entire deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# SSH connection details
SERVER_USER="rocky"
SERVER_IP="150.136.29.8"
SSH_KEY="/Users/carlosdelgado/Tec/proyecto final /ssh-key-2025-03-06.key"
DOMAIN="cxrlos.fun"

print_header() {
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}================================================${NC}"
}

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to execute commands on remote server
ssh_exec() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Function to copy files to server
scp_copy() {
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r "$1" "$SERVER_USER@$SERVER_IP:$2"
}

print_header "🚀 DentalERP Production Deployment to $DOMAIN"

echo -e "${BLUE}This script will deploy DentalERP to your Oracle Cloud server.${NC}"
echo -e "${BLUE}Server: $SERVER_IP${NC}"
echo -e "${BLUE}Domain: $DOMAIN${NC}"
echo

read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Step 1: Test connection
print_header "Step 1: Testing server connection"
if ssh_exec "echo 'Connection successful'"; then
    print_status "Server connection established"
else
    print_error "Cannot connect to server. Check SSH key and server status."
    exit 1
fi

# Step 2: Upload deployment scripts
print_header "Step 2: Uploading deployment scripts"
print_status "Copying deployment scripts to server..."
scp_copy "deploy_server_setup.sh" "/tmp/"
scp_copy "deploy_application.sh" "/tmp/"
scp_copy "setup_ssl.sh" "/tmp/"
scp_copy "backend/.env.production" "/tmp/"

ssh_exec "chmod +x /tmp/deploy_server_setup.sh /tmp/deploy_application.sh /tmp/setup_ssl.sh"
print_status "Scripts uploaded and made executable"

# Step 3: Run server setup
print_header "Step 3: Setting up server environment"
print_info "This will install and configure all required services..."
ssh_exec "sudo /tmp/deploy_server_setup.sh"
print_status "Server environment setup completed"

# Step 4: Upload application code
print_header "Step 4: Uploading application code"

# Create tar archive of backend
print_status "Creating backend archive..."
cd backend
tar -czf ../backend.tar.gz \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='db.sqlite3' \
    --exclude='media' \
    --exclude='staticfiles' \
    --exclude='django_cache' \
    --exclude='.env' \
    .
cd ..

# Create tar archive of frontend
print_status "Building and archiving frontend..."
cd frontend
npm install
npm run build
tar -czf ../frontend.tar.gz dist/
cd ..

# Upload archives
print_status "Uploading code archives..."
scp_copy "backend.tar.gz" "/tmp/"
scp_copy "frontend.tar.gz" "/tmp/"

# Extract on server
print_status "Extracting code on server..."
ssh_exec "
    sudo mkdir -p /opt/dental_erp/backend /opt/dental_erp/frontend
    sudo tar -xzf /tmp/backend.tar.gz -C /opt/dental_erp/backend/
    sudo tar -xzf /tmp/frontend.tar.gz -C /opt/dental_erp/frontend/
    sudo chown -R rocky:rocky /opt/dental_erp
    rm /tmp/backend.tar.gz /tmp/frontend.tar.gz
"

# Clean up local archives
rm -f backend.tar.gz frontend.tar.gz
print_status "Application code uploaded successfully"

# Step 5: Deploy application
print_header "Step 5: Deploying application"
ssh_exec "cd /opt/dental_erp && sudo /tmp/deploy_application.sh"
print_status "Application deployment completed"

# Step 6: Domain and DNS check
print_header "Step 6: Domain and DNS configuration"
print_info "Checking if domain is pointing to server..."

if nslookup $DOMAIN | grep -q "$SERVER_IP"; then
    print_status "Domain $DOMAIN is correctly pointing to $SERVER_IP"
    
    # Step 7: Setup SSL
    print_header "Step 7: Setting up SSL certificates"
    ssh_exec "sudo /tmp/setup_ssl.sh"
    print_status "SSL certificates configured"
    
    PROTOCOL="https"
else
    print_warning "Domain $DOMAIN is not pointing to $SERVER_IP"
    print_warning "Please update your DNS A record to point to $SERVER_IP"
    print_warning "Skipping SSL setup - you can run setup_ssl.sh later"
    
    PROTOCOL="http"
fi

# Step 8: Final tests
print_header "Step 8: Final testing"

print_status "Testing application endpoints..."
if ssh_exec "curl -f http://localhost:8000/api/ > /dev/null 2>&1"; then
    print_status "Backend API is responding"
else
    print_warning "Backend API test failed - check logs"
fi

if ssh_exec "curl -f http://localhost/index.html > /dev/null 2>&1"; then
    print_status "Frontend is accessible"
else
    print_warning "Frontend test failed - check Nginx configuration"
fi

# Step 9: Cleanup and final instructions
print_header "Step 9: Cleanup and final steps"

ssh_exec "rm -f /tmp/deploy_*.sh /tmp/setup_ssl.sh /tmp/.env.production"
print_status "Cleanup completed"

# Display final information
print_header "🎉 Deployment Complete!"

echo -e "${GREEN}DentalERP has been successfully deployed!${NC}"
echo
echo -e "${BLUE}Access your application at:${NC}"
echo -e "  🌐 ${PROTOCOL}://$DOMAIN"
echo -e "  🔧 ${PROTOCOL}://$DOMAIN/admin"
echo
echo -e "${BLUE}Admin credentials:${NC}"
echo -e "  👤 Username: admin"
echo -e "  🔑 Password: DentalERP2025!Admin"
echo
echo -e "${YELLOW}Important next steps:${NC}"
echo -e "  1. 📧 Configure email settings in /opt/dental_erp/backend/.env"
echo -e "  2. 🔒 Change admin password after first login"
echo -e "  3. 🧪 Test all functionality thoroughly"

if [[ "$PROTOCOL" == "http" ]]; then
    echo -e "  4. 🌐 Update DNS to point $DOMAIN to $SERVER_IP"
    echo -e "  5. 🔒 Run SSL setup: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'sudo /opt/dental_erp/setup_ssl.sh'"
fi

echo
echo -e "${BLUE}Useful commands:${NC}"
echo -e "  📊 Check status: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'sudo supervisorctl status'"
echo -e "  📝 View logs: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'tail -f /opt/dental_erp/logs/*.log'"
echo -e "  🔄 Restart app: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'sudo supervisorctl restart dental_erp'"

echo
print_status "Deployment completed successfully! 🚀"
