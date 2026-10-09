# AWS Infrastructure - Terraform

Complete Infrastructure as Code for deploying the SAR Tasking Platform to AWS.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      AWS Cloud                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  VPC (10.0.0.0/16)                │  │
│  │                                                   │  │
│  │  ┌─────────────────┐  ┌─────────────────┐        │  │
│  │  │  Public Subnet  │  │  Public Subnet  │        │  │
│  │  │   (AZ-1)        │  │   (AZ-2)        │        │  │
│  │  │                 │  │                 │        │  │
│  │  │  ┌───────────┐  │  │  ┌───────────┐  │        │  │
│  │  │  │    ALB    │  │  │  │    NAT    │  │        │  │
│  │  │  └─────┬─────┘  │  │  │  Gateway  │  │        │  │
│  │  └────────┼────────┘  └──┴─────┬─────┴──┘        │  │
│  │           │                     │                 │  │
│  │  ┌────────┼─────────────────────┼────────┐        │  │
│  │  │ Private Subnet (AZ-1)        │        │        │  │
│  │  │  ┌──────────┐ ┌─────────┐   │        │        │  │
│  │  │  │ Backend  │ │  Go     │   │        │        │  │
│  │  │  │ ECS Task │ │ Service │   │        │        │  │
│  │  │  └──────────┘ └─────────┘   │        │        │  │
│  │  └──────────────────────────────┘        │        │  │
│  │  ┌──────────────────────────────────────┐        │  │
│  │  │ Private Subnet (AZ-2)                 │        │  │
│  │  │  ┌──────────┐ ┌─────────┐            │        │  │
│  │  │  │ Frontend │ │ Python  │            │        │  │
│  │  │  │ ECS Task │ │ Service │            │        │  │
│  │  │  └──────────┘ └─────────┘            │        │  │
│  │  │  ┌──────────────┐                    │        │  │
│  │  │  │  RDS (Multi  │                    │        │  │
│  │  │  │  -AZ)        │                    │        │  │
│  │  │  └──────────────┘                    │        │  │
│  │  └──────────────────────────────────────┘        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Features

- ✅ **Multi-AZ High Availability**
- ✅ **Auto-scaling ECS Fargate Services**
- ✅ **RDS PostgreSQL with Automated Backups**
- ✅ **Application Load Balancer with SSL/TLS**
- ✅ **VPC with Public/Private Subnets**
- ✅ **NAT Gateway for Outbound Internet**
- ✅ **CloudWatch Monitoring & Alarms**
- ✅ **ECR for Container Images**
- ✅ **Secrets Manager for Credentials**
- ✅ **S3 for Static Assets**
- ✅ **IAM Roles with Least Privilege**
- ✅ **Cost-Optimized Architecture**

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Terraform** >= 1.6
3. **AWS CLI** configured
4. **S3 Bucket** for Terraform state (recommended)
5. **DynamoDB Table** for state locking (recommended)

## Quick Start

### 1. Setup Terraform Backend

```bash
# Create S3 bucket for state
aws s3 mb s3://sar-tasking-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket sar-tasking-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for locking
aws dynamodb create-table \
  --table-name sar-tasking-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2. Configure Environment

```bash
cd terraform/environments/dev

# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars

# Create backend configuration
cat > backend.tfvars <<EOF
bucket         = "sar-tasking-terraform-state"
key            = "sar-tasking/dev/terraform.tfstate"
region         = "us-east-1"
encrypt        = true
dynamodb_table = "sar-tasking-terraform-locks"
EOF
```

### 3. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init -backend-config=backend.tfvars

# Review plan
terraform plan -var-file=terraform.tfvars

# Apply changes
terraform apply -var-file=terraform.tfvars
```

### 4. Access Outputs

```bash
# Get application URL
terraform output alb_url

# Get all outputs
terraform output
```

## Module Structure

```
terraform/
├── main.tf                 # Root configuration
├── variables.tf            # Input variables
├── outputs.tf             # Output values
├── modules/
│   ├── vpc/               # VPC, subnets, NAT
│   ├── security/          # Security groups
│   ├── alb/               # Load balancer
│   ├── rds/               # PostgreSQL database
│   ├── ecs/               # ECS cluster & services
│   └── monitoring/        # CloudWatch, alarms
└── environments/
    ├── dev/               # Development config
    ├── staging/           # Staging config
    └── prod/              # Production config
```

## Modules

### VPC Module

Creates network infrastructure:
- VPC with DNS support
- Public subnets (2 AZs)
- Private subnets (2 AZs)
- Internet Gateway
- NAT Gateway(s)
- Route tables
- VPC Flow Logs

**Inputs:**
- `vpc_cidr` - VPC CIDR block
- `public_subnet_cidrs` - Public subnet CIDRs
- `private_subnet_cidrs` - Private subnet CIDRs
- `single_nat_gateway` - Use one NAT vs one per AZ

### Security Module

Manages security groups:
- ALB security group (80, 443)
- Backend security group
- Frontend security group
- Microservices security group
- RDS security group (PostgreSQL 5432)

### RDS Module

PostgreSQL database:
- Multi-AZ for high availability
- Automated backups
- Encryption at rest
- Performance Insights
- Secrets Manager integration
- Parameter groups
- Subnet groups

### ECS Module

Container orchestration:
- ECS Cluster
- Task definitions
- Services with auto-scaling
- IAM roles
- CloudWatch logs
- Service discovery
- Load balancer integration

