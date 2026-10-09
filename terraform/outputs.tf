# Outputs for SAR Tasking Platform

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = module.vpc.private_subnet_ids
}

# Load Balancer Outputs
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = module.alb.alb_zone_id
}

output "alb_url" {
  description = "URL of the Application Load Balancer"
  value       = var.certificate_arn != "" ? "https://${module.alb.alb_dns_name}" : "http://${module.alb.alb_dns_name}"
}

# RDS Outputs
output "rds_endpoint" {
  description = "Endpoint of the RDS instance"
  value       = module.rds.endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "Name of the database"
  value       = module.rds.database_name
}

output "database_secret_arn" {
  description = "ARN of the database credentials secret"
  value       = module.rds.database_secret_arn
  sensitive   = true
}

# ECS Outputs
output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = module.ecs.cluster_arn
}

output "backend_service_name" {
  description = "Name of the backend ECS service"
  value       = module.ecs.backend_service_name
}

output "frontend_service_name" {
  description = "Name of the frontend ECS service"
  value       = module.ecs.frontend_service_name
}

# ECR Outputs
output "ecr_repository_urls" {
  description = "URLs of ECR repositories"
  value = {
    backend        = aws_ecr_repository.backend.repository_url
    frontend       = aws_ecr_repository.frontend.repository_url
    satellite_pass = aws_ecr_repository.satellite_pass.repository_url
    aoi_validator  = aws_ecr_repository.aoi_validator.repository_url
  }
}

# Security Outputs
output "jwt_secret_arn" {
  description = "ARN of JWT secret in Secrets Manager"
  value       = aws_secretsmanager_secret.jwt_secret.arn
  sensitive   = true
}

# S3 Outputs
output "assets_bucket_name" {
  description = "Name of the S3 bucket for assets"
  value       = aws_s3_bucket.assets.id
}

output "assets_bucket_arn" {
  description = "ARN of the S3 bucket for assets"
  value       = aws_s3_bucket.assets.arn
}

# Monitoring Outputs
output "cloudwatch_log_groups" {
  description = "CloudWatch log group names"
  value       = module.monitoring.log_group_names
}

output "sns_topic_arn" {
  description = "ARN of SNS topic for alarms"
  value       = module.monitoring.sns_topic_arn
}

# Connection Information
output "connection_info" {
  description = "Connection information for the deployed application"
  value = {
    application_url = var.certificate_arn != "" ? "https://${module.alb.alb_dns_name}" : "http://${module.alb.alb_dns_name}"
    api_endpoint    = "${var.certificate_arn != "" ? "https" : "http"}://${module.alb.alb_dns_name}/api"
    environment     = var.environment
    region          = var.aws_region
  }
}

# Deployment Commands
output "deployment_commands" {
  description = "Useful commands for deployment"
  value = {
    update_backend = "aws ecs update-service --cluster ${module.ecs.cluster_name} --service ${module.ecs.backend_service_name} --force-new-deployment"
    update_frontend = "aws ecs update-service --cluster ${module.ecs.cluster_name} --service ${module.ecs.frontend_service_name} --force-new-deployment"
    view_logs_backend = "aws logs tail /ecs/${local.name_prefix}-backend --follow"
    view_logs_frontend = "aws logs tail /ecs/${local.name_prefix}-frontend --follow"
    connect_to_db = "psql -h ${module.rds.endpoint} -U ${var.database_username} -d ${var.database_name}"
  }
}

# Cost Estimation
output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown (approximate)"
  value = {
    note = "Costs are approximate and vary based on usage"
    ecs_fargate = "~$${(var.backend_desired_count + var.frontend_desired_count) * 30 * 24 * 0.04} (based on task count and size)"
    rds = var.rds_multi_az ? "~$100-200 (Multi-AZ)" : "~$50-100 (Single-AZ)"
    alb = "~$25-30"
    nat_gateway = var.enable_nat_gateway && !var.single_nat_gateway ? "~$65 (per NAT Gateway)" : "~$35 (single NAT Gateway)"
    cloudwatch = "~$10-20"
    s3 = "~$5-10"
    data_transfer = "~$10-50 (varies by traffic)"
    total_estimate = "Check AWS Cost Explorer for actual costs"
  }
}
