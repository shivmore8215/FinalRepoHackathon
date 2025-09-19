# KMRL Train Plan Wise - Production Deployment Guide

## Overview

This guide covers deploying the RL Agent for KMRL (Kochi Metro Rail Limited) train scheduling operations. The system uses AI-powered scheduling with rule-based fallbacks to ensure reliable operation.

## 🚄 System Architecture

The RL Agent consists of:

1. **Frontend Dashboard** - React-based UI for operators
2. **AI Scheduler** - DeepSeek API integration with rule-based fallback
3. **Real-time Metrics** - Live fleet monitoring and KPIs
4. **Maximo Integration** - Maintenance work order synchronization
5. **Database** - PostgreSQL with Supabase

## 🚀 Quick Deployment

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project
- DeepSeek API key
- PowerShell (Windows) or bash (Linux/macOS)

### 1. Clone and Install

```bash
git clone <repository-url>
cd train-plan-wise
npm install
```

### 2. Environment Configuration

Copy `.env.production` and fill in your values:

```bash
cp .env.production .env.local
```

Required variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `DEEPSEEK_API_KEY` - AI model API key

### 3. Run Deployment Script

```powershell
# Windows
.\deploy.ps1

# Linux/macOS
chmod +x deploy.sh && ./deploy.sh
```

## 🔧 Manual Deployment Steps

### Step 1: Build Application

```bash
# Production build
npm run build:prod

# Development build (with debug info)
npm run build:dev
```

### Step 2: Deploy Supabase Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy ai-schedule-optimizer
```

### Step 3: Initialize Database

```sql
-- Run the seed script in your Supabase SQL editor
-- This creates tables and inserts sample KMRL data
```

### Step 4: Configure Web Server

Point your web server to serve the `dist/` directory. For nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/train-plan-wise/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to Supabase
    location /api/ {
        proxy_pass https://your-project.supabase.co/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## ⚙️ Configuration

### Fleet Parameters

Configure in Supabase `system_config` table:

```json
{
  "target_punctuality": 99.5,
  "min_fleet_availability": 90,
  "max_service_hours": 16,
  "min_maintenance_interval": 24
}
```

### AI Model Settings

```json
{
  "model": "deepseek-v1",
  "temperature": 0.2,
  "max_tokens": 4000,
  "timeout_seconds": 30
}
```

### Branding Priority Weights

```json
{
  "high_priority": 0.3,
  "medium_priority": 0.2,
  "low_priority": 0.1
}
```

## 🔍 Monitoring & Alerts

### Health Check Endpoints

- `/` - Frontend application
- `/api/rest/v1/trainsets` - Database connectivity
- `/functions/v1/realtime-metrics` - Live metrics
- `/functions/v1/ai-schedule-optimizer` - AI scheduler

### Key Metrics to Monitor

1. **Fleet Availability** - Target: >90%
2. **Punctuality** - Target: >99.5%
3. **AI Response Time** - Target: <30s
4. **System Uptime** - Target: >99.9%
5. **Critical Trainsets** - Alert: >2 trainsets

### Alerts Configuration

Set up alerts for:
- AI scheduler failures (switches to rule-based fallback)
- Database connection issues
- Fitness certificate expirations
- High-priority maintenance jobs

## 🛠️ Maintenance

### Daily Tasks
- Review AI scheduling accuracy
- Check critical alerts
- Monitor fleet availability

### Weekly Tasks
- Update trainset mileage data
- Review maintenance schedules
- Analyze KPI trends

### Monthly Tasks
- Review AI model performance
- Update system configurations
- Backup training data

## 🔒 Security

### Database Security
- Enable Row Level Security (RLS)
- Create service accounts with minimal permissions
- Regular credential rotation

### API Security
- Rate limiting on AI endpoints
- Input validation and sanitization
- Monitor for unusual API usage

### Network Security
- HTTPS only in production
- Firewall rules for database access
- VPN for administrative access

## 📈 Performance Optimization

### Frontend Optimization
- Code splitting implemented
- Lazy loading of components
- Service worker for caching
- Optimized bundle size (<2MB)

### Backend Optimization
- Database indexes on critical queries
- Connection pooling
- Edge function cold start mitigation
- Caching for frequently accessed data

### AI Model Optimization
- Request batching
- Response caching (5-minute TTL)
- Fallback mechanisms
- Performance monitoring

## 🚨 Troubleshooting

### Common Issues

1. **AI Scheduler Not Responding**
   - Check DeepSeek API key validity
   - Verify network connectivity
   - Review timeout settings
   - Fallback should activate automatically

2. **Database Connection Errors**
   - Check Supabase service status
   - Verify connection string
   - Review connection pool settings

3. **Missing Trainset Data**
   - Run database seed script
   - Check data import process
   - Verify Maximo integration

4. **Low Scheduling Accuracy**
   - Review training data quality
   - Check AI model parameters
   - Update fleet constraints

### Log Analysis

Important log locations:
- Supabase Edge Functions logs
- Browser console (development)
- Application performance monitoring
- Database query logs

## 🔄 Continuous Improvement

### AI Training Data Collection
- Actual vs predicted outcomes
- Operator feedback
- Performance metrics
- System adjustments

### Model Retraining
- Monthly model performance review
- Continuous learning from operations data
- A/B testing for improvements
- Version control for model updates

## 📞 Support

For production issues:
1. Check system health dashboard
2. Review error logs and alerts
3. Contact system administrators
4. Escalate to development team if needed

## 🎯 Success Criteria

The deployment is successful when:
- ✅ All trainsets visible in dashboard
- ✅ AI scheduling generates recommendations
- ✅ Real-time metrics updating
- ✅ Maximo integration functional
- ✅ KPI targets being met
- ✅ Alerts configured and tested
- ✅ Fallback systems working
- ✅ Performance within targets

---

**For KMRL Operations Team**: This system is designed to optimize train scheduling while maintaining safety and reliability. The AI provides recommendations, but operators have final authority over all scheduling decisions.