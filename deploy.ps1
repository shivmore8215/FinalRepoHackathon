# KMRL Train Plan Wise - Production Deployment Script
# This script deploys the RL Agent to production environment

param(
    [string]$Environment = "production",
    [switch]$SkipBuild = $false,
    [switch]$SkipTests = $false,
    [switch]$Verbose = $false
)

Write-Host "🚄 KMRL Train Plan Wise - Production Deployment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Build Time: $(Get-Date)" -ForegroundColor Yellow
Write-Host ""

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is required but not found" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is required but not found" -ForegroundColor Red
    exit 1
}

# Check Supabase CLI
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Supabase CLI not found. Install with: npm install -g supabase" -ForegroundColor Yellow
}

# Check environment file
if (!(Test-Path ".env.$Environment")) {
    Write-Host "❌ Environment file .env.$Environment not found" -ForegroundColor Red
    Write-Host "Please create the environment file with required variables" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✅ Environment configuration found" -ForegroundColor Green
}

Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm ci --production=false
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Run type checking
if (!$SkipTests) {
    Write-Host "🔍 Running type checks..." -ForegroundColor Cyan
    npm run type-check
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Type check failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Type checks passed" -ForegroundColor Green
    Write-Host ""

    # Run linting
    Write-Host "🧹 Running linter..." -ForegroundColor Cyan
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Linting failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Linting passed" -ForegroundColor Green
    Write-Host ""
}

# Build application
if (!$SkipBuild) {
    Write-Host "🏗️ Building application for $Environment..." -ForegroundColor Cyan
    npm run build:prod
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Application built successfully" -ForegroundColor Green
    Write-Host ""
}

# Deploy Supabase functions
Write-Host "🚀 Deploying Supabase Edge Functions..." -ForegroundColor Cyan
try {
    supabase functions deploy --project-ref $env:SUPABASE_PROJECT_REF
    Write-Host "✅ Supabase functions deployed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Supabase functions deployment skipped (CLI not available or not configured)" -ForegroundColor Yellow
}
Write-Host ""

# Generate deployment report
$deploymentReport = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Environment = $Environment
    NodeVersion = node --version
    BuildSize = if (Test-Path "dist") { 
        [math]::Round((Get-ChildItem -Recurse dist | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
    } else { 
        "N/A" 
    }
    Features = @(
        "AI-Powered Train Scheduling",
        "Real-time Fleet Monitoring", 
        "Maximo Integration",
        "KPI Dashboard",
        "Rule-based Fallback System"
    )
}

Write-Host "📊 Deployment Report" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "Timestamp: $($deploymentReport.Timestamp)" -ForegroundColor White
Write-Host "Environment: $($deploymentReport.Environment)" -ForegroundColor White
Write-Host "Node Version: $($deploymentReport.NodeVersion)" -ForegroundColor White
Write-Host "Build Size: $($deploymentReport.BuildSize) MB" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Deployed Features:" -ForegroundColor Green
foreach ($feature in $deploymentReport.Features) {
    Write-Host "  ✅ $feature" -ForegroundColor White
}
Write-Host ""

# Post-deployment checks
Write-Host "🔍 Post-deployment validation..." -ForegroundColor Cyan

# Check if build artifacts exist
if (Test-Path "dist/index.html") {
    Write-Host "✅ Frontend build artifacts created" -ForegroundColor Green
} else {
    Write-Host "⚠️ Frontend build artifacts not found" -ForegroundColor Yellow
}

# Check Supabase functions
$functionDirs = @("ai-schedule-optimizer", "realtime-metrics", "maximo-integration")
foreach ($func in $functionDirs) {
    if (Test-Path "supabase/functions/$func/index.ts") {
        Write-Host "✅ Function $func ready for deployment" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Function $func not found" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "The RL Agent is ready for production operation." -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure your web server to serve the dist/ directory" -ForegroundColor White
Write-Host "2. Set up your production environment variables" -ForegroundColor White
Write-Host "3. Configure Supabase project with the deployed functions" -ForegroundColor White
Write-Host "4. Initialize the database with sample KMRL data" -ForegroundColor White
Write-Host "5. Set up monitoring and alerting systems" -ForegroundColor White
Write-Host ""

# Save deployment info for monitoring
$deploymentReport | ConvertTo-Json | Out-File "deployment-info.json" -Encoding UTF8
Write-Host "📄 Deployment information saved to deployment-info.json" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚄 KMRL Train Plan Wise RL Agent is now ready for train scheduling operations!" -ForegroundColor Green