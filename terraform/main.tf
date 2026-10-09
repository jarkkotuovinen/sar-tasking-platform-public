# Main Terraform configuration for SAR Tasking Platform
# This provisions the complete AWS infrastructure

terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # Backend configuration should be provided via backend config file
    # terraform init -backend-config=environments/dev/backend.tfvars
    # bucket         = "sar-tasking-terraform-state"
    # key            = "sar-tasking/terraform.tfstate"
    # region         = "us-east-1"
    # encrypt        = true
    # dynamodb_table = "sar-tasking-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "SAR-Tasking-Platform"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = var.owner
      CostCenter  = var.cost_center
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# Local variables
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    Terraform   = "true"
  }

  # AZ configuration
  azs = slice(data.aws_availability_zones.available.names, 0, var.az_count)
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  name_prefix         = local.name_prefix
  vpc_cidr            = var.vpc_cidr
  availability_zones  = local.azs
  public_subnet_cidrs = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  enable_nat_gateway  = var.enable_nat_gateway
  single_nat_gateway  = var.single_nat_gateway

  tags = local.common_tags
}

# Security Groups Module
module "security" {
  source = "./modules/security"

  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  vpc_cidr    = var.vpc_cidr

  tags = local.common_tags
}

# Application Load Balancer Module
module "alb" {
  source = "./modules/alb"

  name_prefix        = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  security_group_ids = [module.security.alb_security_group_id]
  certificate_arn    = var.certificate_arn

  tags = local.common_tags
}

# RDS PostgreSQL Module
module "rds" {
  source = "./modules/rds"

  name_prefix           = local.name_prefix
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  security_group_ids    = [module.security.rds_security_group_id]

  # Database configuration
  instance_class        = var.rds_instance_class
  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  database_name         = var.database_name
  master_username       = var.database_username

  # High availability
  multi_az              = var.rds_multi_az
  backup_retention_period = var.rds_backup_retention_period

  # Performance
  performance_insights_enabled = var.rds_performance_insights_enabled

  tags = local.common_tags
}

# ECS Cluster and Services Module
module "ecs" {
  source = "./modules/ecs"

  name_prefix           = local.name_prefix
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  alb_target_group_arns = module.alb.target_group_arns

  # Security groups
  backend_security_group_id      = module.security.backend_security_group_id
  frontend_security_group_id     = module.security.frontend_security_group_id
  microservices_security_group_id = module.security.microservices_security_group_id

  # Database connection
  database_url          = module.rds.database_url
  database_secret_arn   = module.rds.database_secret_arn

  # Container images
  backend_image         = var.backend_image
  frontend_image        = var.frontend_image
  satellite_pass_image  = var.satellite_pass_image
  aoi_validator_image   = var.aoi_validator_image

  # Service configuration
  backend_cpu           = var.backend_cpu
  backend_memory        = var.backend_memory
  backend_desired_count = var.backend_desired_count

  frontend_cpu          = var.frontend_cpu
  frontend_memory       = var.frontend_memory
  frontend_desired_count = var.frontend_desired_count

  # Environment-specific settings
  environment           = var.environment
  jwt_secret_arn        = aws_secretsmanager_secret.jwt_secret.arn

  # Auto-scaling
  enable_autoscaling    = var.enable_autoscaling
  min_capacity          = var.min_capacity
  max_capacity          = var.max_capacity

  tags = local.common_tags
}

# CloudWatch Monitoring Module
module "monitoring" {
  source = "./modules/monitoring"

  name_prefix    = local.name_prefix
  environment    = var.environment

  # ECS resources
  ecs_cluster_name = module.ecs.cluster_name
  ecs_service_names = module.ecs.service_names

  # RDS resources
  rds_instance_id = module.rds.instance_id

  # ALB resources
  alb_arn_suffix = module.alb.alb_arn_suffix
  target_group_arn_suffixes = module.alb.target_group_arn_suffixes

  # Alerting
  alarm_email = var.alarm_email

  # Log retention
  log_retention_days = var.log_retention_days

  tags = local.common_tags
}

# Secrets Manager - JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name_prefix             = "${local.name_prefix}-jwt-"
  description             = "JWT secret for ${var.environment} environment"
  recovery_window_in_days = var.environment == "prod" ? 30 : 7

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-jwt-secret"
    }
  )
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = jsonencode({
    jwt_secret = var.jwt_secret
  })
}

# S3 Bucket for static assets (optional)
resource "aws_s3_bucket" "assets" {
  bucket_prefix = "${local.name_prefix}-assets-"

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-assets"
    }
  )
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# ECR Repositories
resource "aws_ecr_repository" "backend" {
  name                 = "${local.name_prefix}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = local.common_tags
}

resource "aws_ecr_repository" "frontend" {
  name                 = "${local.name_prefix}-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = local.common_tags
}

resource "aws_ecr_repository" "satellite_pass" {
  name                 = "${local.name_prefix}-satellite-pass"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = local.common_tags
}

resource "aws_ecr_repository" "aoi_validator" {
  name                 = "${local.name_prefix}-aoi-validator"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = local.common_tags
}

# ECR Lifecycle Policies
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}
