import React from 'react';
import './ColorSwatch.css';

interface ColorSwatchProps {
  /** Background color (CSS color value or class) */
  color: string;
  /** Color name label */
  name: string;
  /** Hex code to display */
  hex: string;
  /** Optional custom class name */
  className?: string;
}

/**
 * ColorSwatch - A component for displaying color palette swatches
 * Part of the Midnight Momentum Design System
 */
const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, name, hex, className = '' }) => {
  const swatchStyle = {
    backgroundColor: color.startsWith('#') || color.startsWith('rgb') ? color : undefined,
  };

  const swatchClass = color.startsWith('#') || color.startsWith('rgb')
    ? `swatch ${className}`
    : `swatch ${color} ${className}`;

  return (
    <div>
      <div className={swatchClass} style={swatchStyle} data-hex={hex}></div>
      <div className="font-data small">{name}</div>
      <div className="text-muted small">{hex}</div>
    </div>
  );
};

export default ColorSwatch;
