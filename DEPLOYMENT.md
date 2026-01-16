# 🚀 Deployment Guide

Complete guide to deploying MindFlow to production.

## Prerequisites

- Git installed
- GitHub account
- Vercel account (free tier works)

## Method 1: Deploy to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: MindFlow app"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/mindflow.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

**That's it!** Your app will be live at `https://your-project.vercel.app`

### Step 3: Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update your DNS records as instructed

## Method 2: One-Click Deploy

Click this button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/mindflow)

## Method 3: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

## Environment Variables

MindFlow works out of the box with no environment variables required.

### Optional Integrations

If you want to add real-time collaboration:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables based on your chosen provider:

**For Liveblocks:**
```
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_...
```

**For Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Performance Optimization

MindFlow is already optimized for Vercel's Edge Network:

✅ **Automatic optimizations:**
- Image optimization
- Font optimization  
- Automatic code splitting
- Edge caching
- Serverless functions

✅ **Build optimizations:**
- SWC compiler (faster than Babel)
- React 18 optimizations
- Tree shaking
- Minification

## Monitoring

Once deployed, monitor your app:

1. **Analytics** - Vercel provides built-in analytics
2. **Error Tracking** - Consider adding Sentry
3. **Performance** - Use Lighthouse scores

## Rollback

If something goes wrong:

```bash
vercel rollback
```

Or via dashboard:
1. Go to Deployments
2. Find the working version
3. Click "Promote to Production"

## Custom Deployment Settings

Edit `vercel.json` to customize:

```json
{
  "regions": ["iad1"],  // Change region
  "framework": "nextjs",
  "buildCommand": "npm run build"
}
```

## Troubleshooting

### Build Fails

1. Check Node version (should be 18+)
2. Clear cache: `vercel --force`
3. Check logs in Vercel dashboard

### App is Slow

1. Check which region you deployed to
2. Enable Edge caching
3. Optimize images if you added any

### Canvas Not Loading

1. Check browser console for errors
2. Ensure JavaScript is enabled
3. Try different browser

## Support

Need help? 
- Create an issue on GitHub
- Check Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Join the Next.js Discord

---

**Pro Tip:** Vercel automatically deploys preview URLs for every git push to non-main branches. Use this for testing!
