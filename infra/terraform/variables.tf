variable "hcloud_token" {
  description = "Hetzner Cloud API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token with DNS edit permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for hbprojects.app"
  type        = string
}

variable "server_name" {
  description = "Name of the server"
  type        = string
  default     = "codenames"
}

variable "server_type" {
  description = "Hetzner server type (cx23 = 2 vCPU, 4GB RAM, 40GB)"
  type        = string
  default     = "cx23"
}

variable "server_location" {
  description = "Hetzner datacenter location"
  type        = string
  default     = "hel1"
}

variable "ssh_public_key_path" {
  description = "Path to your SSH public key"
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}

variable "subdomain" {
  description = "Subdomain for this app"
  type        = string
  default     = "codenames"
}
