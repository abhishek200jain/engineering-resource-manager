# Resource Management System - Backend

This is the backend service for the Resource Management System, a comprehensive solution for managing engineering resources and project assignments.

## 🛠 Technology Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcryptjs for password hashing
- **Development:** Nodemon for hot reloading

##  Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- MongoDB installed and running locally
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd resource-management-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/resource-management
   JWT_SECRET=your_jwt_secret_key
   ```

4. Seed the database (optional):
   ```bash
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

##  Project Structure

```
resource-management-backend/
├── config/
│   └── db.js              # Database configuration
├── controllers/
│   ├── assignmentController.js
│   ├── authController.js
│   ├── engineerController.js
│   └── projectController.js
├── middlewares/
│   ├── auth.middleware.js # JWT authentication middleware
│   └── role.middleware.js # Role-based access control
├── models/
│   ├── assignment.model.js
│   ├── project.model.js
│   └── user.model.js
├── routes/
│   ├── assignment.routes.js
│   ├── auth.routes.js
│   ├── engineer.routes.js
│   └── project.routes.js
└── scripts/
    └── seed.js           # Database seeding script
```

##  API Endpoints

All endpoints require authentication via JWT token unless specified otherwise.

### Authentication
- `POST /api/auth/login` - Login user (Public)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Engineers
- `GET /api/engineers` - Get all engineers (Accessible by: Manager, Engineer)
- `GET /api/engineers/:id/capacity` - Check engineer capacity (Accessible by: Manager)

### Projects
- `GET /api/projects` - Get all projects (Accessible by: Manager, Engineer)
- `GET /api/projects/:id` - Get project by ID (Accessible by: Manager, Engineer)
- `POST /api/projects` - Create new project (Accessible by: Manager)
- `PUT /api/projects/:id` - Update project (Accessible by: Manager)
- `DELETE /api/projects/:id` - Delete project (Accessible by: Manager)

### Assignments
- `GET /api/assignments` - Get all assignments (Accessible by: Manager, Engineer)
- `POST /api/assignments` - Create new assignment (Accessible by: Manager)
- `PUT /api/assignments/:id` - Update assignment (Accessible by: Manager)
- `DELETE /api/assignments/:id` - Delete assignment (Accessible by: Manager)

##  Authentication and Authorization

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🛠 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run seed` - Seed the database with initial data

##  Development

### Code Style
- Use consistent indentation (2 spaces)
- Follow the Express.js best practices
- Use async/await for handling asynchronous operations
- Implement proper error handling

### Error Handling
The API returns standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  License

This project is licensed under the ISC License. 


# Resource Management System - Frontend

This is the frontend application for the Resource Management System, built with React, TypeScript, and Vite.

## Tech Stack

- **React** - Frontend library
- **TypeScript** - Programming language
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - UI component library

## Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- npm or yarn package manager
- Backend API running (refer to backend README)

## Getting Started

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env` file in the root directory with the following variables:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Reusable React components
│   └── ui/        # UI component library
├── contexts/       # React context providers
├── lib/           # Utility functions and configurations
├── pages/         # Page components
└── services/      # API service functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Features

- User authentication and authorization
- Project management
- Resource assignments
- Skill gap analysis
- Team overview
- Timeline visualization

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

[Add your license here]

### Tools Used:
- **Cursor AI** – Used as the primary coding environment to assist with real-time code suggestions and file generation (models, routes, controllers).
- **ChatGPT** – Used for:
  - Generating boilerplate code for Express.js routes, Mongoose models, and authentication middleware
  - Designing API structures and validating architecture decisions
  - Writing seeding logic and validating `getAvailableCapacity()` & skill-matching logic
  - Debugging errors during early setup of JWT and MongoDB
- **Perplexity AI** – Used for:
  - Researching best practices in structuring fullstack Node.js + React apps
  - Confirming role-based access control logic patterns
  - Clarifying differences between REST conventions for engineers vs managers

### Responsible Usage:
- All AI-generated code was reviewed line-by-line.
- Logic was customized to meet assignment-specific requirements.
- Edge cases and error handling were manually added and tested.
- No code was blindly copy-pasted — everything was validated through local testing and logging.

### AI Challenges & Resolutions:
- AI occasionally generated overly generic middleware logic; this was refined manually.
- JWT-related logic required adjustment for multi-role access.
- Frontend form validation needed manual tuning beyond AI output to match React Hook Form + ShadCN standards.
