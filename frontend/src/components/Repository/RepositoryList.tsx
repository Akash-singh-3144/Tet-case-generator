import React from 'react';
import { Calendar, GitBranch, Lock, Unlock } from 'lucide-react';
import { Repository } from '../../types';

interface RepositoryListProps {
  repositories: Repository[];
  onSelectRepository: (repo: Repository) => void;
  isLoading: boolean;
}

export function RepositoryList({ repositories, onSelectRepository, isLoading }: RepositoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          onClick={() => onSelectRepository(repo)}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                  {repo.name}
                </h3>
                {repo.private ? (
                  <Lock className="h-4 w-4 text-gray-500" />
                ) : (
                  <Unlock className="h-4 w-4 text-gray-500" />
                )}
              </div>
              
              {repo.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {repo.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {repo.language && (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>{repo.language}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Updated {new Date(repo.updated_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <GitBranch className="h-4 w-4" />
                  <span className="font-mono text-xs">{repo.full_name}</span>
                </div>
              </div>
            </div>
            
            <img
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              className="h-10 w-10 rounded-full ml-4"
            />
          </div>
        </div>
      ))}
    </div>
  );
}