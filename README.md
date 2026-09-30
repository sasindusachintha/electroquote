# ⚡ ElectroQuote

> **Professional Offline-First Mobile Quotation & Estimation Tool for Electrical Contractors**

ElectroQuote is a powerful, mobile application designed specifically for electricians, electrical contractors, and tradespeople. It streamlines the job estimation process, allowing contractors to manage material/labour catalogues, build reusable component assemblies, calculate accurate job costs with markups and wastage, and generate polished PDF quotations on-the-go — completely offline.

---

## ✨ Features

- **⚡ Material & Labour Catalogue**: Organize materials by category, manage cost prices, markups, wastage percentages, and per-point/hourly labour rates. Includes pre-seeded electrical components and bilingual (English & Sinhala) item support.
- **🛠️ Reusable Assemblies (Kits)**: Combine multiple materials and labour items into single-click assemblies (e.g., *13A Socket Outlet Wiring*, *Distribution Board Assembly*, *Lighting Point Installation*).
- **📋 Customer & Project Management**: Manage clients, site addresses, and track multi-quote project lifecycles.
- **📄 Professional PDF Quotation Generator**:
  - Custom branding: Add company logo, tax numbers (VAT/Reg), contact info, and bank details.
  - Flexibility: Support for detailed or summarized PDF modes, subtotaling by section, line-item or overall discounts, and VAT calculation.
  - Instant Sharing: Export and share PDFs directly via WhatsApp, Email, or air drop using native OS sharing.
- **📴 100% Offline-First**: Powered by local SQLite database. No internet connectivity required, ensuring reliability on job sites.
- **🎨 Sleek Modern Interface**: Built with a sleek dark-mode UI, smooth animations, and fast list rendering.

---

## 🛠 Tech Stack

- **Framework**: [Expo SDK 57](https://expo.dev/) (React Native 0.86, React 19).
- **Navigation**: [Expo Router v4](https://docs.expo.dev/router/introduction/) (File-based, typed routing).
- **Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) with versioned SQL schema migrations.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) & [React Query (TanStack)](https://tanstack.com/query/latest).
- **UI Components & Motion**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/), [@gorhom/bottom-sheet](https://gorhom.github.io/react-native-bottom-sheet/), [Shopify FlashList](https://shopify.github.io/flash-list/).
- **Form Management**: `react-hook-form` + `zod` validation
- **Document Generation**: `expo-print` & `expo-sharing`

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your development machine:

- **Node.js** (v18.x or later)
- **npm** or **yarn** or **pnpm**
- **Expo Go** app on iOS/Android OR an Android Studio / Xcode emulator setup

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sasindusachintha/electroquote.git
   cd electroquote
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Expo development server**:
   ```bash
   npm start
   ```

4. **Run on specific platforms**:
   - **Android**: Press `a` in the terminal or run `npm run android`
   - **iOS**: Press `i` in the terminal or run `npm run ios`
   - **Web**: Press `w` in the terminal or run `npm run web`

---

## 📂 Project Structure

```text
electroquote/
├── app/                      # Expo Router screens & layouts
│   ├── (modals)/             # App modal screens (customer/project creators)
│   ├── (tabs)/               # Bottom tab screens (Home, Catalogue, Quotations, Settings)
│   ├── customers/            # Customer detail screens
│   ├── projects/             # Project detail screens
│   └── _layout.tsx           # Root app layout & providers
├── src/
│   ├── components/           # Reusable UI components
│   ├── constants/            # Theme, colors, typography, config
│   ├── db/                   # SQLite client, migrations, and repositories
│   │   ├── migrations/       # Versioned SQL migration files
│   │   └── repositories/     # Data access layer (Projects, Customers, Quotations, Materials)
│   ├── hooks/                # Custom React Query hooks
│   ├── services/             # PDF builder & export services
│   ├── stores/               # Zustand global state stores
│   ├── types/                # TypeScript definitions & schemas
│   └── utils/                # Formatting, calculation & file helpers
├── assets/                   # App icons, splash screens, and images
└── app.json                  # Expo project configuration
```

---

## 📜 Database Migrations

Database schema updates are handled automatically on startup through a custom SQL migration runner. Migration files are located in `src/db/migrations/` and execute sequentially based on schema version tracking.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
