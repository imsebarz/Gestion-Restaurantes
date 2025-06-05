import React from 'react';
import { Button } from '../ui';
import { FLEX, SPACING, TEXT, cn } from '../../lib/styles';

interface PaginationProps {
  currentPage: number;
  setPage: (page: number) => void;
  hasMore: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, setPage, hasMore }) => (
  <div className="flex items-center justify-center space-x-4 py-6">
    <div className="flex items-center space-x-2">
      <Button
        variant="secondary"
        onClick={() => setPage(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        className={cn(
          "flex items-center space-x-2 transition-all duration-200",
          currentPage === 0 
            ? "opacity-50 cursor-not-allowed" 
            : "hover:scale-105 hover:shadow-md"
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Anterior</span>
      </Button>
      
      <div className="flex items-center space-x-4 px-6 py-2 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            Página <span className="font-bold text-indigo-600">{currentPage + 1}</span>
          </span>
        </div>
        
        {hasMore && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
          </div>
        )}
      </div>
      
      <Button
        variant="secondary"
        onClick={() => setPage(currentPage + 1)}
        disabled={!hasMore}
        className={cn(
          "flex items-center space-x-2 transition-all duration-200",
          !hasMore 
            ? "opacity-50 cursor-not-allowed" 
            : "hover:scale-105 hover:shadow-md"
        )}
      >
        <span>Siguiente</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  </div>
);

interface CursorPaginationProps {
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  onNext: () => void;
  onPrevious: () => void;
}

export const CursorPagination: React.FC<CursorPaginationProps> = ({ 
  pageInfo, 
  onNext, 
  onPrevious 
}) => (
  <div className="flex items-center justify-center space-x-4 py-6">
    <div className="flex items-center space-x-2">
      <Button
        variant="secondary"
        onClick={onPrevious}
        disabled={!pageInfo.hasPreviousPage}
        className={cn(
          "flex items-center space-x-2 transition-all duration-200",
          !pageInfo.hasPreviousPage 
            ? "opacity-50 cursor-not-allowed" 
            : "hover:scale-105 hover:shadow-md"
        )}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Anterior</span>
      </Button>
      
      <div className="flex items-center space-x-4 px-6 py-2 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            Navegación por cursor
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {pageInfo.hasPreviousPage && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Hay anterior</span>
            </div>
          )}
          {pageInfo.hasNextPage && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Hay siguiente</span>
            </div>
          )}
        </div>
      </div>
      
      <Button
        variant="secondary"
        onClick={onNext}
        disabled={!pageInfo.hasNextPage}
        className={cn(
          "flex items-center space-x-2 transition-all duration-200",
          !pageInfo.hasNextPage 
            ? "opacity-50 cursor-not-allowed" 
            : "hover:scale-105 hover:shadow-md"
        )}
      >
        <span>Siguiente</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  </div>
);