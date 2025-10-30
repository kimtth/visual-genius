# 🪅 Visual Genius: Communication Assistant for ASD

Visual Genius is an application that helps facilitate communication between parents and children with autism spectrum disorders (ASD) through visual cards and structured conversations.

> [!IMPORTANT]  
> This application was developed for proof-of-concept purposes. Please make sure to test and verify its features before using it.

- **Teach mode**: Uses visual cards inspired by Applied Behavior Analysis (ABA) and addresses problems of existing solutions. Examples of visual aid products on the market, These products can be quite costly: [Bing Search Results](https://www.bing.com/images/search?q=ASD+for+visual+aids), [Amazon Search Result](https://www.amazon.com/Special-Communication-Speech-Verbal-Children/dp/B08CFNDHYY).
- **Communication mode**: Uses cards inspired by this paper: [AACessTalk](https://www.eurekalert.org/news-releases/1084528).
- **Letterboard**: Inspired by the book [The Reason I Jump](https://www.amazon.com/Reason-Jump-Inner-Thirteen-Year-Old-Autism/dp/0812994868).

## 🎡 Screens

<table>
  <tr>
    <td width="33%" align="center">
      <figure>
        <img src="./docs/teach.png" alt="Teach: Teaching words with Visual Cards" width="220" />
        <figcaption><strong>Teach</strong><br/>Teaching words with visual cards</figcaption>
      </figure>
    </td>
    <td width="33%" align="center">
      <figure>
        <img src="./docs/parent.png" alt="Parent: Start Conversation Session" width="220" />
        <figcaption><strong>Parent</strong><br/>Start conversation session</figcaption>
      </figure>
    </td>
    <td width="33%" align="center">
      <figure>
        <img src="./docs/child.png" alt="Child: Interact with conversation cards" width="220" />
        <figcaption><strong>Child</strong><br/>Interact with conversation cards</figcaption>
      </figure>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center">
      <figure>
        <img src="./docs/letterboard.png" alt="Letterboard: Spell-based communication" width="220" />
        <figcaption><strong>Letterboard</strong><br/>Spell-based communication</figcaption>
      </figure>
    </td>
    <td width="33%" align="center">
      <figure>
        <img src="./docs/signin.png" alt="Sign In & Sign Up" width="220" />
        <figcaption><strong>Auth</strong><br/>Sign in & sign up</figcaption>
      </figure>
    </td>
    <td width="33%" align="center">
      <figure>
        <img src="./docs/settings.png" alt="Settings: API key & session management" width="220" />
        <figcaption><strong>Settings</strong><br/>API key & session management</figcaption>
      </figure>
    </td>
  </tr>
</table>

## 🌟 Features

### 1. **Parent Interface** - Conversation Facilitation
Start and manage conversations with your child using:
- 8 Predefined Topics: Daily routines, emotions, food, activities, school, bedtime, family, safety
- Custom Prompts: Create conversation starters for any situation
- Real-time State Management: Start, pause, resume, or stop conversations
- Quick Response Tracking: Yes/No/"I don't know" buttons
- Conversation Timeline: View complete interaction history

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
POSTGRES_URL=postgres://user:password@hostname:5432/database

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://<your-openai-name>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=<gpt-deployment-name>

# Unsplash Image Search (Free)
# Get your free API key at: https://unsplash.com/developers
UNSPLASH_ACCESS_KEY=<your-unsplash-access-key>
```

**Note**: Settings in the database override `.env.local` values.

### 4. Initialize Database

The application will automatically create required tables on first run:
- `conversation_session`
- `visual_card`
- `utterance`

### 5. Start Development Server

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
# docker compose up --build -d → Only builds/starts the app, not postgres
docker compose --profile local-db up --build -d # → Builds/starts both postgres and app

# 4. Access the application
open http://localhost:3001
```

### Azure Native Deployment

**Azure Resources Needed:**

1. **Azure App Service** (Linux, Node.js 18+) or **Container Instances**
2. **Azure OpenAI Service** 
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

