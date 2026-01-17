# QuickAI - AI Content Generation Platform

QuickAI is a full-stack AI-powered content creation platform built with React, Node.js, and multiple AI services.

## Features

- 🤖 **AI Article Generation** - Generate blog articles using Groq AI
- 📝 **Blog Title Generator** - Create catchy blog titles
- 🎨 **AI Image Generation** - Generate images with ClipDrop API
- 🖼️ **Background Removal** - Remove backgrounds from images
- ✂️ **Object Removal** - Remove unwanted objects from images
- 📄 **Resume Review** - Get AI-powered feedback on resumes
- 👥 **Community Gallery** - Share and like public creations
- 💳 **Premium Subscriptions** - Clerk-based payment system

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Clerk Authentication
- Axios
- React Router
- React Hot Toast

### Backend
- Node.js + Express
- NeonDB (PostgreSQL)
- Cloudinary (Image Storage)
- Groq AI (Text Generation)
- ClipDrop API (Image Generation)
- Clerk (Authentication & Billing)

## Environment Variables

### Server (.env)
```env
PORT=3000
DATABASE_URL=your_neondb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_api_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLIPDROP_API_KEY=your_clipdrop_api_key
```

### Client (.env)
```env
VITE_BASE_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Installation

### Clone and Install
```bash
# Clone repository
git clone https://github.com/yourusername/Q_AI.git
cd Q_AI

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Database Setup
```bash
cd server
node setup-database.js
```

## Running Locally

### Start Server
```bash
cd server
npm run server
```

### Start Client
```bash
cd client
npm run dev
```

Visit `http://localhost:5173`

## Deployment

### Vercel Deployment
1. Push to GitHub
2. Import project in Vercel
3. Deploy client and server separately
4. Set environment variables in Vercel dashboard

### Clerk Webhook Setup
After Vercel deployment:
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select events: `subscription.created`, `subscription.updated`, `subscription.deleted`
4. Save webhook

## API Endpoints

### AI Routes
- `POST /api/ai/generate-article` - Generate article
- `POST /api/ai/generate-blog-titles` - Generate blog titles
- `POST /api/ai/generate-image` - Generate AI image
- `POST /api/ai/remove-image-background` - Remove background
- `POST /api/ai/remove-image-object` - Remove object
- `POST /api/ai/resume-review` - Review resume

### User Routes
- `GET /api/user/get-user-creations` - Get user's creations
- `GET /api/user/get-published-creations` - Get public creations
- `POST /api/user/toggle-like-creations` - Like/unlike creation

### Webhook Routes
- `POST /api/webhooks/clerk` - Clerk subscription webhook

## License

MIT

## Contributing

Pull requests are welcome!
