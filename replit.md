# Overview

RadiologyScope is a local-first radiology reporting application that enables radiologists to create, manage, and format reports efficiently. The system combines speech recognition for voice dictation, AI-powered formatting through OpenAI integration, and comprehensive report management. Built as a full-stack TypeScript application, it prioritizes offline functionality with local storage as the primary data persistence mechanism, while providing optional cloud database support through PostgreSQL.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses React with TypeScript, built on Vite for fast development and bundling. The UI is constructed with shadcn/ui components and Radix UI primitives, styled with Tailwind CSS. State management is handled through React hooks and context, with TanStack Query for server state when needed. The application implements a single-page architecture with wouter for lightweight routing.

## Backend Architecture  
The server is an Express.js application that provides REST API endpoints for report and settings management. It uses a dual-storage approach with an in-memory storage implementation (MemStorage) as the default, while being structured to support database storage through Drizzle ORM with PostgreSQL. The server handles AI integration with OpenAI for report formatting and includes middleware for request logging and error handling.

## Data Storage Strategy
The application implements a "local-first" approach where data is primarily stored in the browser's localStorage. This ensures the application functions completely offline while providing instant access to user data. Reports and settings are automatically persisted locally, with the option to sync to a PostgreSQL database when available. The storage layer abstracts between local and remote storage through a common interface.

## Speech Recognition Integration
Native browser speech recognition capabilities are utilized for voice dictation functionality. The system includes comprehensive error handling and permission management for microphone access, with fallback support for browsers that don't support speech recognition. Transcribed content can be edited manually and is integrated with the AI formatting pipeline.

## AI-Powered Content Processing
OpenAI integration provides intelligent formatting of voice transcriptions into professional radiology reports. Users can configure their own API keys, and the system handles structured report generation with proper medical formatting. The AI service transforms raw dictated content into standardized radiology report formats.

## Export and Document Generation  
The application supports multiple export formats including PDF and DOCX generation for finalized reports. Export functionality is handled client-side using libraries like jsPDF and docx, ensuring reports can be generated without server dependency.

# External Dependencies

## Core Framework Dependencies
- **React 18** - Frontend framework with modern hooks and concurrent features
- **Express.js** - Backend web framework for REST API
- **TypeScript** - Type safety across the entire application
- **Vite** - Build tool and development server with hot reload

## UI and Styling
- **Radix UI** - Comprehensive set of accessible UI primitives
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Icon library for consistent iconography

## Database and ORM
- **Drizzle ORM** - Type-safe SQL ORM for PostgreSQL integration
- **@neondatabase/serverless** - PostgreSQL driver for serverless environments
- **Zod** - Schema validation for type-safe data handling

## AI and External Services  
- **OpenAI API** - GPT integration for intelligent report formatting
- **Browser Speech Recognition API** - Native voice dictation capabilities

## Document Processing
- **jsPDF** - Client-side PDF generation for report exports
- **docx** - Microsoft Word document generation library
- **date-fns** - Date manipulation and formatting utilities

## Development and Build Tools
- **ESBuild** - Fast JavaScript bundler for production builds
- **PostCSS & Autoprefixer** - CSS processing and vendor prefixing
- **TanStack Query** - Server state management and caching