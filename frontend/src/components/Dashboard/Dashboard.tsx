import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Zap, Code2 } from 'lucide-react';
import { Repository, FileItem, TestSummary, GeneratedTest, User } from '../../types';
import { RepositoryList } from '../Repository/RepositoryList';
import { FileExplorer } from '../Files/FileExplorer';
import { TestSummaryCard } from '../Testing/TestSummaryCard';
import { CodeEditor } from '../Testing/CodeEditor';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [testSummaries, setTestSummaries] = useState<TestSummary[]>([]);
  const [generatedTests, setGeneratedTests] = useState<(GeneratedTest & { summary: TestSummary })[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);
  const [currentStep, setCurrentStep] = useState<'repos' | 'files' | 'summaries' | 'tests'>('repos');

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      setIsLoadingRepos(true);
      const repos = await apiService.getRepositories();
      setRepositories(repos);
    } catch (error) {
      toast.error('Failed to load repositories');
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleSelectRepository = (repo: Repository) => {
    setSelectedRepo(repo);
    setSelectedFiles([]);
    setTestSummaries([]);
    setGeneratedTests([]);
    setCurrentStep('files');
  };

  const handleFileSelect = (file: FileItem) => {
    setSelectedFiles(prev => [...prev, file]);
  };

  const handleFileDeselect = (file: FileItem) => {
    setSelectedFiles(prev => prev.filter(f => f.path !== file.path));
  };

  const handleGenerateTestSummaries = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    try {
      setIsGeneratingSummaries(true);
      const result = await apiService.generateTestSummaries(
        selectedFiles.map(f => ({
          name: f.name,
          content: f.content || '',
          path: f.path
        }))
      );
      
      setTestSummaries(result.testSummaries);
      setCurrentStep('summaries');
      toast.success('Test summaries generated successfully!');
    } catch (error) {
      toast.error('Failed to generate test summaries');
    } finally {
      setIsGeneratingSummaries(false);
    }
  };

  const handleTestGenerated = (test: GeneratedTest & { summary: TestSummary }) => {
    setGeneratedTests(prev => [...prev, test]);
    setCurrentStep('tests');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'repos':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Select a Repository
              </h2>
              <p className="text-gray-600">
                Choose a repository to generate test cases for its code files.
              </p>
            </div>
            <RepositoryList
              repositories={repositories}
              onSelectRepository={handleSelectRepository}
              isLoading={isLoadingRepos}
            />
          </div>
        );

      case 'files':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setCurrentStep('repos')}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to repositories
              </button>
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Select Files from {selectedRepo?.name}
                  </h2>
                  <p className="text-gray-600">
                    Choose the code files you want to generate tests for.
                  </p>
                </div>
                
                {selectedFiles.length > 0 && (
                  <button
                    onClick={handleGenerateTestSummaries}
                    disabled={isGeneratingSummaries}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isGeneratingSummaries ? 'Generating...' : `Generate Tests (${selectedFiles.length})`}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Repository Files
                  </h3>
                  <FileExplorer
                    owner={selectedRepo!.owner.login}
                    repo={selectedRepo!.name}
                    selectedFiles={selectedFiles}
                    onFileSelect={handleFileSelect}
                    onFileDeselect={handleFileDeselect}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedFiles.map((file) => (
                      <div
                        key={file.path}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded border"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <button
                          onClick={() => handleFileDeselect(file)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'summaries':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setCurrentStep('files')}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to file selection
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Test Case Summaries
              </h2>
              <p className="text-gray-600">
                Review the generated test summaries and generate full test code.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {testSummaries.map((summary, index) => {
                const originalFile = selectedFiles.find(f => f.name === summary.fileName);
                return (
                  <TestSummaryCard
                    key={`${summary.fileName}-${index}`}
                    summary={summary}
                    originalCode={originalFile?.content || ''}
                    onTestGenerated={handleTestGenerated}
                  />
                );
              })}
            </div>
          </div>
        );

      case 'tests':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setCurrentStep('summaries')}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to summaries
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Generated Test Code
              </h2>
              <p className="text-gray-600">
                Review, copy, download, or create pull requests with your generated tests.
              </p>
            </div>

            <div className="space-y-6">
              {generatedTests.map((test, index) => (
                <CodeEditor
                  key={`${test.fileName}-${index}`}
                  test={test}
                  owner={selectedRepo!.owner.login}
                  repo={selectedRepo!.name}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { key: 'repos', label: 'Repository', icon: FileText },
              { key: 'files', label: 'Files', icon: Code2 },
              { key: 'summaries', label: 'Summaries', icon: Zap },
              { key: 'tests', label: 'Tests', icon: Code2 }
            ].map(({ key, label, icon: Icon }, index) => (
              <React.Fragment key={key}>
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
                  currentStep === key 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500'
                }`}>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
                {index < 3 && (
                  <div className={`w-8 h-0.5 ${
                    ['files', 'summaries', 'tests'].includes(currentStep) && index < ['repos', 'files', 'summaries', 'tests'].indexOf(currentStep)
                      ? 'bg-blue-300' 
                      : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {renderStepContent()}
      </div>
    </div>
  );
}