# Monodog: Monorepo Health Dashboard (Frontend)

## 🎯 Overview

This is the **client-side application** designed to consume data from the **Monorepo Analytics and Health API** backend service.
It provides a **real-time, visual dashboard** for tracking the health, dependencies, and overall status of all packages within the monorepo.

---

## 🛠 Technology Stack

| Component | Technology | Description |
|------------|-------------|--------------|
| **Framework** | React (Functional Components) | Core library for building the user interface. |
| **Styling** | Tailwind CSS | Utility-first framework for responsive, modern, and aesthetic design. |
| **Data Fetching** | Fetch API (Native JavaScript) | Handles communication with the backend Express API. |
| **Icons** | Lucide React | Simple, clean vector icons for visualization. |

---

## ⚙️ Prerequisites

To run this application, ensure the following:

- **Node.js** and a package manager (`npm`, `yarn`, or `pnpm`) are installed.
- The **Monorepo Analytics API** backend service is running and accessible.
  - Default backend URL: **http://localhost:4000**

---

## 🚨 API Connection Details

The dashboard connects to the backend API using the following base URL:

```javascript
const API_BASE_URL = 'http://localhost:4000/api';

# Install dependencies (if not already installed)
pnpm install

pnpm run dev

```
## 🚀 Getting Started

###  Installation

Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/lakinmindfire/MonoDog.git
cd apps/dashboard

# Install dependencies
pnpm install

# build
pnpm run build

# run dashboard
pnpm run dev
```
