# 🎯 MindFlow

A beautiful, effortless collaborative mindmap and flowchart application inspired by Apple's Liquid Glass design language.

![MindFlow](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css)
![React Flow](https://img.shields.io/badge/React_Flow-11-ff0072?style=flat-square)

## ✨ Features

- **🎨 Apple-Inspired Design** - Frosted glass morphism, smooth animations, premium aesthetics
- **⚡ Zero Friction** - No sign-up required, start creating instantly
- **🔗 Shareable Links** - Share your mindmap with a simple URL
- **🌓 Dark Mode** - Beautiful dark theme that respects system preferences
- **📱 Responsive** - Works on desktop, tablet, and mobile
- **💾 Auto-Save** - Your work is automatically saved to local storage
- **🎯 Infinite Canvas** - Pan, zoom, and organize your thoughts freely
- **🎨 Color Themes** - 6 beautiful color presets for nodes
- **🔌 Extensible** - Easy to add real-time collaboration backends

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindflow.git
   cd mindflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/mindflow)

1. **One-Click Deploy**
   - Click the "Deploy with Vercel" button above
   - Or manually: `vercel` (from Vercel CLI)

2. **Environment Variables**
   - No environment variables required for basic functionality
   - See `.env.example` for optional integrations

## 🎮 How to Use

1. **Create Nodes**
   - Click anywhere on the canvas to create a new node
   - Double-click a node to edit its text

2. **Connect Ideas**
   - Drag from a node's handle (small circle) to another node to create a connection

3. **Customize**
   - Right-click a node to change its color
   - Use the toolbar to zoom, fit view, or toggle theme

4. **Share**
   - Click the share button to get a shareable link
   - Anyone with the link can view and edit

5. **Navigate**
   - Click and drag on the canvas to pan
   - Scroll to zoom in/out
   - Use the minimap in the bottom-left corner

## 🏗️ Project Structure

```
mindflow/
├── app/                      # Next.js App Router
│   ├── [roomId]/            # Dynamic room pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── Canvas.tsx           # Main canvas component
│   ├── CustomNode.tsx       # Glass morphism node
│   ├── Toolbar.tsx          # Floating toolbar
│   ├── ColorPicker.tsx      # Color selection
│   └── ShareModal.tsx       # Share dialog
├── lib/                     # Utilities
│   ├── store.ts             # Zustand state management
│   └── utils.ts             # Helper functions
├── types/                   # TypeScript definitions
│   └── index.ts
└── public/                  # Static assets
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Canvas**: React Flow
- **State**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🎨 Design Philosophy

MindFlow follows Apple's design principles:

- **Clarity** - Clear visual hierarchy and purpose
- **Deference** - Content is king, UI is supportive
- **Depth** - Layers and motion create realism

### Glass Morphism

All UI elements use the signature frosted glass effect:
- Background blur with saturation
- Soft shadows instead of borders
- Transparency layers
- Subtle gradients

### Motion Design

- Spring-based animations (cubic-bezier)
- Smooth transitions (300-400ms)
- Hover states that feel responsive
- Micro-interactions that delight

## 🔌 Adding Real-Time Collaboration

Currently, MindFlow uses localStorage for persistence. To add true multi-user real-time:

### Option 1: Liveblocks (Recommended)

1. Install Liveblocks
   ```bash
   npm install @liveblocks/client @liveblocks/react
   ```

2. Add your API key to `.env.local`
   ```
   NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_...
   ```

3. Update the Canvas component to use Liveblocks hooks

### Option 2: Supabase Realtime

1. Install Supabase
   ```bash
   npm install @supabase/supabase-js
   ```

2. Add credentials to `.env.local`
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

3. Create a `mindmaps` table and use Supabase Realtime subscriptions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- React Flow for the excellent canvas library
- Framer Motion for smooth animations
- Vercel for seamless deployment
- The open-source community

## 📧 Contact

Questions? Reach out at hello@mindflow.app

---

Made with ❤️ and inspired by Apple's design excellence
