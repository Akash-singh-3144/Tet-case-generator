import React, { useState } from 'react';
import { Code, Loader, ExternalLink } from 'lucide-react';
import { TestSummary, GeneratedTest } from '../../types';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface TestSummaryCardProps {
  summary: TestSummary;
  originalCode: string;
  onTestGenerated: (test: GeneratedTest & { summary: TestSummary }) => void;
}

export function TestSummaryCard({ summary, originalCode, onTestGenerated }: TestSummaryCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCode = async () => {
    try {
      setIsGenerating(true);
      const result = await apiService.generateTestCode({
        fileName: summary.fileName,
        language: summary.language,
        summary: summary.summary,
        originalCode
      });
      
      onTestGenerated({ ...result, summary });
      toast.success('Test code generated successfully!');
    } catch (error) {
      toast.error('Failed to generate test code');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Code className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            {summary.fileName}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {summary.language}
          </span>
        </div>
        
        <button
          onClick={handleGenerateCode}
          disabled={isGenerating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader className="animate-spin h-4 w-4 mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Code className="h-4 w-4 mr-2" />
              Generate Code
            </>
          )}
        </button>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-700">
          {summary.summary}
        </div>
      </div>
      
      <div className="mt-4 flex items-center text-xs text-gray-500">
        <ExternalLink className="h-3 w-3 mr-1" />
        <span>Path: {summary.filePath}</span>
      </div>
    </div>
  );
}