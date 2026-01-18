import React from 'react';
// Import React Bootstrap components
import Card from 'react-bootstrap/Card';
import ListGroup from '../components/design-system/ListGroup';
import Badge from 'react-bootstrap/Badge'; // Use Badge for factor levels
import './ReadinessScore.css'; // Ensure CSS is imported

// Define the structure of the readiness data
interface ReadinessData {
  score: number;
  level: 'Excellent' | 'Good' | 'Pay Attention' | 'Poor';
  message: string;
  factors: {
    activity: 'Low' | 'Moderate' | 'High';
    sleep: 'Low' | 'Moderate' | 'High';
    hrv?: 'Low' | 'Moderate' | 'High';
  };
}

// Placeholder data
const placeholderReadiness: ReadinessData = {
  score: 90,
  level: 'Excellent',
  message: "Get ready to tackle today's workout! Your body indicates you're ready to perform.",
  factors: {
    activity: 'Low',
    sleep: 'Moderate',
    hrv: 'High',
  },
};

// Helper to get Bootstrap variant color based on level
const getLevelVariant = (level: string | undefined): string => {
  if (!level) return 'secondary'; // Default grey
  switch (level.toLowerCase()) {
    case 'high':
    case 'good':
    case 'excellent':
      return 'success'; // Green (Bootstrap's success green) - We can override this
    case 'moderate':
      return 'warning'; // Yellow
    case 'low':
    case 'poor':
    case 'pay attention':
      return 'danger'; // Red
    default:
      return 'secondary'; // Grey
  }
};
// Helper to get custom class for color overrides
const getLevelClass = (level: string | undefined): string => {
  if (!level) return 'level-unknown';
  switch (level.toLowerCase()) {
    case 'high':
    case 'good':
    case 'excellent':
      return 'level-high';
    case 'moderate':
      return 'level-moderate';
    case 'low':
    case 'poor':
    case 'pay attention':
      return 'level-low';
    default:
      return 'level-unknown';
  }
};

interface ReadinessScoreProps {
  data?: ReadinessData | null;
}

const ReadinessScore: React.FC<ReadinessScoreProps> = (/* { data } */) => {
  const readinessData = placeholderReadiness;

  if (!readinessData) {
    return (
      <Card className='readiness-card readiness-loading text-center text-muted'>
        <Card.Body>Loading Readiness...</Card.Body>
      </Card>
    );
  }

  const scoreLevelClass = getLevelClass(readinessData.level);
  const scoreLevelVariant = getLevelVariant(readinessData.level);

  return (
    // Use Bootstrap Card component
    // Add custom classes for specific styling
    <Card className={`readiness-card shadow-sm ${scoreLevelClass}`}>
      <Card.Body className='text-center'>
        {/* Score Circle */}
        <div className={`readiness-score-circle mx-auto mb-3 border-${scoreLevelVariant}`}>
          <span className='readiness-score-number'>{readinessData.score}</span>
        </div>

        {/* Text */}
        <div className='readiness-text mb-4'>
          <Card.Title as='p' className='readiness-level mb-1'>
            {readinessData.level} readiness
          </Card.Title>
          <Card.Text className='readiness-message'>{readinessData.message}</Card.Text>
        </div>

        {/* Factors */}
        <div className='readiness-factors'>
          <h5 className='readiness-factors-title'>Contributing Factors:</h5>
          <ListGroup variant='flush' className='factors-list'>
            {readinessData.factors.activity && (
              <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                <span>Recent Activity</span>
                <Badge
                  bg={getLevelVariant(readinessData.factors.activity)}
                  className={`factor-badge ${getLevelClass(readinessData.factors.activity)}`}
                >
                  {readinessData.factors.activity}
                </Badge>
              </ListGroup.Item>
            )}
            {readinessData.factors.sleep && (
              <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                <span>Recent Sleep</span>
                <Badge
                  bg={getLevelVariant(readinessData.factors.sleep)}
                  className={`factor-badge ${getLevelClass(readinessData.factors.sleep)}`}
                >
                  {readinessData.factors.sleep}
                </Badge>
              </ListGroup.Item>
            )}
            {readinessData.factors.hrv && (
              <ListGroup.Item className='d-flex justify-content-between align-items-center'>
                <span>Heart Rate Variability</span>
                <Badge
                  bg={getLevelVariant(readinessData.factors.hrv)}
                  className={`factor-badge ${getLevelClass(readinessData.factors.hrv)}`}
                >
                  {readinessData.factors.hrv}
                </Badge>
              </ListGroup.Item>
            )}
            {/* Add more factors similarly */}
          </ListGroup>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReadinessScore;
