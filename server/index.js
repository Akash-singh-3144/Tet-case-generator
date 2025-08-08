const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const AI_API_KEY = process.env.AI_API_KEY; // For Gemini or OpenAI

// Check for required environment variables
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.error('❌ Missing required environment variables:');
  console.error('   - GITHUB_CLIENT_ID');
  console.error('   - GITHUB_CLIENT_SECRET');
  console.error('');
  console.error('📝 Please create a .env file in the server directory with:');
  console.error('   GITHUB_CLIENT_ID=your_github_client_id_here');
  console.error('   GITHUB_CLIENT_SECRET=your_github_client_secret_here');
  console.error('');
  console.error('🔗 Create a GitHub OAuth App at: https://github.com/settings/developers');
  console.error('   - Homepage URL: https://tet-case-generator.vercel.app');
  console.error('   - Authorization callback URL: https://tet-case-generator.onrender.com/auth/github/callback');
  process.exit(1);
}

// Store user sessions (in production, use Redis or database)
const userSessions = new Map();

// GitHub OAuth endpoints
app.get('/auth/github', (req, res) => {
  const redirectUri = `${req.protocol}://${req.get('host')}/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo`;
  res.json({ authUrl: githubAuthUrl });
});

app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: { Accept: 'application/json' }
    });

    const { access_token } = response.data;
    const sessionId = Math.random().toString(36).substring(2);
    
    userSessions.set(sessionId, { accessToken: access_token });
    
    res.redirect(`https://tet-case-generator.vercel.app/dashboard?session=${sessionId}`);
  } catch (error) {
    console.error('OAuth error:', error);
    res.redirect('https://tet-case-generator.vercel.app/?error=auth_failed');
  }
});

// API endpoints
app.get('/api/user', async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = userSessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const octokit = new Octokit({ auth: session.accessToken });
    const { data: user } = await octokit.rest.users.getAuthenticated();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/repositories', async (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = userSessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const octokit = new Octokit({ auth: session.accessToken });
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100
    });
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

app.get('/api/repository/:owner/:repo/contents', async (req, res) => {
  const { owner, repo } = req.params;
  const { path = '' } = req.query;
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = userSessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const octokit = new Octokit({ auth: session.accessToken });
    const { data: contents } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path
    });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repository contents' });
  }
});

app.post('/api/generate-test-summaries', async (req, res) => {
  const { files } = req.body;
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = userSessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const testSummaries = [];
    
    for (const file of files) {
      const prompt = `Analyze the following code and generate a comprehensive test case summary:

File: ${file.name}
Language: ${getLanguageFromExtension(file.name)}
Code:
${file.content}

Please provide:
1. A brief description of what this code does
2. List of test scenarios that should be covered
3. Edge cases to consider
4. Suggested test framework (JUnit, Jest, pytest, etc.)
5. Mock requirements if any

Format the response as a structured summary.`;

      // Simulate AI API call (replace with actual API)
      const aiResponse = await generateAIResponse(prompt);
      
      testSummaries.push({
        fileName: file.name,
        language: getLanguageFromExtension(file.name),
        summary: aiResponse,
        filePath: file.path
      });
    }
    
    res.json({ testSummaries });
  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({ error: 'Failed to generate test summaries' });
  }
});

app.post('/api/generate-test-code', async (req, res) => {
  const { fileName, language, summary, originalCode } = req.body;
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = userSessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const prompt = `Based on the following test summary and original code, generate complete, executable test code:

Original File: ${fileName}
Language: ${language}
Test Summary: ${summary}
Original Code: ${originalCode}

Generate comprehensive test code that:
1. Uses appropriate testing framework for ${language}
2. Covers all scenarios mentioned in the summary
3. Includes proper setup and teardown
4. Has clear, descriptive test names
5. Includes comments explaining complex test logic

Return only the test code, properly formatted and ready to run.`;

    const testCode = await generateAIResponse(prompt);
    
    res.json({ 
      testCode,
      fileName: `${fileName.replace(/\.[^/.]+$/, '')}.test.${getFileExtension(language)}`,
      language
    });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ error: 'Failed to generate test code' });
  }
});

app.post('/api/create-pull-request', async (req, res) => {
  const { owner, repo, testCode, fileName, branch = 'generated-tests' } = req.body;
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = userSessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const octokit = new Octokit({ auth: session.accessToken });
    
    // Get the default branch SHA
    const { data: ref } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: 'heads/main'
    });
    
    // Create new branch
    await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: ref.object.sha
    });
    
    // Create file
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `tests/${fileName}`,
      message: `Add generated test: ${fileName}`,
      content: Buffer.from(testCode).toString('base64'),
      branch
    });
    
    // Create pull request
    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: `Generated tests: ${fileName}`,
      head: branch,
      base: 'main',
      body: `Auto-generated test cases for improved code coverage.\n\nGenerated by Test Case Generator App.`
    });
    
    res.json({ pullRequest: pr });
  } catch (error) {
    console.error('PR creation error:', error);
    res.status(500).json({ error: 'Failed to create pull request' });
  }
});

// Helper functions
function getLanguageFromExtension(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  const languageMap = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby'
  };
  return languageMap[extension] || 'unknown';
}

function getFileExtension(language) {
  const extensionMap = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    csharp: 'cs',
    go: 'go',
    rust: 'rs',
    php: 'php',
    ruby: 'rb'
  };
  return extensionMap[language] || 'txt';
}

async function generateAIResponse(prompt) {
  // This is a placeholder for AI API integration
  // Replace with actual API calls to Gemini, OpenAI, or other AI services
  
  if (AI_API_KEY) {
    try {
      // Example for OpenAI-compatible API
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI API error:', error);
    }
  }
  
  // Fallback mock response
  return `Mock AI Response for testing purposes.\n\nThis would contain the actual AI-generated content based on the prompt:\n\n${prompt.substring(0, 200)}...`;
}

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: https://tet-case-generator.vercel.app`);
  console.log(`🔗 GitHub OAuth callback: https://tet-case-generator.onrender.com/auth/github/callback`);
  console.log('');
  if (!AI_API_KEY) {
    console.log('⚠️  AI_API_KEY not set - using mock responses for test generation');
  }
});