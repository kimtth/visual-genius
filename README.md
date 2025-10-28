# 🪅 Visual Genius: Communication Assistant for ASD

Visual Genius is an application that helps facilitate communication between parents and children with autism spectrum disorders (ASD) through visual cards and structured conversations.

> [!IMPORTANT]  
> This application is developed in my spare time, so I cannot be sure when it will be ready.

- **Teach mode**: Uses visual cards inspired by Applied Behavior Analysis (ABA) and addresses problems of existing solutions. Examples of visual aid products on the market can be seen here: [Bing Search Results](https://www.bing.com/images/search?q=ASD+for+visual+aids). These products can be quite costly: [Amazon Search Result](https://www.amazon.com/Special-Communication-Speech-Verbal-Children/dp/B08CFNDHYY).
- **Communication mode**: Uses cards inspired by this paper: [AACessTalk](https://www.eurekalert.org/news-releases/1084528).
- **Letterboard**: Inspired by the book *The Reason I Jump*.

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
  - Bing Image Search (visual suggestions)

## 📋 Prerequisites

- Node.js 18+
- pnpm/npm/yarn
- Azure account with:
  - Azure OpenAI resource (GPT-4o deployment)
  - Bing Image Search API (Cognitive Services)
  - Azure Database for PostgreSQL Flexible Server

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

Create a `.env` file in the root directory:

```env
# PostgreSQL Connection
POSTGRES_URL=postgres://user:password@hostname:5432/visualgenius

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://<your-openai-name>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=<gpt-4o-deployment-name>

# Bing Image Search
BING_IMAGE_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/images/search
BING_IMAGE_SEARCH_KEY=<your-bing-search-key>
```

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
│   │   ├── parent/     # Parent conversation interface
│   │   ├── settings/   # Configuration
│   │   └── teach/      # Card creation
│   └── api/
│       ├── cards/      # Card generation endpoint
│       ├── conversations/ # Session management
│       └── speech/     # Interaction logging
├── components/
│   ├── cards/          # Card display components
│   ├── conversation/   # Timeline components
│   ├── layout/         # Navigation shell
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── constants/      # Presets and demo data
│   ├── state/          # Zustand store
│   └── utils.ts
└── server/
    ├── azure/          # Azure service integrations
    ├── db/             # Database layer
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
- Bing Image Search for visual suggestions
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
- `created_at` (timestamp)
- `status` (varchar) - "active", "paused", "completed"
- `metadata` (jsonb) - Additional session data

### visual_card
- `id` (uuid) - Primary key
- `title` (varchar)
- `description` (text)
- `image_url` (text)
- `category` (varchar) - "topic", "action", "emotion", "response"
- `session_id` (uuid) - Foreign key
- `created_at` (timestamp)

### utterance
- `id` (uuid) - Primary key
- `session_id` (uuid) - Foreign key
- `speaker` (varchar) - "parent" or "child"
- `content` (text)
- `card_id` (uuid, nullable) - Foreign key
- `created_at` (timestamp)

## 🚢 Deployment

### Azure Resources Needed

1. **Azure App Service** (Linux, Node.js 18+)
2. **Azure OpenAI Service** (GPT-4o deployment)
3. **Bing Search API** (Cognitive Services)
4. **Azure Database for PostgreSQL Flexible Server**
5. **Application Insights** (optional, for monitoring)

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

## 📈 Future Enhancements

### Near-term
- [ ] Audio recording and transcription (Azure AI Speech)
- [ ] Conversation analytics dashboard
- [ ] Export conversation logs as PDF
- [ ] Multi-child profile support

### Long-term
- [ ] Vector search for similar cards (pgvector)
- [ ] AI-suggested topics based on history
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] Role-based authentication (parent vs. child)

## 🤝 Contributing

This project is designed for educational and therapeutic purposes. Contributions that enhance accessibility, usability, or therapeutic value are welcome.

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

