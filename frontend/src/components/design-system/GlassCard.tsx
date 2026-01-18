import React, { ReactNode } from 'react';
import Card from 'react-bootstrap/Card';
import './GlassCard.css';

interface GlassCardProps {
  /** Card title */
  title?: string;
  /** Card content */
  children: ReactNode;
  /** Optional custom class name */
  className?: string;
  /** Card footer content */
  footer?: ReactNode;
}

/**
 * GlassCard - A card component with glassmorphism effect
 * Part of the Midnight Momentum Design System
 */
const GlassCard: React.FC<GlassCardProps> = ({ title, children, footer, className = '' }) => {
  return (
    <Card className={`card-glass ${className}`}>
      <Card.Body>
        {title && <Card.Title>{title}</Card.Title>}
        {children}
      </Card.Body>
      {footer && <Card.Footer className="bg-transparent border-top">{footer}</Card.Footer>}
    </Card>
  );
};

export default GlassCard;
