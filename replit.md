# TechPulse - AI-Powered Tech News & Discussion Platform

## Overview

TechPulse is a modern, mobile-first tech news aggregator that centralizes trending stories from multiple sources (TechCrunch, The Verge, Hacker News, RSS feeds) and provides an AI-powered chat interface for intelligent discussion and analysis. The platform features a clean, responsive news feed with category filtering, search capabilities, bookmarking, sentiment analysis, and real-time AI assistance for article comprehension and discussion.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)

### Landing Page Implementation
- Restored landing page as entry point (`/`) with auto-redirect to news feed (`/news`)
- Landing page features hero section, feature highlights, and 3-second auto-redirect
- News feed now accessible at `/news` route instead of root
- Header logo now links back to news feed for easy navigation
- Maintains seamless user experience while providing proper landing page introduction

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Replit Auth integration with session-based authentication

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket implementation for live updates
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon serverless platform
- **ORM**: Drizzle with schema-first approach and automatic type generation
- **Session Storage**: Database-backed sessions for authentication persistence
- **Schema Structure**:
  - Users table for authentication and preferences
  - Articles table with categorization, sentiment analysis, and view tracking
  - Sources table for RSS feed management and fetching intervals
  - Bookmarks table for user-specific article saving
  - Chat conversations for AI interaction history
  - Trending records for analytics and topic tracking
  - Related articles for content discovery

### Authentication and Authorization
- **Provider**: Replit Auth with OpenID Connect (OIDC)
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Security**: HTTP-only cookies with secure flag and session expiration
- **User Management**: Automatic user creation and profile management

### AI Integration
- **Provider**: OpenAI GPT-4o for chat and analysis capabilities
- **Features**:
  - Article summarization (short, medium, long formats)
  - Context-aware question answering
  - Sentiment analysis for articles and topics
  - Related article suggestions
  - Technical concept explanations
- **Context Management**: Article content injection for relevant AI responses

### News Aggregation System
- **Sources**: Configurable RSS feeds from major tech publications
- **Processing**: Periodic fetching with configurable intervals per source
- **Content Enhancement**: 
  - Automatic categorization (AI/ML, Startups, Cybersecurity, Mobile, Web3, Others)
  - Sentiment analysis and scoring
  - View count tracking and trending calculations
  - Related article detection and linking

### Mobile-First Design
- **Responsive Layout**: Adaptive interface for desktop and mobile devices
- **Mobile Chat**: Dedicated mobile chat interface for article discussions
- **Touch Interactions**: Optimized for mobile gestures and navigation
- **Progressive Enhancement**: Core functionality works across all device types

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth OIDC provider
- **Build Tool**: Vite with React plugin and development tooling

### AI and Machine Learning
- **OpenAI API**: GPT-4o model for chat, summarization, and sentiment analysis
- **Natural Language Processing**: Article content analysis and categorization

### News Sources and APIs
- **RSS Feeds**: TechCrunch, The Verge, Hacker News, and configurable sources
- **Content Parsing**: RSS feed parsing and content extraction
- **Web Scraping**: Article content retrieval for full-text analysis

### UI and Design System
- **shadcn/ui**: Pre-built React components with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon system
- **Font Awesome**: Additional icons and graphics

### Development and Deployment
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **Replit**: Development and hosting environment
- **WebSocket**: Real-time communication support

### Data Management
- **TanStack Query**: Caching, synchronization, and server state management
- **Drizzle Kit**: Database migrations and schema management
- **Date-fns**: Date manipulation and formatting
- **Zod**: Schema validation and type inference