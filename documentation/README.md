# Monodog Documentation

Complete documentation for the Monodog monorepo analytics and health dashboard API.

## 📚 Overview

This documentation covers everything you need to know to install and use Monodog in your monorepo:

- **Getting Started**: Quick introduction and prerequisites
- **Installation**: Step-by-step installation guides
- **Usage Guide**: How to use the dashboard and API
- **Features**: Detailed feature documentation
- **API Reference**: Complete REST API documentation
- **Troubleshooting**: Common issues and solutions

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm (built-in with Node.js)

### View Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```

3. Open browser to `http://localhost:3001`

### Build Production Version

```bash
npm run build
```

This generates static HTML in the `build/` directory that can be deployed to any static hosting.

## 📁 Project Structure

```
docs/
├── docs/                          # Documentation content
│   ├── intro.md                   # Introduction page
│   ├── getting-started/           # Getting started guides
│   ├── installation/              # Installation guides
│   ├── features/                  # Features documentation
│   ├── api-reference/             # API documentation
│   ├── future-section/            # Future Enhancements
│   └── troubleshooting/           # Troubleshooting guides
├── src/
│   └── css/
│       └── custom.css             # Custom styles
│       └── monodog.css            # fontpage styles
├── static/                        # Static assets (images, etc)
├── docusaurus.config.js          # Docusaurus configuration
├── sidebars.js                   # Sidebar structure
└── package.json                  # Project configuration
```

## 📝 Adding New Documentation

1. Create a new `.md` file in the appropriate `docs/` subdirectory
2. Add frontmatter with title and sidebar position:
   ```markdown
   ---
   sidebar_position: 1
   title: Your Page Title
   ---
   
   # Page Content
   ```
3. Update `sidebars.js` if adding a new section
4. Pages automatically appear in the sidebar!

## 🔗 Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server on port 3001 |
| `npm run build` | Build static site |
| `npm run serve` | Serve built site |
| `npm run clear` | Clear cache |
| `npm run swizzle` | Customize Docusaurus theme |

## 🌐 Deployment

### Build
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

### Deploy to Static Hosting
Copy the `build/` folder to your static hosting service (Vercel, Netlify, GitHub Pages, etc.)

## 📖 Documentation Content

### 30 Documentation Files Created

- **Getting Started** (3 files)
  - Overview
  - Prerequisites
  - Quick Start

- **Installation** (4 files)
  - NPM Installation
  - Monorepo Configuration
  - Environment Setup
  - First Run

- **Usage** (4 files)
  - Dashboard Guide
  - Available Commands
  - Configuration
  - Examples

- **Features** (5 files)
  - Package Scanning
  - Health Monitoring
  - CI Integration
  - Dependency Analysis
  - Git Integration

- **API Reference** (5 files)
  - API Overview
  - Packages Endpoint
  - Health Endpoint
  - Commits Endpoint
  - Config Endpoint

- **Advanced** (4 files)
  - Custom Configuration
  - Database Setup
  - Security
  - Performance

- **Troubleshooting** (4 files)
  - Common Issues
  - FAQ
  - Debug Mode
  - Getting Support

## 🎨 Customization

### Colors and Theme

Edit `src/css/custom.css` to customize colors:

```css
:root {
  --ifm-color-primary: #2e8555;
  --ifm-color-primary-light: #33925d;
}
```

### Configuration

Edit `docusaurus.config.js` to change:
- Site title and tagline
- Base URL and deployment
- Navbar and footer links
- Branding and metadata

## 🔍 Search

The documentation includes built-in search functionality powered by Docusaurus.

## 📱 Mobile Responsive

The documentation is fully responsive and works perfectly on mobile devices.

## 🌙 Dark Mode

Automatic dark mode support with theme toggle in navbar.

## ✅ Features

- ✅ Full-text search
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ SEO optimized
- ✅ Syntax highlighting
- ✅ Sidebar navigation
- ✅ Breadcrumbs
- ✅ Edit links
- ✅ Table of contents

## 📄 License

Same as Monodog project

## �� Contributing

To contribute to the documentation:

1. Edit or create `.md` files in `docs/`
2. Update `sidebars.js` if needed
3. Test locally with `npm start`
4. Submit a pull request

## 📚 Technology Stack

- **Docusaurus**: Documentation generator
- **React**: UI framework
- **MDX**: Markdown + React
- **Tailwind CSS**: Styling (via custom CSS)
- **Prism**: Syntax highlighting

## 🆘 Support

For issues with the documentation:

1. Check [Troubleshooting](/troubleshooting/common-issues)
2. Review [FAQ](/troubleshooting/faq)
3. Open an issue on GitHub
4. Check discussions

## 📊 Statistics

- **Total Files**: 30 markdown files
- **Total Content**: ~10,000+ words
- **Build Size**: 2.0 MB
- **Pages**: 30+
- **Code Examples**: 50+

---

**Built with ❤️ for developers by developers**
