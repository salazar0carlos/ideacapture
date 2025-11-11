# IdeaCapture Deployment Guide

Complete guide to deploying IdeaCapture to production. Choose your preferred platform and follow the step-by-step instructions.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deploy to Vercel (Recommended)](#deploy-to-vercel-recommended)
3. [Deploy to Netlify](#deploy-to-netlify)
4. [Deploy to AWS (Advanced)](#deploy-to-aws-advanced)
5. [Custom Server Deployment](#custom-server-deployment)
6. [Environment Variables](#environment-variables-for-production)
7. [Custom Domain Setup](#custom-domain-setup)
8. [SSL Configuration](#ssl-configuration)
9. [Performance Optimization](#performance-optimization)
10. [Monitoring and Logging](#monitoring-and-logging)
11. [Troubleshooting](#deployment-troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure you have completed:

### Required

- [ ] Application builds successfully (`npm run build`)
- [ ] All tests pass (if you have tests)
- [ ] Environment variables documented
- [ ] Database schema executed in production Supabase project
- [ ] Supabase project created for production (separate from dev)
- [ ] Anthropic API key obtained
- [ ] Code pushed to Git repository (GitHub, GitLab, or Bitbucket)

### Recommended

- [ ] Custom domain purchased (optional but professional)
- [ ] Error tracking service set up (Sentry, etc.)
- [ ] Analytics configured (optional)
- [ ] Backup strategy for database
- [ ] Budget alerts set for Anthropic API
- [ ] README and documentation complete

### Security

- [ ] `.env.local` not committed to git (check `.gitignore`)
- [ ] Supabase RLS policies enabled and tested
- [ ] Strong passwords used for all services
- [ ] API keys secured (never in client-side code)
- [ ] CORS configured if needed

---

## Deploy to Vercel (Recommended)

Vercel is the easiest and recommended platform for Next.js applications.

### Why Vercel?

- Made by the creators of Next.js
- Zero configuration for Next.js
- Automatic HTTPS and CDN
- Generous free tier
- Excellent performance
- Built-in analytics
- One-click rollbacks

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended) or email
4. Verify your email

### Step 2: Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/ideacapture.git
git branch -M main
git push -u origin main
```

### Step 3: Import Project

1. In Vercel dashboard, click "Add New" → "Project"
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Click "Import"

### Step 4: Configure Environment Variables

Before deploying, add your environment variables:

1. In the import screen, expand "Environment Variables"
2. Add three variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
ANTHROPIC_API_KEY = sk-ant-your_key
```

3. Make sure to use your **production** Supabase project (not dev)

### Step 5: Deploy

1. Click "Deploy"
2. Wait 1-3 minutes for build to complete
3. Visit your deployed site at `your-project.vercel.app`

### Step 6: Test Deployment

- [ ] Site loads correctly
- [ ] Sign up works
- [ ] Login works
- [ ] Voice recording works (must use HTTPS)
- [ ] AI refinement works
- [ ] AI validation works
- [ ] PWA installs correctly

### Continuous Deployment

Every push to `main` branch will automatically deploy:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys!
```

### Preview Deployments

Every pull request gets a preview URL automatically.

### Vercel CLI (Optional)

Install for local testing:

```bash
npm install -g vercel
vercel login
vercel
```

---

## Deploy to Netlify

Alternative to Vercel, also excellent for Next.js.

### Why Netlify?

- Easy to use
- Generous free tier
- Excellent performance
- Built-in forms and functions
- Strong community

### Step 1: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Click "Sign up"
3. Sign up with GitHub (recommended)

### Step 2: Create netlify.toml

In your project root, create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Step 3: Install Netlify Plugin

```bash
npm install -D @netlify/plugin-nextjs
```

Commit changes:

```bash
git add netlify.toml package.json package-lock.json
git commit -m "Add Netlify configuration"
git push
```

### Step 4: Import Project

1. In Netlify dashboard, click "Add new site" → "Import an existing project"
2. Choose GitHub
3. Select your repository
4. Netlify auto-detects settings

### Step 5: Configure Build Settings

Verify these settings:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Base directory**: (leave empty)

### Step 6: Add Environment Variables

1. Click "Show advanced"
2. Click "New variable" for each:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
ANTHROPIC_API_KEY = sk-ant-your_key
```

### Step 7: Deploy

1. Click "Deploy site"
2. Wait 2-4 minutes
3. Visit your site at `random-name.netlify.app`

### Continuous Deployment

Automatic deployments on every push to main branch.

---

## Deploy to AWS (Advanced)

For those who need AWS infrastructure.

### Option 1: AWS Amplify

Simplest AWS option:

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
5. Add environment variables
6. Deploy

### Option 2: AWS EC2 + Docker

More control, more complex:

1. **Create EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.small or larger
   - Security group: Allow HTTP (80), HTTPS (443)

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm nginx
   ```

3. **Clone and Build**
   ```bash
   git clone https://github.com/yourusername/ideacapture.git
   cd ideacapture
   npm install
   npm run build
   ```

4. **Run with PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "ideacapture" -- start
   pm2 startup
   pm2 save
   ```

5. **Configure Nginx**
   See [Custom Server Deployment](#custom-server-deployment)

---

## Custom Server Deployment

For VPS, DigitalOcean, Linode, etc.

### Prerequisites

- Ubuntu 22.04 LTS (or similar)
- Root or sudo access
- Domain name (optional)

### Step 1: Install Node.js

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Step 2: Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/ideacapture
sudo chown $USER:$USER /var/www/ideacapture

# Clone
cd /var/www/ideacapture
git clone https://github.com/yourusername/ideacapture.git .
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Create Environment File

```bash
nano .env.local
```

Add your variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=sk-ant-your_key
```

### Step 5: Build Application

```bash
npm run build
```

### Step 6: Install PM2

```bash
sudo npm install -g pm2
```

### Step 7: Start Application

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ideacapture',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start app
pm2 start ecosystem.config.js

# Enable startup
pm2 startup
pm2 save
```

### Step 8: Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/ideacapture
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/ideacapture /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 9: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Enable auto-renewal
sudo certbot renew --dry-run
```

---

## Environment Variables for Production

### Production vs Development

Always use separate Supabase projects for production and development.

### Required Variables

```env
# Supabase (Production Project)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-your_production_key
```

### Optional Variables

```env
# Node environment
NODE_ENV=production

# Custom port (if needed)
PORT=3000

# Analytics (if using)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error tracking (if using Sentry)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Security Best Practices

1. **Never commit `.env.local`** to git
2. **Use different keys** for dev and production
3. **Rotate keys regularly** (every 90 days)
4. **Use secret managers** for sensitive data (AWS Secrets Manager, etc.)
5. **Restrict API keys** with appropriate scopes

---

## Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `ideacapture.com`)
3. Choose configuration type:
   - **Custom nameservers**: Recommended
   - **CNAME**: If keeping current DNS provider
4. Update DNS records as instructed
5. Wait for DNS propagation (5-60 minutes)
6. Vercel automatically provisions SSL

### Netlify

1. Go to Site Settings → Domain management
2. Add custom domain
3. Update DNS records:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```
4. Wait for DNS propagation
5. Enable HTTPS (automatic)

### Custom Server

1. Update Nginx configuration with your domain
2. Get SSL certificate (see above)
3. Update DNS A record to point to your server IP

---

## SSL Configuration

### Vercel/Netlify

Automatic! HTTPS is enabled by default with free SSL certificates.

### Custom Server (Let's Encrypt)

Already covered in [Custom Server Deployment](#custom-server-deployment).

### Cloudflare (Recommended)

Add Cloudflare for additional benefits:

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Add your domain
3. Update nameservers at your registrar
4. Enable "Full (strict)" SSL mode
5. Enable "Always Use HTTPS"
6. Enable "Automatic HTTPS Rewrites"

Benefits:
- DDoS protection
- CDN (faster global access)
- Web Application Firewall
- Caching
- Free SSL

---

## Performance Optimization

### Build Optimization

1. **Enable Compression**
   - Gzip/Brotli (automatic on Vercel/Netlify)

2. **Optimize Images**
   - Use Next.js Image component (already implemented)
   - WebP format
   - Lazy loading

3. **Code Splitting**
   - Automatic with Next.js
   - Use dynamic imports for large components

### Runtime Optimization

1. **CDN Configuration**
   - Use Vercel/Netlify CDN
   - Or Cloudflare

2. **Caching Headers**
   Add to `next.config.ts`:
   ```typescript
   async headers() {
     return [
       {
         source: '/:all*(svg|jpg|png)',
         headers: [
           {
             key: 'Cache-Control',
             value: 'public, max-age=31536000, immutable',
           },
         ],
       },
     ]
   }
   ```

3. **Database Optimization**
   - Supabase Connection Pooling (automatic)
   - Indexes on frequently queried fields (already in schema)

### Monitoring Performance

Use these tools:

- **Lighthouse**: Browser DevTools
- **WebPageTest**: webpagetest.org
- **Vercel Analytics**: Built into Vercel
- **Google PageSpeed Insights**: pagespeed.web.dev

Target metrics:
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **TTI**: < 3s
- **CLS**: < 0.1

---

## Monitoring and Logging

### Error Tracking (Sentry)

1. Sign up at [sentry.io](https://sentry.io)
2. Create new project (Next.js)
3. Install SDK:
   ```bash
   npm install @sentry/nextjs
   ```
4. Configure:
   ```bash
   npx @sentry/wizard -i nextjs
   ```
5. Add DSN to environment variables

### Uptime Monitoring

Free options:
- **UptimeRobot**: uptimerobot.com
- **Pingdom**: pingdom.com
- **StatusCake**: statuscake.com

Set up checks every 5 minutes with alerts.

### Application Logs

#### Vercel
- View logs in Vercel dashboard
- Real-time log streaming
- Search and filter

#### Custom Server
Use PM2:
```bash
pm2 logs ideacapture
pm2 logs ideacapture --lines 100
```

---

## Deployment Troubleshooting

### Build Fails

**Error**: TypeScript errors

**Solution**:
```bash
# Fix locally first
npm run build

# If it builds locally, check:
# 1. Node version matches (18+)
# 2. All dependencies installed
# 3. Environment variables set
```

**Error**: Out of memory

**Solution**: Increase Node memory:
```json
// package.json
"scripts": {
  "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
}
```

### Site Not Loading

**Problem**: White screen or 404

**Solutions**:
1. Check browser console for errors
2. Verify environment variables are set
3. Check deployment logs
4. Ensure database is accessible
5. Verify SSL certificate is valid

### API Routes Failing

**Problem**: 500 errors on API calls

**Solutions**:
1. Check API logs in deployment platform
2. Verify `ANTHROPIC_API_KEY` is set
3. Check Supabase connection
4. Verify RLS policies allow access
5. Test API routes directly

### PWA Not Installing

**Problem**: Install prompt doesn't appear

**Solutions**:
1. Must use HTTPS (localhost ok for dev)
2. Verify `manifest.json` is accessible
3. Check service worker registration
4. Clear browser cache
5. Check browser console for PWA errors

### Slow Performance

**Problem**: Site loads slowly

**Solutions**:
1. Enable CDN (Vercel/Netlify have built-in)
2. Check database query performance
3. Optimize images
4. Enable compression
5. Check region (deploy closer to users)

---

## Cost Estimation

### Free Tier (Getting Started)

- **Vercel/Netlify**: Free
- **Supabase**: Free (500MB database, 2GB bandwidth)
- **Anthropic**: Pay-as-you-go (~$1-5/month for personal use)
- **Domain**: $10-15/year

**Total**: $1-5/month + domain

### Light Usage (100 users/month)

- **Vercel/Netlify**: Free (within limits)
- **Supabase**: Free or $25/month
- **Anthropic**: ~$10-20/month
- **Domain**: $10-15/year

**Total**: $10-45/month

### Medium Usage (1000 users/month)

- **Vercel**: $20/month (Pro plan)
- **Supabase**: $25/month (Pro plan)
- **Anthropic**: ~$50-100/month
- **Domain**: $10-15/year
- **Monitoring**: $0-10/month

**Total**: $95-155/month

---

## Rollback

### Vercel

1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Netlify

1. Go to Deploys
2. Find previous deploy
3. Click "Publish deploy"

### Custom Server

```bash
git revert HEAD
git push
pm2 restart ideacapture
```

---

## Backup Strategy

### Database (Supabase)

- **Automatic Backups**: Daily (Pro plan)
- **Manual Backups**: Export via dashboard
- **Point-in-Time Recovery**: Available on Pro plan

### Code

- Git repository is your backup
- Keep main branch stable
- Tag releases: `git tag v1.0.0`

---

## Success!

Your IdeaCapture app is now live! Share it with the world and start helping people capture their brilliant ideas.

Next steps:
- Monitor performance and errors
- Collect user feedback
- Plan new features
- Scale as needed

---

Need help? Check [README.md](./README.md) troubleshooting section or open an issue on GitHub.
