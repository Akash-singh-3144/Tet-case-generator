import React, { useState } from 'react';
import { Github, Zap, Shield, Code } from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true);
      const { authUrl } = await apiService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      toast.error('Failed to initiate GitHub login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Github className="h-16 w-16 text-gray-900" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Test Case Generator
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            AI-powered test generation for your GitHub repositories
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-700">AI-powered test generation</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-700">Secure GitHub integration</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
              <Code className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-700">Multi-language support</span>
            </div>
          </div>

          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Github className="h-5 w-5 mr-2" />
            {isLoading ? 'Connecting...' : 'Continue with GitHub'}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}