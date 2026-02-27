/**
 * Icon Types
 */

export type IconVariant = 'outline' | 'solid';

export interface IconProps {
  width?: number;
  height?: number;
  variant?: IconVariant;
  className?: string;
}
