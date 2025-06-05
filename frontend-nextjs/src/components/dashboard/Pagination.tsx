import React from 'react';
import { Button } from '../ui';
import { FLEX, SPACING, TEXT, cn } from '../../lib/styles';

interface PaginationProps {
  currentPage: number;
  setPage: (page: number) => void;
  hasMore: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, setPage, hasMore }) => (
  <div className={cn(FLEX.between, SPACING.form)}>
    <Button
      variant="secondary"
      onClick={() => setPage(Math.max(0, currentPage - 1))}
      disabled={currentPage === 0}
    >
      Anterior
    </Button>
    
    <span className={TEXT.body}>
      Página {currentPage + 1}
    </span>
    
    <Button
      variant="secondary"
      onClick={() => setPage(currentPage + 1)}
      disabled={!hasMore}
    >
      Siguiente
    </Button>
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
  <div className={cn(FLEX.between, SPACING.form)}>
    <Button
      variant="secondary"
      onClick={onPrevious}
      disabled={!pageInfo.hasPreviousPage}
    >
      Anterior
    </Button>
    
    <span className={TEXT.body}>
      Navegación basada en cursor
    </span>
    
    <Button
      variant="secondary"
      onClick={onNext}
      disabled={!pageInfo.hasNextPage}
    >
      Siguiente
    </Button>
  </div>
);