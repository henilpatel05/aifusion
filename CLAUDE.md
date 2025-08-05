# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application called "AI Fusion" that allows users to combine two concepts and generate AI-created images and descriptions using Google's Gemini API. The app features:

- Image generation using Gemini's Imagen model
- Text generation for descriptions and lore using Gemini Flash
- Interactive UI with animated background scroller
- Client-side API integration with exponential backoff retry logic

## Architecture

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with custom animations
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **AI Integration**: Google Gemini API (Imagen 3.0 for images, Gemini 2.5 Flash for text)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Key Architecture Details

### Component Structure
- Single page application with main component `AIFusionPage` in `app/page.tsx`
- Uses React hooks for state management (no external state library)
- Background scroller component creates animated image wall effect

### API Integration
- Server-side API routes for secure Gemini API access (`/api/*`)
- Rate limiting and input validation on all endpoints
- API key secured server-side in `GEMINI_API_KEY` environment variable
- Client-side calls to local API routes with proper error handling

### State Management
- Multiple useState hooks for form inputs, loading states, and results
- Loading states tracked separately for image and text generation
- Error state management with user feedback

### Styling Approach
- Tailwind CSS with custom gradient backgrounds
- Glass morphism effects with backdrop-blur
- Custom animations defined in globals.css
- Responsive design with mobile-first approach

## Environment Configuration

The application requires:
- `GEMINI_API_KEY`: Google Gemini API key for AI functionality (server-side only, keep secure in `.env.local`)

## File Structure Notes

- `app/layout.tsx`: Root layout with font configuration
- `app/page.tsx`: Main application component (single-page app)
- `app/globals.css`: Global styles and custom animations
- TypeScript configuration uses `@/*` path mapping for imports