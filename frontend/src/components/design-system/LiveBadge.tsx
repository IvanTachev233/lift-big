import React from 'react';
import Badge from 'react-bootstrap/Badge';
import './LiveBadge.css';

interface LiveBadgeProps {
  /** Badge text */
  text?: string;
  /** Optional custom class name */
  className?: string;
}

/**
 * LiveBadge - A badge component with pulsing animation indicator
 * Part of the Midnight Momentum Design System
 */
const LiveBadge: React.FC<LiveBadgeProps> = ({ text = 'LIVE', className = '' }) => {
  return (
    <Badge bg="success" className={`badge-live ${className}`}>
      {text}
    </Badge>
  );
};

export default LiveBadge;
