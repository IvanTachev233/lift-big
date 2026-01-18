import React from 'react';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  height?: number | string;
}

const Logo: React.FC<LogoProps> = ({ className, style, height = 40 }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 300 80'
      height={height}
      className={className}
      style={style}
      aria-label='Lift Big Logo'
    >
      {/* Barbell Graphic */}
      <g fill='#333'>
        {/* Bar */}
        <rect x='10' y='25' width='280' height='8' rx='2' fill='#e0e0e0' />
        {/* Left Weights (Outside -> Inside) */}
        <rect x='10' y='14' width='8' height='30' rx='2' fill='#fbc02d' /> {/* Yellow (Outside) */}
        <rect x='20' y='12' width='8' height='34' rx='2' fill='#1976d2' /> {/* Blue */}
        <rect x='30' y='10' width='10' height='38' rx='2' fill='#d32f2f' /> {/* Red (Inside) */}
        <rect x='42' y='16' width='6' height='26' rx='2' fill='#333' /> {/* Shoulder */}
        {/* Right Weights (Inside -> Outside) */}
        <rect x='252' y='16' width='6' height='26' rx='2' fill='#333' /> {/* Shoulder */}
        <rect x='260' y='10' width='10' height='38' rx='2' fill='#d32f2f' /> {/* Red (Inside) */}
        <rect x='272' y='12' width='8' height='34' rx='2' fill='#1976d2' /> {/* Blue */}
        <rect x='282' y='14' width='8' height='30' rx='2' fill='#fbc02d' /> {/* Yellow (Outside) */}
      </g>

      {/* Text */}
      <text
        x='150'
        y='70'
        fontFamily='Arial, sans-serif'
        fontSize='36'
        fontWeight='bold'
        textAnchor='middle'
        fill='#fff'
        stroke='#333'
        strokeWidth='1'
        style={{ letterSpacing: '2px' }}
      >
        LIFT BIG
      </text>
    </svg>
  );
};

export default Logo;
