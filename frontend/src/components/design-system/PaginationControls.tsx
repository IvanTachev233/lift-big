import React from 'react';
import { Pagination } from 'react-bootstrap';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number;
}

/**
 * Reusable pagination component with first/last, prev/next, and page numbers.
 */
const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPagesToShow = 5,
}) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };

  // Calculate page range to display
  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxPagesToShow) {
    const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;

    if (currentPage <= maxPagesBeforeCurrentPage) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  const items: React.ReactNode[] = [];

  // First and Previous buttons
  items.push(
    <Pagination.First
      key="first"
      onClick={() => handlePageChange(1)}
      disabled={currentPage === 1}
    />
  );
  items.push(
    <Pagination.Prev
      key="prev"
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
    />
  );

  // Start ellipsis
  if (startPage > 1) {
    items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
  }

  // Page numbers
  for (let number = startPage; number <= endPage; number++) {
    items.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  // End ellipsis
  if (endPage < totalPages) {
    items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
  }

  // Next and Last buttons
  items.push(
    <Pagination.Next
      key="next"
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    />
  );
  items.push(
    <Pagination.Last
      key="last"
      onClick={() => handlePageChange(totalPages)}
      disabled={currentPage === totalPages}
    />
  );

  return <Pagination className="justify-content-center">{items}</Pagination>;
};

export default PaginationControls;
