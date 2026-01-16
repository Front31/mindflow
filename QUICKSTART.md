# 🚀 Quick Start Guide

Get MindFlow running in under 2 minutes!

## Option 1: Local Development (Fastest)

### 1️⃣ Install Dependencies
```bash
cd mindflow
npm install
```

### 2️⃣ Start Dev Server
```bash
npm run dev
```

### 3️⃣ Open Browser
Navigate to: **http://localhost:3000**

**That's it!** 🎉 Start creating mindmaps!

---

## Option 2: Deploy to Production

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from project directory)
vercel

# Follow the prompts - it takes 30 seconds!
```

Your app will be live at: `https://your-project.vercel.app`

### Or Use GitHub + Vercel Web UI

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/mindflow.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import from GitHub
   - Click "Deploy"
   
   Done! 🚀

---

## What You Get

✅ **Apple-inspired glass UI** - Premium frosted glass design  
✅ **Zero config** - Works immediately, no setup needed  
✅ **Dark mode** - Automatic system theme detection  
✅ **Shareable links** - Instant collaboration via URL  
✅ **Auto-save** - Never lose your work  
✅ **Mobile ready** - Works on all devices  

---

## Your First Mindmap

1. **Click anywhere** on canvas → Creates a node
2. **Double-click** a node → Edit text
3. **Drag from circle** → Connect nodes
4. **Toolbar buttons**:
   - ➕ Add node
   - 🔍 Zoom in/out
   - 📐 Fit view
   - 🔄 Reset
   - 🔗 Share
   - 🌙 Theme toggle

---

## Next Steps

- **Share your work**: Click share button → Copy link → Send to team
- **Customize colors**: Right-click nodes (coming soon)
- **Export**: Take screenshots for now, export feature coming
- **Add real-time**: See `README.md` for Liveblocks/Supabase setup

---

## Need Help?

- 📖 Read [README.md](./README.md) for full documentation
- 🚀 See [DEPLOYMENT.md](./DEPLOYMENT.md) for advanced deployment
- 🐛 Found a bug? Open an issue on GitHub
- 💡 Have ideas? We'd love to hear them!

---

## File Structure Quick Reference

```
mindflow/
├── app/              # Pages & routes
├── components/       # React components
├── lib/             # State & utilities
├── types/           # TypeScript types
└── public/          # Static files
```

---

**Pro Tip**: Press `Cmd/Ctrl + K` for keyboard shortcuts (coming soon!)

Enjoy creating beautiful mindmaps! 🎨✨
