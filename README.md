# 📄 Simple Invoice Generator

A modern, feature-rich invoice generator built with Next.js, Firebase, and TypeScript. Create professional invoices with multi-company support, Firebase authentication, and PDF generation.

## ✨ Features

- 🏢 **Multi-Company Management** - Manage unlimited companies under one account
- 👤 **User Profiles** - Personal information separate from business details
- 🔐 **Firebase Authentication** - Email, Google, Apple, and Phone sign-in
- 💾 **Firestore Database** - Secure cloud storage for profiles and companies
- 📊 **Dynamic Invoice Creation** - Real-time calculations with tax, discounts, and adjustments
- 🎨 **Professional PDF Output** - Print-ready invoices with react-to-print
- 🔄 **Three Data Sources** - Use Profile, Company, or Custom data for invoices
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🚀 **GitHub Pages Deployment** - Automated deployment with GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase project created ([Create one here](https://console.firebase.google.com/))
- Git installed

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kabilangr/simple-invoice-generator.git
   cd simple-invoice-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123
   ```

4. **Verify configuration** (optional but recommended)
   ```bash
   ./check-env.sh
   ```
   
   This will validate all Firebase environment variables are set correctly.

5. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Authentication (Email, Google, Apple, Phone)
3. Create Firestore Database
4. Apply security rules (see [DEPLOYMENT.md](DEPLOYMENT.md))
5. Copy configuration to `.env.local`

### GitHub Pages Deployment

See the complete [**Deployment Guide**](DEPLOYMENT.md) for step-by-step instructions.

**Quick setup:**
1. Add Firebase secrets to GitHub repository
2. Push to `main` branch
3. GitHub Actions will automatically build and deploy

**Required GitHub Secrets:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

📖 Detailed instructions: [`.github/SETUP_SECRETS.md`](.github/SETUP_SECRETS.md)

## 📖 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for GitHub Pages
- **[.github/SETUP_SECRETS.md](.github/SETUP_SECRETS.md)** - How to configure GitHub secrets
- **[.github/ENV_VALIDATION.md](.github/ENV_VALIDATION.md)** - Environment validation tools
- **[BUILD_FIX.md](BUILD_FIX.md)** - Build configuration and troubleshooting
- **[MULTI_COMPANY_SYSTEM.md](MULTI_COMPANY_SYSTEM.md)** - Technical architecture and API reference
- **[MULTI_COMPANY_QUICKSTART.md](MULTI_COMPANY_QUICKSTART.md)** - Quick start guide for multi-company features

## 🏗️ Project Structure

```
simple-invoice-generator/
├── src/
│   ├── app/                      # Next.js app router pages
│   │   ├── page.tsx             # Home/Invoice page
│   │   ├── profile/             # User profile page
│   │   ├── companies/           # Company management page
│   │   └── signin/              # Authentication page
│   ├── components/              # React components
│   │   ├── InvoiceForm.tsx     # Main invoice form
│   │   ├── CompanyForm.tsx     # Company add/edit form
│   │   ├── InvoicePDF.tsx      # PDF template
│   │   └── ...
│   ├── context/                 # React context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── CompanyContext.tsx  # Company state
│   ├── lib/                     # Utility libraries
│   │   ├── firebase.ts         # Firebase initialization
│   │   └── firestore.ts        # Firestore operations
│   └── type/                    # TypeScript interfaces
│       ├── invoice.ts
│       ├── company.ts
│       └── userProfile.ts
├── .github/
│   └── workflows/
│       └── nextjs.yml          # GitHub Actions deployment
└── ...
```

## 🎯 User Flow

```
1. Sign Up (Email/Google/Apple/Phone)
   ↓
2. Complete Personal Profile
   ↓
3. Add Company Details
   ↓
4. Select Active Company
   ↓
5. Create Invoice (Profile/Company/Custom)
   ↓
6. Generate PDF
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **PDF**: react-to-print
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

./check-env.sh       # Validate Firebase environment variables
./setup.sh           # Automated project setup
```

## 🔐 Security

- **Firestore Security Rules** - User data isolation
- **Firebase Authentication** - Secure user management
- **Environment Variables** - Sensitive data protection
- **Client-side Validation** - React Hook Form validation
- **Server-side Security** - Firestore rules enforcement

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [Firebase](https://firebase.google.com/)
- Icons and styling with [Tailwind CSS](https://tailwindcss.com/)
- Form handling by [React Hook Form](https://react-hook-form.com/)

## 📞 Support

For issues and questions:
- Open an [Issue](https://github.com/kabilangr/simple-invoice-generator/issues)
- Check the [Documentation](DEPLOYMENT.md)
- Review [Firebase Docs](https://firebase.google.com/docs)

---

**Made with ❤️ using Next.js and Firebase**
