import React, { useEffect, useState } from 'react';
import './LoadingOverlay.css';

interface LoadingOverlayProps {
  loading: boolean;
  delay?: number;
}
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loading, delay = 500 }) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (loading) {
      timeoutId = setTimeout(() => {
        setShouldShow(true);
      }, delay);
    } else {
      setShouldShow(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, delay]);

  if (!shouldShow) return null;

  return (
    <div className='loading-overlay'>
      <div className='stick-figure-container'>
        <div className='stick-figure'>
          <div className='head'></div>
          <div className='torso'></div>
          <div className='arms'>
            <div className='arm-left'></div>
            <div className='arm-right'></div>
          </div>
          <div className='legs'>
            <div className='leg-left'></div>
            <div className='leg-right'></div>
          </div>
          <div className='barbell'>
            <div className='weight-left'></div>
            <div className='weight-right'></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
