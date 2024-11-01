# RankShare MVP - Product Requirements Document

Version 1.0 | October 31, 2024

## 1. Product Overview

RankShare is a web application that enables users to create and share ranked lists of recommendations. The MVP will focus on essential features to validate core functionality and user value.

### Core Value Proposition
- Allow users to create, manage, and share ranked lists of items in specific categories (movies, TV shows, books, restaurants).

### MVP Target Audience
- Primary: Users who enjoy creating and sharing curated lists
- Secondary: Users seeking recommendations in specific categories

## 2. MVP Core Features

### 2.1 Authentication (Week 1)
- Simple email/password or social login using Clerk
- Basic user profile with username and email
- Protected routes for authenticated features
- Public routes for viewing shared lists

### 2.2 List Management (Week 2-3)
#### Create & Edit Lists
- Title (required)
- Category selection (movies, TV shows, books, restaurants)
- Add/remove items
- Drag-and-drop ranking
- Basic description field
- Privacy setting (public/private)

#### List Item Structure
- Title (required)
- Rank (auto-assigned based on position)
- Optional brief comment/review
- Maximum 50 items per list

### 2.3 List Viewing (Week 3)
- Clean, readable layout
- Responsive design for mobile/desktop
- Share button with copyable link
- Basic list metadata (creator, date, category)

### 2.4 Discovery (Week 4)
- Simple search by list title
- Category-based browsing
- Recent public lists feed
- Basic sorting (newest, most viewed)

## 3. Technical Requirements

### 3.1 Tech Stack
- Framework: Next.js 14 (App Router)
- Auth: Clerk
- Database: MongoDB, using Mongoose
- UI: Tailwind CSS + shadcn/ui
- State Management: React Query

### 3.2 Data Models

```typescript
interface User {
  id: string;
  clerkId: string;
  username: string;
  email: string;
  createdAt: Date;
}

interface List {
  id: string;
  ownerId: string;
  title: string;
  category: 'movies' | 'tv-shows' | 'books' | 'restaurants';
  description?: string;
  items: ListItem[];
  privacy: 'public' | 'private';
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

interface ListItem {
  id: string;
  title: string;
  rank: number;
  comment?: string;
}
```

### 3.3 Key API Endpoints

```typescript
// Lists
GET    /api/lists          // Get public lists (paginated)
POST   /api/lists          // Create new list
GET    /api/lists/:id      // Get single list
PUT    /api/lists/:id      // Update list
DELETE /api/lists/:id      // Delete list

// Search
GET    /api/search?q=:query&category=:category  // Search lists
```

## 4. MVP Scope Limitations

### 4.1 Explicitly Excluded Features
- Social features (following, likes)
- Comments/discussions
- Advanced analytics
- Tags/categories beyond initial four
- List collaboration
- Advanced search filters
- User profiles/customization
- Notifications

### 4.2 Performance Requirements
- Page load under 3 seconds
- List operations under 1 second
- Support up to 50 items per list
- Basic error handling
- Mobile-responsive design

## 5. MVP Success Metrics
- User signup completion rate
- List creation rate
- List sharing rate
- Return visitor rate
- Basic error tracking

## 6. Development Timeline

**Total: 4 Weeks**

### Week 1: Authentication & Project Setup
- Set up Next.js project
- Implement Clerk auth
- Create database schema
- Set up basic routing

### Week 2: List Creation
- Create list form
- Drag-and-drop ranking
- Basic list CRUD operations
- Privacy controls

### Week 3: List Viewing & Sharing
- List display components
- Share functionality
- Responsive design
- View counting

### Week 4: Discovery & Polish
- Search implementation
- Category browsing
- Bug fixes
- Performance optimization

## 7. Technical Considerations

### 7.1 Security
- Input validation
- Rate limiting
- Authentication checks
- XSS prevention

### 7.2 Performance
- Server-side rendering for public lists
- Client-side caching with React Query
- Optimistic updates for better UX
- Lazy loading for list items

### 7.3 Monitoring
- Basic error logging
- View tracking
- Performance monitoring

## 8. File Structure

```
src/
├── app/
│   ├── (auth)/                    # Authentication routes
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx
│   ├── lists/                     # List-related routes
│   │   ├── [id]/                  # Individual list routes
│   │   │   ├── edit/
│   │   │   │   └── page.tsx      # Edit list page
│   │   │   └── page.tsx          # View list page
│   │   ├── create/
│   │   │   └── page.tsx          # Create new list
│   │   └── page.tsx              # Lists overview
│   ├── api/                       # API routes
│   │   ├── lists/
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts      # GET, PUT, DELETE single list
│   │   │   │   └── items/
│   │   │   │       └── route.ts  # Manage list items
│   │   │   └── route.ts          # GET, POST lists
│   │   └── search/
│   │       └── route.ts          # Search functionality
│   ├── search/
│   │   └── page.tsx              # Search page
│   ├── error.tsx                 # Error boundary
│   ├── loading.tsx               # Loading state
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/
│   ├── layout/                   # Layout components
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── lists/                    # List-related components
│   │   ├── list-card.tsx        # List preview card
│   │   ├── list-form.tsx        # Create/edit form
│   │   ├── list-item.tsx        # Individual list item
│   │   ├── item-manager.tsx     # Drag-and-drop manager
│   │   └── privacy-toggle.tsx   # Privacy settings
│   ├── search/
│   │   ├── search-bar.tsx
│   │   └── search-results.tsx
│   └── ui/                      # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── toast.tsx
│       └── toaster.tsx
│
├── lib/                         # Utilities and business logic
│   ├── db/                      # Database utilities
│   │   ├── client.ts           # MongoDB client
│   │   └── models/             # MongoDB models/schemas
│   │       ├── list.ts
│   │       └── user.ts
│   ├── validations/            # Form validations
│   │   └── list.ts            # List schema validation
│   ├── utils.ts                # General utilities
│   └── constants.ts            # App constants
│
├── hooks/                      # Custom React hooks
│   ├── use-lists.ts           # List management
│   ├── use-search.ts          # Search functionality
│   └── use-toast.ts           # Toast notifications
│
├── types/                     # TypeScript types
│   ├── list.ts               # List-related types
│   └── api.ts                # API-related types
│
├── middleware.ts             # Clerk authentication middleware
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
└── .env.local               # Environment variables
```

### Key Files to Implement First:

```typescript
// 1. src/types/list.ts - Core types
export interface List {
  id: string;
  title: string;
  category: 'movies' | 'tv-shows' | 'books' | 'restaurants';
  items: ListItem[];
  privacy: 'public' | 'private';
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListItem {
  id: string;
  title: string;
  rank: number;
  comment?: string;
}

// 2. src/lib/db/client.ts - Database connection
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Missing MONGODB_URI');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable to preserve the value
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client
  client = new MongoClient(process.env.MONGODB_URI);
  clientPromise = client.connect();
}

export default clientPromise;

// 3. src/lib/validations/list.ts - Validation schemas
import { z } from 'zod';

export const listItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  rank: z.number().min(1),
  comment: z.string().optional(),
});

export const listSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  category: z.enum(['movies', 'tv-shows', 'books', 'restaurants']),
  items: z.array(listItemSchema).min(1, 'Add at least one item'),
  privacy: z.enum(['public', 'private']),
});
```

This structure follows these principles:
- Feature-first organization
- Clear separation of concerns
- Scalable for future features
- Easy to navigate and maintain
- Follows Next.js 14 best practices