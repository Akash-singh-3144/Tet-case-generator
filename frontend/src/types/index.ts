export interface User {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  updated_at: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  content?: string;
  download_url?: string;
}

export interface TestSummary {
  fileName: string;
  language: string;
  summary: string;
  filePath: string;
}

export interface GeneratedTest {
  testCode: string;
  fileName: string;
  language: string;
}