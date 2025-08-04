# 📋 MakInvoiz Web App

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-98%25-blue?style=for-the-badge&logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-Framework-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Backend-mediumseagreen?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Taildwind-Styling-lightskyblue?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-orangered?style=for-the-badge)

**A modern, feature-rich invoice management web application built with TypeScript & Supabase** 💼

</div>

---

## 🚀 Overview

MakInvoiz is a comprehensive web-based invoice management system designed to streamline your billing process. Built with modern TypeScript, Next.js, and powered by Supabase, it offers a clean, intuitive interface for creating, managing, and storing invoices with ease.

## ✨ Features

### 📊 **Core Functionality**
- 🧾 **Invoice Creation** - Generate professional invoices in minutes
- 👥 **Business Info Management** - Organize and manage business information
- 💰 **Payment Tracking** - Monitor payment status and history (Coming Soon)
- 📱 **Responsive Design** - Works seamlessly on all devices

### 🔧 **Advanced Features**

- 💾 **PDF Export** - Download invoices in PDF format
- 🔒 **Secure Authentication** - Supabase Auth with JWT tokens
- 📊 **Real-time Updates** - Live data synchronization
- 🗄️ **PostgreSQL Database** - Robust data storage with Supabase

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher) 📦
- npm or yarn package manager 🧶
- Git 🔧
- Supabase account 🗄️

### Quick Start

```bash
# Clone the repository
git clone https://github.com/ravindusj/makinvoiz-web-app.git

# Navigate to project directory
cd makinvoiz-web-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your environment variables (see API Configuration below)
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 API Configuration

### Environment Variables Setup

Create a `.env.local` file in your project root and configure the following variables:

#### 🗄️ Supabase Configuration

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Supabase JWT Secret (for token verification)
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

#### 🐘 Database Configuration

```bash
# Database URLs (if using direct database connections)
POSTGRES_URL=postgresql://username:password@host:port/database
POSTGRES_PRISMA_URL=postgresql://username:password@host:port/database?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:port/database

# Database connection details
POSTGRES_USER=your-db-username
POSTGRES_HOST=your-db-host
POSTGRES_PASSWORD=your-db-password
POSTGRES_DATABASE=your-db-name
```

### 🚀 Getting Your Supabase Credentials

1. **Create a Supabase Project**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Get Your API Keys**
   ```typescript
   // Navigate to Settings > API in your Supabase dashboard
   const supabaseConfig = {
     url: "https://your-project-ref.supabase.co",
     anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Public anon key
     serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Service role key (keep secret!)
   };
   ```

3. **Database Connection String**
   ```sql
   -- Found in Settings > Database
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

### 🔐 Security Best Practices

> **⚠️ Important Security Notes:**
> - Never commit `.env.local` to version control
> - Use `NEXT_PUBLIC_` prefix only for client-side variables
> - Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-side only)
> - Rotate keys regularly in production

### 🗄️ Database Schema Setup

```sql
-- Schema for invoice management
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  invoice_number VARCHAR UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR DEFAULT 'draft',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
```

## 🎯 Usage

### Creating Your First Invoice

1. **📝 Add Business Information**
    - Navigate to "Manage Settings"
    - Add your all business information
    - Save the changes

2. **💼 Create Quotation/Bill**
   - Navigate to "New Quotation/Bill"
   - Add your client information
   - Add line items with descriptions and amounts
   - Set payment info and terms conditions
   - Click create button

3. **📤 Send & Track**
   - Preview your invoice
   - Download PDF
   - Send it 

## 📁 Project Structure

```
makinvoiz-web-app/
├───├── 📂 app/            # App routes
│   ├── 📂 components/     # Reusable UI components
│   ├── 📂 contexts/       # Context API logic
│   ├── 📂 hooks/          # Hooks
│   ├── 📂 lib/            # Utility functions and libraries
│   ├── 📂 public/         # Static assets
│   ├── 📂 scripts/        # SQL quries for supabase
│   └── 📂 styles/         # Global styles and themes
├── 📄 .env.local          # Environment variables (create this)
├── 📄 .env.example        # Environment variables template
├── 📄 package.json        # Dependencies and scripts
└── 📄 tsconfig.json       # TypeScript configuration
```

## 🎨 Screenshots

<div align="center">

### Dashboard Overview
![Dashboard](https://github.com/ravindusj/makinvoiz-web-app/blob/main/public/dashboard.png)

### Invoice Creation
![Quotation Creation](https://github.com/ravindusj/makinvoiz-web-app/blob/main/public/quotation-in.png)
![Bill Creation](https://github.com/ravindusj/makinvoiz-web-app/blob/main/public/bill-invoice.png)

### Settings
![Settings Page](https://github.com/ravindusj/makinvoiz-web-app/blob/main/public/settings.png)

</div>

## 🔧 Deployment

### Vercel Deployment

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add Environment Variables** in Vercel dashboard
4. **Deploy** 🚀

### Environment Variables for Production

```bash
# Add these in your deployment platform
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
SUPABASE_JWT_SECRET=your-production-jwt-secret
POSTGRES_URL=your-production-postgres-url
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 **Fork** the repository
2. 🌟 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. 💫 **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 🚀 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🎉 **Open** a Pull Request


## 🐛 Bug Reports & Feature Requests

Found a bug? Have an idea? We'd love to hear from you!

- 🐞 [Report a Bug](https://github.com/ravindusj/makinvoiz-web-app/issues/new?template=bug_report.md)
- 💡 [Request a Feature](https://github.com/ravindusj/makinvoiz-web-app/issues/new?template=feature_request.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ravindu SJ** [@ravindusj](https://github.com/ravindusj)

- 📧 Email: [ravindulach@gmail.com]
- 💼 LinkedIn: [@Ravindu Lachiththa](https://www.linkedin.com/in/ravindusj/)

## 🙏 Acknowledgments

- 💖 Thanks to all contributors
- 🗄️ Powered by [Supabase](https://supabase.com)
- ⚡ Built with [Next.js](https://nextjs.org)
- 🎨 Icons by [Lucid Icons](https://lucide.dev/icons/)
- 🌈 UI Components by [shadcd](https://ui.shadcn.com/)

## 📊 Stats

<div align="center">

![GitHub Stars](https://img.shields.io/github/stars/ravindusj/makinvoiz-web-app?style=social)
![GitHub Forks](https://img.shields.io/github/forks/ravindusj/makinvoiz-web-app?style=social)
![GitHub Issues](https://img.shields.io/github/issues/ravindusj/makinvoiz-web-app)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/ravindusj/makinvoiz-web-app)

</div>

---

<div align="center">

**Made with ❤️ by [Ravindu SJ](https://github.com/ravindusj)**

*Give this project a ⭐ if you found it helpful!*

</div>
