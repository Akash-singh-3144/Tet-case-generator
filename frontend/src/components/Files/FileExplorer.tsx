import React, { useState, useEffect } from 'react';
import { File, Folder, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { FileItem } from '../../types';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface FileExplorerProps {
  owner: string;
  repo: string;
  selectedFiles: FileItem[];
  onFileSelect: (file: FileItem) => void;
  onFileDeselect: (file: FileItem) => void;
}

export function FileExplorer({ owner, repo, selectedFiles, onFileSelect, onFileDeselect }: FileExplorerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [owner, repo]);

  const loadFiles = async (path?: string) => {
    try {
      setLoading(true);
      const contents = await apiService.getRepositoryContents(owner, repo, path);
      
      if (path) {
        // Update nested files
        setFiles(prev => {
          const newFiles = [...prev];
          const parentIndex = newFiles.findIndex(f => f.path === path);
          if (parentIndex >= 0) {
            newFiles.splice(parentIndex + 1, 0, ...contents.map((item: any) => ({
              name: item.name,
              path: item.path,
              type: item.type,
              size: item.size,
              download_url: item.download_url,
              level: (path.match(/\//g) || []).length + 1
            })));
          }
          return newFiles;
        });
      } else {
        // Root level files
        setFiles(contents.map((item: any) => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          download_url: item.download_url,
          level: 0
        })));
      }
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const toggleDirectory = async (dir: FileItem) => {
    const isExpanded = expandedDirs.has(dir.path);
    
    if (isExpanded) {
      setExpandedDirs(prev => {
        const next = new Set(prev);
        next.delete(dir.path);
        return next;
      });
      
      // Remove nested files from view
      setFiles(prev => prev.filter(f => !f.path.startsWith(dir.path + '/')));
    } else {
      setExpandedDirs(prev => new Set(prev).add(dir.path));
      await loadFiles(dir.path);
    }
  };

  const handleFileClick = async (file: FileItem) => {
    if (file.type === 'dir') {
      toggleDirectory(file);
      return;
    }

    const isSelected = selectedFiles.some(f => f.path === file.path);
    
    if (isSelected) {
      onFileDeselect(file);
    } else {
      try {
        // Fetch file content
        if (file.download_url) {
          const response = await fetch(file.download_url);
          const content = await response.text();
          onFileSelect({ ...file, content });
        }
      } catch (error) {
        toast.error('Failed to load file content');
      }
    }
  };

  const isCodeFile = (fileName: string) => {
    const codeExtensions = ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rs', '.php', '.rb'];
    return codeExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  if (loading && files.length === 0) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-2 p-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {files.map((file) => {
        const isSelected = selectedFiles.some(f => f.path === file.path);
        const isExpanded = expandedDirs.has(file.path);
        const indentLevel = (file as any).level || 0;
        
        return (
          <div
            key={file.path}
            className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
              isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
            }`}
            style={{ paddingLeft: `${8 + indentLevel * 16}px` }}
            onClick={() => handleFileClick(file)}
          >
            {file.type === 'dir' ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <Folder className="h-4 w-4 text-blue-500" />
              </>
            ) : (
              <>
                <div className="w-4"></div>
                <File className={`h-4 w-4 ${isCodeFile(file.name) ? 'text-green-500' : 'text-gray-500'}`} />
              </>
            )}
            
            <span className={`flex-1 text-sm ${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
              {file.name}
            </span>
            
            {file.type === 'file' && file.size && (
              <span className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)}KB
              </span>
            )}
            
            {isSelected && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </div>
        );
      })}
    </div>
  );
}