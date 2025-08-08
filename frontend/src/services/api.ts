const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://tet-case-generator.onrender.com';

class ApiService {
  private sessionId: string | null = null;

  setSession(sessionId: string) {
    this.sessionId = sessionId;
    localStorage.setItem('sessionId', sessionId);
  }

  getSession(): string | null {
    if (!this.sessionId) {
      this.sessionId = localStorage.getItem('sessionId');
    }
    return this.sessionId;
  }

  clearSession() {
    this.sessionId = null;
    localStorage.removeItem('sessionId');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const sessionId = this.getSession();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId && { Authorization: `Bearer ${sessionId}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async getAuthUrl(): Promise<{ authUrl: string }> {
    return this.request('/auth/github');
  }

  async getUser() {
    return this.request('/api/user');
  }

  async getRepositories() {
    return this.request('/api/repositories');
  }

  async getRepositoryContents(owner: string, repo: string, path?: string) {
    const queryParam = path ? `?path=${encodeURIComponent(path)}` : '';
    return this.request(`/api/repository/${owner}/${repo}/contents${queryParam}`);
  }

  async generateTestSummaries(files: Array<{ name: string; content: string; path: string }>) {
    return this.request('/api/generate-test-summaries', {
      method: 'POST',
      body: JSON.stringify({ files }),
    });
  }

  async generateTestCode(data: {
    fileName: string;
    language: string;
    summary: string;
    originalCode: string;
  }) {
    return this.request('/api/generate-test-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPullRequest(data: {
    owner: string;
    repo: string;
    testCode: string;
    fileName: string;
    branch?: string;
  }) {
    return this.request('/api/create-pull-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();