import React, { useState } from 'react';
import { Copy, Download, GitPullRequest, Check } from 'lucide-react';
import { GeneratedTest, TestSummary } from '../../types';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface CodeEditorProps {
  test: GeneratedTest & { summary: TestSummary };
  owner: string;
  repo: string;
}

export function CodeEditor({ test, owner, repo }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [creatingPR, setCreatingPR] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(test.testCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([test.testCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = test.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  const handleCreatePR = async () => {
    try {
      setCreatingPR(true);
      const result = await apiService.createPullRequest({
        owner,
        repo,
        testCode: test.testCode,
        fileName: test.fileName
      });
      
      toast.success('Pull request created successfully!');
      window.open(result.pullRequest.html_url, '_blank');
    } catch (error) {
      toast.error('Failed to create pull request');
    } finally {
      setCreatingPR(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900">{test.fileName}</h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              {test.language}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </button>
            
            <button
              onClick={handleCreatePR}
              disabled={creatingPR}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <GitPullRequest className="h-3 w-3 mr-1" />
              {creatingPR ? 'Creating...' : 'Create PR'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-0">
        <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm leading-relaxed">
          <code>{test.testCode}</code>
        </pre>
      </div>
    </div>
  );
}