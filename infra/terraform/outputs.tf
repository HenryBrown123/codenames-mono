output "server_ip" {
  description = "Public IP of the server"
  value       = hcloud_server.app.ipv4_address
}

output "server_status" {
  description = "Server status"
  value       = hcloud_server.app.status
}

output "app_url" {
  description = "Application URL"
  value       = "https://${var.subdomain}.hbprojects.app"
}

output "ssh_command" {
  description = "SSH into the server"
  value       = "ssh root@${hcloud_server.app.ipv4_address}"
}
