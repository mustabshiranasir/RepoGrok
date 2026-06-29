# RepoGrok

Paste any GitHub repository URL and get an instant AI-powered breakdown — code summary, tech stack, folder structure, architecture diagram, setup guide, and project ratings. Designed for developers to inspect any repo in seconds without cloning it.

Built with Next.js, Groq AI, and Supabase.

## Features

- **AI Summary** — Understand what a project does in seconds
- **Tech Stack** — Detected languages, frameworks, and tools with category labels
- **Folder Tree** — Interactive nested file browser with AI explanations per directory
- **Architecture Diagram** — Visual node graph showing data flow between layers
- **Setup Guide** — Step-by-step instructions extracted from real configuration files
- **Project Ratings** — Score across 7 dimensions (quality, architecture, performance, error handling, documentation, testing, security)
- **PDF Export** — Download architecture diagram as PNG, JPEG, or SVG

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| AI | Groq (Llama 3.3 70B) |
| Database | Supabase PostgreSQL (via Prisma) |
| Styling | Tailwind CSS v4 |
| Diagrams | React Flow |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/mustabshiranasir/RepoGrok.git
cd RepoGrok

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in GROQ_API_KEY, DATABASE_URL, and GITHUB_TOKEN

# Push DB schema
npx prisma db push

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key for AI analysis |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `GITHUB_TOKEN` | GitHub PAT (optional, increases API rate limits) |

## Deployment

Deploy to Vercel with zero configuration:

```bash
npx vercel
```

## License

MIT — see [LICENSE](LICENSE). Must credit the original author when using or distributing.
