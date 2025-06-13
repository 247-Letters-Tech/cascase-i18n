# Getting Started with Cascade-I18n

This guide will walk you through the process of setting up and using the Cascade-I18n React SDK in a new application.

## 1. Prerequisites

-   You have a React project set up (e.g., with Vite or Create React App).
-   You have access to the project's Supabase instance for fetching translations.
-   You have an account on the Cascade-I18n platform (the web dashboard) and have created a project.

## 2. Installation

First, install the Cascade-I18n React SDK from the npm registry:

```bash
npm install @cascade-i18n/react
```

## 3. Setting Up the Provider

The `I18nProvider` is a React context provider that initializes the i18n service and makes it available to your entire application. You should wrap your root component with it.

In your main application file (e.g., `src/main.tsx` or `src/index.tsx`), import the provider and your Supabase client:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from '@cascade-i18n/react';
import { createClient } from '@supabase/supabase-js';

// Initialize your Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider
      supabase={supabase}
      initialLanguage="en"
      initialPersona="default"
      initialMode="default"
      userType="free"
    >
      <App />
    </I18nProvider>
  </React.StrictMode>
);
```

## 4. Using Translations

Now you can use the `TranslatedText` component to display translated strings in your application.

```tsx
import { TranslatedText } from '@cascade-i18n/react';

function MyComponent() {
  return (
    <div>
      <h1>
        <TranslatedText
          module="common"
          keyPath="greetings.hello"
          defaultValue="Hello, World!"
        />
      </h1>
      <p>
        <TranslatedText
          module="common"
          keyPath="welcome_message"
          defaultValue="Welcome to our application."
        />
      </p>
    </div>
  );
}

export default MyComponent;
```

### How It Works

-   **`module`**: The name of the translation module (e.g., "common", "roadmap").
-   **`keyPath`**: The key of the translation string. You can use dot notation for nested keys.
-   **`defaultValue`**: A fallback value to display if the translation is not found.

## 5. Switching the Context

You can use the `useI18nContext` hook to access the current i18n state and methods to change the context.

```tsx
import { useI18nContext } from '@cascade-i18n/react';

function UserProfile() {
  const { language, persona, setLanguage, setPersona } = useI18nContext();

  return (
    <div>
      <p>Current Language: {language}</p>
      <p>Current Persona: {persona}</p>

      <button onClick={() => setLanguage('ta')}>Switch to Tamil</button>
      <button onClick={() => setPersona('student')}>Switch to Student Persona</button>
    </div>
  );
}
```

## 6. Next Steps

You've now successfully integrated Cascade-I18n into your React application. From here, you can:

-   Explore the pre-built `LanguageSwitcher` component for a ready-made UI.
-   Use the CLI to generate TypeScript types for your translation keys.
-   Use the web dashboard to add and manage your translations. 