### ALB Module

Load balancing:
- Application Load Balancer
- Target groups
- Health checks
- SSL/TLS certificates
- HTTP to HTTPS redirect

### Monitoring Module

Observability:
- CloudWatch log groups
- Metric alarms
- SNS topics
- Dashboards
- Log retention

## Environment Configuration

### Development

```hcl
# Minimal resources for development
single_nat_gateway = true
rds_multi_az = false
rds_instance_class = "db.t3.micro"
backend_desired_count = 1
enable_autoscaling = false
enable_spot_instances = true
```

**Est. Monthly Cost:** ~$150-200

### Staging

```hcl
# Production-like configuration
single_nat_gateway = false
rds_multi_az = true
rds_instance_class = "db.t3.small"
backend_desired_count = 2
enable_autoscaling = true
enable_spot_instances = false
```

**Est. Monthly Cost:** ~$300-400

### Production

```hcl
# Full high-availability setup
single_nat_gateway = false
rds_multi_az = true
rds_instance_class = "db.r5.large"
backend_desired_count = 3
enable_autoscaling = true
enable_spot_instances = false
```

**Est. Monthly Cost:** ~$600-800

## Security Best Practices

- ✅ All resources in private subnets except ALB
- ✅ Security groups with minimal required access
- ✅ Database credentials in Secrets Manager
- ✅ Encryption at rest for RDS and S3
- ✅ TLS/SSL for all external connections
- ✅ IAM roles with least privilege
- ✅ VPC Flow Logs enabled
- ✅ Automated security group rules
- ✅ No hardcoded credentials

## Cost Optimization

### Development
- Single NAT Gateway
- db.t3.micro RDS instance
- Minimal ECS tasks
- Fargate Spot pricing
- Short log retention

### Production
- Reserved Instances for RDS
- Savings Plans for Fargate
- S3 Intelligent-Tiering
- CloudWatch log optimization
- Auto-scaling based on demand

### Cost Monitoring

```bash
# Enable Cost Allocation Tags
aws ce update-cost-allocation-tags-status \
  --cost-allocation-tags-status \
  TagKey=Project,Status=Active \
  TagKey=Environment,Status=Active

# View costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=TAG,Key=Project
```

## Operations

### Updating Services

```bash
# Update backend service
terraform apply -var-file=terraform.tfvars -target=module.ecs

# Or use AWS CLI
aws ecs update-service \
  --cluster sar-tasking-dev-cluster \
  --service sar-tasking-dev-backend \
  --force-new-deployment
```

### Database Migrations

```bash
# Run migrations via ECS task
aws ecs run-task \
  --cluster sar-tasking-dev-cluster \
  --task-definition sar-tasking-dev-backend \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}" \
  --overrides '{"containerOverrides":[{"name":"backend","command":["npx","prisma","migrate","deploy"]}]}'
```

### Viewing Logs

```bash
# Backend logs
aws logs tail /ecs/sar-tasking-dev-backend --follow

# Frontend logs
aws logs tail /ecs/sar-tasking-dev-frontend --follow

# RDS logs
aws rds describe-db-log-files \
  --db-instance-identifier sar-tasking-dev
```

### Scaling

```bash
# Manual scaling
aws ecs update-service \
  --cluster sar-tasking-dev-cluster \
  --service sar-tasking-dev-backend \
  --desired-count 4

# Update auto-scaling
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/sar-tasking-dev-cluster/sar-tasking-dev-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration \
  'TargetValue=70,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization}'
```

## Disaster Recovery

### Backup Strategy

- **RDS:** Automated daily backups (7-30 days retention)
- **S3:** Versioning enabled
- **ECS:** Task definitions versioned
- **Terraform State:** S3 versioning enabled

### Recovery Procedures

```bash
# Restore RDS from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier sar-tasking-restored \
  --db-snapshot-identifier sar-tasking-snapshot-xxx

# Rollback ECS service
aws ecs update-service \
  --cluster sar-tasking-dev-cluster \
  --service sar-tasking-dev-backend \
  --task-definition sar-tasking-dev-backend:previous-revision
```

## Monitoring & Alerts

### CloudWatch Alarms

- High CPU usage (>80%)
- High memory usage (>80%)
- RDS connection count
- ALB target health
- 4xx/5xx error rates

### Dashboards

Access CloudWatch dashboard:
```bash
# Get dashboard URL
terraform output -json | jq -r '.connection_info.value'
```

## Troubleshooting

### Common Issues

**Issue:** Task fails to start
```bash
# Check task logs
aws ecs describe-tasks \
  --cluster sar-tasking-dev-cluster \
  --tasks TASK_ID
```

**Issue:** Database connection fails
```bash
# Verify security group
aws ec2 describe-security-groups \
  --group-ids sg-xxx

# Test connection from ECS task
aws ecs execute-command \
  --cluster sar-tasking-dev-cluster \
  --task TASK_ID \
  --container backend \
  --interactive \
  --command "/bin/sh"
```

**Issue:** High costs
```bash
# Analyze costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

## Cleanup

```bash
# Destroy all resources
terraform destroy -var-file=terraform.tfvars

# Or destroy specific resources
terraform destroy -target=module.ecs -var-file=terraform.tfvars
```

**Warning:** This will delete all data including databases!

## Additional Resources

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
