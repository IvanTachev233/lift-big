import React, { ReactNode } from 'react';
import Card from 'react-bootstrap/Card';
import './GradientCard.css';

interface GradientCardProps {
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
 * GradientCard - A card component with animated gradient border
 * Part of the Midnight Momentum Design System
 */
const GradientCard: React.FC<GradientCardProps> = ({ title, children, footer, className = '' }) => {
  return (
    <Card className={`card-gradient ${className}`}>
      <Card.Body>
        {title && <Card.Title>{title}</Card.Title>}
        {children}
      </Card.Body>
      {footer && <Card.Footer className="bg-transparent border-top">{footer}</Card.Footer>}
    </Card>
  );
};

export default GradientCard;
