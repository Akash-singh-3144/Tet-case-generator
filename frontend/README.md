# Test Case Generator Web Application

A comprehensive full-stack application that integrates with GitHub to generate AI-powered test cases for your code repositories.

## Features

- **GitHub OAuth Integration**: Secure authentication and repository access
- **Repository Browser**: Clean, intuitive interface to browse and select files
- **AI-Powered Test Generation**: Generate comprehensive test case summaries and full test code
- **Multi-Language Support**: Supports JavaScript, TypeScript, Python, Java, and more
- **Code Editor**: Syntax-highlighted editor for reviewing generated tests
- **Pull Request Creation**: Automatically create PRs with generated test code
- **Modern UI**: Clean, responsive design with loading states and error handling

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- React Hot Toast for notifications
- Monaco Editor for code editing

### Backend
- Node.js with Express
- GitHub API integration via Octokit
- AI integration (OpenAI/Gemini compatible)
- CORS enabled for cross-origin requests

## Setup Instructions

### 1. GitHub OAuth App Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: `Test Case Generator`
   - Homepage URL: `https://tet-case-generator.vercel.app`
   - Authorization callback URL: `https://tet-case-generator.onrender.com/auth/github/callback`
4. Copy the Client ID and Client Secret

### 2. Environment Configuration

1. Copy `.env.example` to `.env` in the root directory
2. Fill in your credentials:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
AI_API_KEY=your_ai_api_key
PORT=3001
```

### 3. Installation

```bash
# Install dependencies
npm install

# Install server dependencies
cd server && npm install
```

### 4. Running the Application

```bash
# Terminal 1: Start the backend server
npm run dev:server

# Terminal 2: Start the frontend development server
npm run dev
```

The application will be available at:
- Frontend: https://tet-case-generator.vercel.app
- Backend API: https://tet-case-generator.onrender.com

## Usage

1. **Login**: Click "Continue with GitHub" to authenticate
2. **Select Repository**: Choose a repository from your GitHub account
3. **Select Files**: Browse and select code files you want to generate tests for
4. **Generate Summaries**: Click "Generate Tests" to create AI-powered test summaries
5. **Generate Code**: Click "Generate Code" on any summary to create full test code
6. **Review & Export**: Copy, download, or create a pull request with the generated tests

## AI Integration

The application supports multiple AI providers:

- **OpenAI**: Set `AI_API_KEY` to your OpenAI API key
- **Gemini**: Configure for Google's Gemini API
- **Custom APIs**: Modify the `generateAIResponse` function in `server/index.js`

Without an API key, the application will use mock responses for demonstration.

## Architecture

```
test-case-generator/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   │   ├── Auth/               # Authentication components
│   │   ├── Dashboard/          # Main dashboard
│   │   ├── Files/              # File explorer
│   │   ├── Layout/             # Layout components
│   │   └── Testing/            # Test generation components
│   ├── services/               # API service layer
│   ├── types/                  # TypeScript type definitions
│   └── App.tsx                 # Main application component
├── server/                      # Backend Node.js application
│   └── index.js                # Express server with API routes
└── README.md                   # This file
```

## API Endpoints

- `GET /auth/github` - Initialize GitHub OAuth
- `GET /auth/github/callback` - Handle OAuth callback
- `GET /api/user` - Get authenticated user info
- `GET /api/repositories` - Get user repositories
- `GET /api/repository/:owner/:repo/contents` - Get repository contents
- `POST /api/generate-test-summaries` - Generate test summaries
- `POST /api/generate-test-code` - Generate full test code
- `POST /api/create-pull-request` - Create GitHub pull request

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Security

- All GitHub tokens are handled securely server-side
- No sensitive data is stored in localStorage
- CORS is properly configured
- API keys are kept in environment variables

## Support

For issues and questions, please create an issue in the GitHub repository.