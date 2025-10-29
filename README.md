# 🪅 Visual Genius: Communication Assistant for ASD

Visual Genius is an application that helps facilitate communication between parents and children with autism spectrum disorders (ASD) through visual cards and structured conversations.

> [!IMPORTANT]  
> This application is developed in my spare time, so I cannot be sure when it will be ready.

- **Teach mode**: Uses visual cards inspired by Applied Behavior Analysis (ABA) and addresses problems of existing solutions. Examples of visual aid products on the market can be seen here: [Bing Search Results](https://www.bing.com/images/search?q=ASD+for+visual+aids). These products can be quite costly: [Amazon Search Result](https://www.amazon.com/Special-Communication-Speech-Verbal-Children/dp/B08CFNDHYY).
- **Communication mode**: Uses cards inspired by this paper: [AACessTalk](https://www.eurekalert.org/news-releases/1084528).
- **Letterboard**: Inspired by the book *The Reason I Jump*.

## 🎡 Screens

![teach_screen](./docs/teach.png)

## 🌟 Features

### 1. **Parent Interface** - Conversation Facilitation
Start and manage conversations with your child using:
- **8 Predefined Topics**: Daily routines, emotions, food, activities, school, bedtime, family, safety
- **Custom Prompts**: Create conversation starters for any situation
- **Real-time State Management**: Start, pause, resume, or stop conversations
- **Quick Response Tracking**: Yes/No/"I don't know" buttons
- **Conversation Timeline**: View complete interaction history

### 2. **Child Interface** - Visual Response Board
Simple, touch-friendly interface where children can:
- View available visual cards
- Select cards to communicate
- See immediate feedback
- All selections are logged for parent review

### 3. **Teach Mode** - Card Creation & Sequencing
Create educational visual sequences:
- Generate step-by-step cards using AI
- Drag-and-drop to reorder teaching sequences
- Save card arrangements for future use
- Build reusable teaching libraries

### 4. **Letter Board** - Alternative Communication Method
Spell-based communication inspired by *The Reason I Jump*:
- Full alphabet grid for letter-by-letter communication
- Text-to-speech for constructed messages
- Ideal for children who can spell but struggle with verbal expression
- Lower cognitive load than card selection for some users

## 🏗️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Zustand
- **Database**: PostgreSQL (Azure Database for PostgreSQL Flexible Server)
- **ORM**: Drizzle ORM
- **AI Services**: 
  - Azure OpenAI (card generation)
  - Unsplash API (free image search for visual suggestions)

## 📋 Prerequisites

- Node.js 18+
- pnpm/npm/yarn
- Azure account with:
  - Azure OpenAI resource (GPT-4o deployment)
  - Azure Database for PostgreSQL Flexible Server
- Unsplash API key (free at https://unsplash.com/developers)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd visual-genius
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

**Option A: Web UI (Recommended)**
1. Start the development server: `npm run dev`
2. Navigate to `/settings` in your browser
3. Configure all settings through the web interface
4. Settings are stored in the database

**Option B: Environment File**

Create a `.env.local` file in the root directory:

```env
# PostgreSQL Connection
POSTGRES_URL=postgres://user:password@hostname:5432/visualgenius

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://<your-openai-name>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=<gpt-4o-deployment-name>

# Unsplash Image Search (Free)
# Get your free API key at: https://unsplash.com/developers
UNSPLASH_ACCESS_KEY=<your-unsplash-access-key>
```

**Note**: Settings in the database override `.env.local` values. See [SETTINGS_SYSTEM.md](./SETTINGS_SYSTEM.md) for details.

### 4. Authenticate Azure Services

For local development, authenticate via Azure CLI:

```bash
az login
```

For production, configure service principal credentials:
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`

### 5. Initialize Database

The application will automatically create required tables on first run:
- `conversation_session`
- `visual_card`
- `utterance`

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## 📱 Usage

### Parent/Caregiver Workflow

1. **Start a Conversation** (`/parent`)
   - Select a predefined topic or enter a custom prompt
   - Click "Start Conversation"
   - AI generates relevant visual cards with images
   - Cards appear on the main board

2. **Manage Conversation**
   - **Pause**: Temporarily halt the conversation
   - **Resume**: Continue from where you paused
   - **Stop**: End conversation and clear session
   - Quick response buttons log child's answers

3. **Review History**
   - Timeline sidebar shows all interactions
   - Color-coded by speaker (parent/child)
   - Timestamped entries

### Child Workflow

1. Navigate to `/child`
2. View available cards from the active session
3. Tap cards to select and respond
4. Selections are logged automatically

### Teaching Workflow

1. Navigate to `/teach`
2. Enter a teaching prompt (e.g., "How to brush teeth")
3. Review generated cards
4. Drag-and-drop to reorder steps
5. Save arrangement for future lessons

## 📂 Project Structure

```
src/
├── app/
│   ├── (routes)/
│   │   ├── child/      # Child response interface
│   │   ├── letterboard/ # Letter board spelling interface
│   │   ├── parent/     # Parent conversation interface
│   │   ├── settings/   # Configuration
│   │   └── teach/      # Card creation
│   └── api/
│       ├── cards/      # Card generation endpoint
│       ├── collections/ # Card collection management
│       ├── conversations/ # Session management
│       ├── images/
│       │   └── search/ # Image search endpoint
│       ├── settings/   # Settings management
│       └── speech/     # Interaction logging
├── components/
│   ├── cards/          # Card display components
│   ├── conversation/   # Timeline components
│   ├── layout/         # Navigation shell
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── constants/      # Presets and demo data
│   ├── observability/  # Logging utilities
│   ├── state/          # Zustand store
│   ├── env.ts          # Environment validation
│   └── utils.ts
└── server/
    ├── azure/          # Azure service integrations
    ├── db/             # Database layer
    │   ├── client.ts   # PostgreSQL connection
    │   ├── collections.ts # Card collections
    │   ├── conversations.ts # Conversations
    │   ├── schema.ts   # Database schema
    │   └── settings.ts # App settings
    └── services/       # Business logic
```

## 🔧 Configuration

### Demo Mode (Development)

For development without Azure credentials:
- Uses demo cards from `src/lib/constants/demoCards.ts`
- No AI generation or image search
- In-memory state only

### Production Mode

Requires all environment variables:
- Azure OpenAI for card generation
- Unsplash API for visual suggestions
- PostgreSQL for persistence

## 🎨 Predefined Conversation Topics

1. **Daily Routine** - Waking up, getting ready, going to school
2. **Feelings & Emotions** - Identifying and discussing emotions
3. **Food & Meals** - Food preferences and eating habits
4. **Favorite Activities** - Games, hobbies, and fun activities
5. **School & Learning** - Classes, friends, and school experiences
6. **Bedtime Routine** - Evening rituals and sleep preparation
7. **Family Time** - Family activities and relationships
8. **Staying Safe** - Safety at home, school, and outdoors

## 🗄️ Database Schema

### conversation_session
- `id` (uuid) - Primary key
- `parent_id` (text) - Parent identifier
- `child_id` (text) - Child identifier
- `started_at` (timestamptz) - Session start time

### visual_card
- `id` (uuid) - Primary key
- `session_id` (uuid) - Foreign key (cascade delete)
- `title` (text) - Card title
- `description` (text) - Card description
- `image_url` (text) - Card image URL
- `category` (text) - "topic", "action", "emotion", "response"
- `created_at` (timestamptz) - Creation timestamp

### utterance
- `id` (uuid) - Primary key
- `session_id` (uuid) - Foreign key (cascade delete)
- `speaker` (text) - "parent" or "child"
- `card_id` (uuid, nullable) - Foreign key to visual_card
- `transcript` (text) - Text content of utterance
- `recording_url` (text) - Audio recording URL
- `created_at` (timestamptz) - Creation timestamp

### app_settings
- `id` (uuid) - Primary key
- `key` (text, unique) - Setting key name
- `value` (text) - Setting value
- `is_encrypted` (boolean) - Whether value is encrypted
- `description` (text) - Setting description
- `updated_at` (timestamptz) - Last update time
- `created_at` (timestamptz) - Creation timestamp

### card_collection
- `id` (uuid) - Primary key
- `name` (text) - Collection name
- `user_id` (text) - User identifier
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update time

### card_order
- `id` (uuid) - Primary key
- `collection_id` (uuid) - Foreign key (cascade delete)
- `card_id` (uuid) - Card identifier
- `card_data` (jsonb) - Full card data
- `position` (integer) - Order position in collection
- `created_at` (timestamptz) - Creation timestamp

## 🚢 Deployment

### Docker Deployment

The application is fully containerized and can be deployed to any cloud service or on-premises infrastructure.

**Quick Start with Docker Compose:**

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your credentials
nano .env

# 3. Build and start services
docker-compose up --build -d

# 4. Access the application
open http://localhost:3001
```

**What's Included:**
- Multi-stage optimized Next.js Docker image
- PostgreSQL database with automatic schema initialization
- Health checks and automatic restart policies
- Volume persistence for database data
- Production-ready configuration

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guides for each platform.

### Azure Native Deployment

**Azure Resources Needed:**

1. **Azure App Service** (Linux, Node.js 18+) or **Container Instances**
2. **Azure OpenAI Service** (GPT-4o deployment)
3. **Azure Database for PostgreSQL Flexible Server**
4. **Application Insights** (optional, for monitoring)

**External Services:**
- Unsplash API (free image search)

### Deployment Steps

1. Provision Azure resources
2. Configure App Service environment variables
3. Enable Managed Identity for OpenAI access
4. Configure PostgreSQL firewall rules
5. Deploy code via GitHub Actions or Azure CLI

## 🔒 Security

- API keys stored server-side only (environment variables)
- DefaultAzureCredential for Azure service authentication
- PostgreSQL connections over SSL
- Input validation on all API endpoints
- No sensitive data exposed to frontend

## 📄 License

MIT

## 🙏 Acknowledgments

- Inspired by ABA (Applied Behavior Analysis) principles
- Research on visual supports for autism communication
- Azure AI services for accessibility
- shadcn/ui for beautiful, accessible components

---

**Note**: The `.old/` directory contains the original proof-of-concept implementation and is kept for reference only. All active development occurs in the `src/` directory.

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)

