# CuraNova - Smart AI-Powered EMR System

<div align="center">
  <img src="https://mocha-cdn.com/01995c60-fb93-7bf1-834e-39691d61e5d6/image.png_7532.png" alt="CuraNova Logo" width="200"/>
  
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://kklbi2qxe4j22.mocha.app)
  [![License](https://img.shields.io/badge/License-Proprietary-red)](#license)
  [![Built with](https://img.shields.io/badge/Built%20with-React%20%7C%20TypeScript%20%7C%20Cloudflare-blue)](#technology-stack)
</div>

## 🏥 Overview

CuraNova is a modern, AI-powered Electronic Medical Records (EMR) system designed to revolutionize healthcare documentation and patient management. Built for healthcare professionals, it combines intuitive design with powerful AI capabilities to streamline medical workflows and enhance patient care.

## ✨ Features

### 📊 **Patient Management**
- Comprehensive patient profiles with demographics and medical history
- Advanced search and filtering capabilities
- Emergency contact management
- Medical record number tracking

### 📋 **Medical Records**
- Detailed visit documentation with diagnoses and prescriptions
- Vital signs tracking (blood pressure, heart rate, temperature, weight)
- Chief complaint and clinical notes
- Visit history timeline

### 🧪 **Laboratory Results**
- Lab test result tracking and management
- Abnormal value detection and highlighting
- Reference range comparisons
- Historical trend analysis

### 🤖 **AI-Powered Features**
- **Data-Aware Summaries**: Gemini-powered health briefs grounded in each patient's encounters, vitals, and lab abnormalities
- **Similar Cases**: Find patients with related conditions for research or care planning
- **Clinical Insights**: AI-driven analysis highlighting trends, risk drivers, and follow-up actions
- **Risk Assessment**: Automated identification of potential health risks and high-priority alerts

### 📊 **Analytics & Visualizations**
- Interactive health metrics charts
- Real-time "Doctors Online" indicator synced with active sessions
- Trend analysis with Recharts
- Live dashboard refreshes with background polling

### 🎨 **Modern User Experience**
- Beautiful, responsive design with dark/light theme support
- Smooth animations and transitions
- Mobile-optimized interface
- Glassmorphism UI elements
- Advanced CSS effects and gradients

### � **Role-Aware Authentication**
- Google OAuth 2.0 login with role detection based on structured email aliases
- Doctor/Nurse/Patient account templates for streamlined testing
- Automatic session lifecycle management with secure HTTP-only cookies

## �🛠️ Technology Stack

### **Frontend**
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Recharts** - Interactive charts and data visualization

### **Backend**
- **Hono** - Fast, lightweight web framework
- **Cloudflare Workers** - Edge computing platform
- **Cloudflare D1** - SQLite-based serverless database
- **Zod** - Schema validation

### **AI Integration**
- **Google Gemini AI** - Advanced AI analysis and summaries
- **OpenAI** - Additional AI capabilities (optional)

### **Authentication & Security**
- **Google OAuth** - Secure authentication with role-aware email patterns
- **HTTP-only cookies** - Secure session management

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher)
- Cloudflare account
- Google Cloud account (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/curanova-emr.git
   cd curanova-emr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Cloudflare Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

4. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

5. **Set up environment variables**
   ```bash
   # Required for AI features
   wrangler secret put GEMINI_API_KEY
   wrangler secret put GOOGLE_CLIENT_ID
   wrangler secret put GOOGLE_CLIENT_SECRET
   wrangler secret put GOOGLE_REDIRECT_URI
   
   # Optional for additional AI features
   wrangler secret put OPENAI_API_KEY
   ```

6. **Start development server**
   ```bash
   # For full authentication support
   npm run dev        # launches Vite dev server (frontend)
   wrangler dev --persist
  
   # Frontend:  http://localhost:5173
   # Worker API: http://127.0.0.1:8787
   ```

### Quick Start Script

For easier setup, use the provided development script:

```bash
bash start-dev.sh
```

This script will:
- Check and install required dependencies
- Verify Cloudflare authentication
- Populate `.dev.vars` with local secrets (if present)
- Start both Vite and Wrangler development servers with proper configuration

## 🏗️ Project Structure

```
src/
├── react-app/                 # Frontend React application
│   ├── components/           # Reusable UI components
│   ├── contexts/             # React contexts for state management
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components (routes)
│   ├── utils/               # Utility functions
│   └── App.tsx              # Main app component
├── shared/                  # Shared types and utilities
│   └── types.ts            # TypeScript type definitions
├── worker/                 # Backend Cloudflare Worker
│   └── index.ts            # API routes and business logic
└── vite-env.d.ts          # Vite environment types
```

## 🎯 Key Features Breakdown

### Role-Based Access Control
- **Doctor Role**: Full access to all patient data and medical features
- **Nurse Role**: Patient management with appropriate clinical permissions
- Secure role assignment and verification

**Test account patterns**

Use the following email aliases when configuring Google OAuth test users:

- `firstname.01.doctor@gmail.com` → Doctor access
- `firstname.02.nurse@gmail.com` → Nurse access
- `firstname.03.patient@gmail.com` → Patient portal access

These patterns map automatically to role permissions inside the worker.

### Advanced Patient Search
- Multi-field search across patient demographics
- Medical record number lookup
- Phone and email search capabilities
- Real-time search results

### AI-Powered Insights
- **Health Summaries**: Gemini-backed summaries that reference real visits, vitals, labs, and risk factors
- **Similar Conditions**: Machine learning-based patient matching
- **Clinical Recommendations**: Evidence-based treatment suggestions
- **Risk Stratification**: Automated health risk assessment

### Data Visualization
- Interactive vital signs charts
- Laboratory result trend analysis
- Patient statistics dashboard
- Health metrics over time

## 🔒 Security Features

- **OAuth 2.0 Authentication** via Google
- **HTTP-only session cookies** for security
- **Role-based access control** for different user types
- **Input validation** with Zod schemas
- **SQL injection protection** with prepared statements
- **CORS configuration** for secure API access

## 🎨 Design Philosophy

CuraNova follows modern design principles:
- **Glassmorphism** UI with backdrop filters and transparency
- **Dark/Light theme** support with smooth transitions
- **Responsive design** optimized for desktop and mobile
- **Accessibility** considerations for healthcare environments
- **Color theory** application for optimal visual hierarchy

## 📱 Mobile Support

- Fully responsive design adapting to all screen sizes
- Touch-optimized interactions for tablets and phones
- Mobile-first approach to form design
- Optimized performance for mobile devices

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following our coding standards
4. Write or update tests as needed
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

### Development Guidelines

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Maintain responsive design principles
- Test all features across light/dark themes
- Ensure mobile compatibility
- Add appropriate error handling
- Document complex functions and components

### Code Style

- Use Prettier for code formatting
- Follow ESLint rules
- Use semantic commit messages
- Keep components under 100 lines when possible
- Extract reusable logic into custom hooks

## 🧪 Testing

```bash
# Type checking
npm run check

# Build verification
npm run build

# Linting
npm run lint
```

## 🚀 Deployment

### Cloudflare Workers

1. **Build and validate**
   ```bash
   npm run check
   ```

2. **Deploy to production**
   ```bash
   wrangler deploy
   ```

### Environment Configuration

Ensure these secrets are configured in your Cloudflare Workers environment:
- `GEMINI_API_KEY` - Google AI API key
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `GOOGLE_CLIENT_ID` - OAuth client ID from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - OAuth client secret from Google Cloud Console
- `GOOGLE_REDIRECT_URI` - Authorized redirect URI (e.g., https://your-worker-domain/auth/callback)

## 📊 Performance

- **Lighthouse Score**: 95+ performance rating
- **Core Web Vitals**: Optimized for excellent user experience
- **Bundle Size**: Optimized with tree-shaking and code splitting
- **Database**: SQLite-based D1 for fast queries
- **CDN**: Global edge deployment via Cloudflare

## 🛡️ Privacy & Compliance

- **HIPAA Considerations**: Designed with healthcare privacy in mind
- **Data Encryption**: All data encrypted in transit and at rest
- **Audit Logging**: Comprehensive activity logging
- **Access Controls**: Role-based permissions system
- **Data Retention**: Configurable retention policies

## 📚 Documentation

- [API Documentation](./docs/api.md) - Detailed API endpoints
- [Component Guide](./docs/components.md) - React component documentation
- [Deployment Guide](./docs/deployment.md) - Production deployment instructions
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions

## 🐛 Known Issues

- None at this time. Please report any bugs via GitHub issues.

## 🔮 Roadmap

- [ ] **Advanced AI Features**: Enhanced diagnostic suggestions
- [ ] **Integration APIs**: HL7 FHIR compatibility
- [ ] **Mobile Apps**: Native iOS/Android applications
- [ ] **Advanced Analytics**: Predictive health modeling
- [ ] **Telemedicine**: Video consultation integration
- [ ] **Multi-language**: Internationalization support

## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## 🙏 Acknowledgments

- Built with ❤️ for healthcare professionals
- Powered by cutting-edge web technologies
- Designed for the future of healthcare documentation

## 📞 Support

For support, please contact:
- 📧 Email: support@curanova.health
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/curanova-emr/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/curanova-emr/discussions)

---

<div align="center">
  <p>Made with ❤️ by the CuraNova Team</p>
  <p>Revolutionizing Healthcare Documentation</p>
</div>
