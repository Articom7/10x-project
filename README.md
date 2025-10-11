# SmartPantry

[![Project Status: In Development](https://img.shields.io/badge/status-in_development-yellowgreen.svg)](https://github.com/user/repo)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An intelligent web application to help you manage your home pantry, reduce food waste, and streamline your grocery shopping.

---

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
  - [Key Features (MVP)](#key-features-mvp)
  - [Out of Scope](#out-of-scope)
- [Project Status](#project-status)
- [License](#license)

---

## Project Description

**SmartPantry** is a mobile-first web application designed to solve the common problems of food waste and inefficient grocery shopping. By providing a simple way to track products, users can easily see what they have, what they've used, and what they need to buy.

The application leverages an LLM to understand natural language, allowing users to add items by simply typing out their shopping list (e.g., "I bought milk, 2 cartons of eggs, and bread"). It then automatically generates an interactive shopping list for items that have run out, helping users save time and money.

## Tech Stack

The project is built with a modern, component-based architecture:

| Category      | Technology                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend**  | [Astro 5](https://astro.build/), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Tailwind CSS 4](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/) |
| **Backend**   | [Supabase](https://supabase.com/) (PostgreSQL, Authentication, BaaS)                                        |
| **AI**        | [Openrouter.ai](https://openrouter.ai/) for LLM access                                                      |
| **DevOps**    | [GitHub Actions](https://github.com/features/actions) for CI/CD, [Docker](https://www.docker.com/), [DigitalOcean](https://www.digitalocean.com/) for hosting           |

## Getting Started Locally

Follow these instructions to set up the project on your local machine for development and testing.

### Prerequisites

- **Node.js**: Version `22.14.0`. We recommend using a version manager like [nvm](https://github.com/nvm-sh/nvm).
- **npm**: Should be installed with Node.js.
- **Environment Variables**: You will need API keys for Supabase and Openrouter.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Articom7/10x-project.git
    cd smartpantry
    ```

2.  **Set up the correct Node.js version:**
    If you are using `nvm`, run:
    ```sh
    nvm use
    ```

3.  **Install dependencies:**
    ```sh
    npm install
    ```

4.  **Create an environment file:**
    Create a `.env` file in the root of the project and add the necessary environment variables.
    ```env
    # .env
    SUPABASE_URL="your_supabase_url"
    SUPABASE_ANON_KEY="your_supabase_anon_key"
    OPENROUTER_API_KEY="your_openrouter_api_key"
    ```

5.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:4321`.

## Available Scripts

In the project directory, you can run the following commands:

| Script           | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `npm run dev`    | Runs the app in development mode with hot-reloading.       |
| `npm run build`  | Builds the app for production.                             |
| `npm run preview`| Serves the production build locally for previewing.        |
| `npm run lint`   | Lints the codebase using ESLint.                           |
| `npm run lint:fix` | Lints and automatically fixes fixable ESLint issues.     |
| `npm run format` | Formats the code using Prettier.                           |

## Project Scope

### Key Features (MVP)

- **User Accounts**: Secure registration and login with email and password.
- **LLM-Powered Product Entry**: Add products by typing a single sentence in natural language.
- **Manual Product Management**: Manually add, edit, and delete items.
- **Consumption Tracking**: Mark products as fully or partially used.
- **Pantry Overview**: A clear view of all items, grouped by category.
- **Automatic Shopping List**: Generate a shopping list with one click for all out-of-stock items.
- **Interactive Shopping List**: Check off items as you buy them.
- **User Onboarding**: A "quick start" guide for new users to add common products instantly.

### Out of Scope

The following features are not part of the MVP but may be considered for future versions:
- Adding products from receipt photos.
- Recipe suggestions based on available ingredients.
- Integrations with online grocery stores.
- Social features like sharing lists.
- Tracking product expiration dates.
- Dedicated native mobile applications.

## Project Status

This project is currently **in development**. The core features are being built, and the application is not yet ready for production use.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
