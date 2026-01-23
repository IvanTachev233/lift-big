import React, { ReactNode } from 'react';
import './Carousel.css';

interface CarouselProps {
  children: ReactNode;
  className?: string;
}

interface CarouselItemProps {
  children: ReactNode;
  className?: string;
}

export const CarouselItem: React.FC<CarouselItemProps> = ({ children, className = '' }) => {
  return <div className={`carousel-item-wrapper ${className}`}>{children}</div>;
};

const Carousel: React.FC<CarouselProps> = ({ children, className = '' }) => {
  return <div className={`carousel-container ${className}`}>{children}</div>;
};

export default Carousel;
