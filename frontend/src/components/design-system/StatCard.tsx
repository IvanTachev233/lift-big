import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from 'react-bootstrap/ProgressBar';
import './StatCard.css';

interface Stat {
  /** The stat value (number or percentage) */
  value: string;
  /** Description of the stat */
  label: string;
}

interface Progress {
  /** Progress label */
  label: string;
  /** Progress percentage (0-100) */
  value: number;
}

interface StatCardProps {
  /** Card title */
  title?: string;
  /** Array of stats to display */
  stats: Stat[];
  /** Optional progress bar data */
  progress?: Progress;
  /** Optional custom class name */
  className?: string;
}

/**
 * StatCard - A component for displaying performance statistics with gradient styling
 * Part of the Midnight Momentum Design System
 */
const StatCard: React.FC<StatCardProps> = ({ title, stats, progress, className = '' }) => {
  return (
    <Card className={`card-stat ${className}`}>
      <Card.Body>
        {title && <Card.Title className="text-muted mb-4">{title}</Card.Title>}
        <Row className="g-3">
          {stats.map((stat, index) => (
            <Col key={index} xs={12 / Math.min(stats.length, 2)}>
              <div className="stat-number">{stat.value}</div>
              <p className="text-muted small mb-0">{stat.label}</p>
            </Col>
          ))}
          {progress && (
            <Col xs={12} className="mt-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-muted">{progress.label}</span>
                <span className="small font-data text-primary">{progress.value}%</span>
              </div>
              <ProgressBar now={progress.value} />
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default StatCard;
