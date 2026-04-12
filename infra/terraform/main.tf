terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0"
}

provider "hcloud" {
  token = var.hcloud_token
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "hcloud_ssh_key" "default" {
  name       = "${var.server_name}-key"
  public_key = file(var.ssh_public_key_path)
}

resource "hcloud_firewall" "web" {
  name = "${var.server_name}-firewall"

  rule {
    description = "SSH"
    direction   = "in"
    protocol    = "tcp"
    port        = "22"
    source_ips  = ["0.0.0.0/0", "::/0"]
  }

  rule {
    description = "HTTP"
    direction   = "in"
    protocol    = "tcp"
    port        = "80"
    source_ips  = ["0.0.0.0/0", "::/0"]
  }

  rule {
    description = "HTTPS"
    direction   = "in"
    protocol    = "tcp"
    port        = "443"
    source_ips  = ["0.0.0.0/0", "::/0"]
  }
}

resource "hcloud_server" "app" {
  name        = var.server_name
  image       = "ubuntu-24.04"
  server_type = var.server_type
  location    = var.server_location
  ssh_keys    = [hcloud_ssh_key.default.id]

  firewall_ids = [hcloud_firewall.web.id]

  user_data = <<-EOF2
    #!/bin/bash
    set -e

    # System updates
    apt-get update && apt-get upgrade -y

    # Install Docker
    curl -fsSL https://get.docker.com | sh

    # Install Node.js 22
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs

    # Firewall
    ufw default deny incoming
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    yes | ufw enable

    # Fail2ban — auto-bans IPs after 5 failed SSH login attempts
    # Bans last 10 minutes by default, configurable in /etc/fail2ban/jail.local
    apt-get install -y fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban

    # Unattended upgrades — auto-installs security patches nightly
    apt-get install -y unattended-upgrades
    dpkg-reconfigure -f noninteractive unattended-upgrades

    # Create app directory
    mkdir -p /opt/codenames-mono
  EOF2

  labels = {
    app = var.server_name
    env = "production"
  }
}

resource "cloudflare_record" "app" {
  zone_id = var.cloudflare_zone_id
  name    = var.subdomain
  content = hcloud_server.app.ipv4_address
  type    = "A"
  ttl     = 1
  proxied = false
}
