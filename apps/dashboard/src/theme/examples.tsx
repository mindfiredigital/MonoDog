// Example components demonstrating the new theme system usage
import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Button Examples
 * Demonstrates all button variants with the new theme classes
 */
export function ButtonExamples() {
  return (
    <div className="space-y-4 p-6">
      <h3 className="text-heading text-lg">Button Examples</h3>

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary">Primary Button</button>
        <button className="btn-secondary">Secondary Button</button>
        <button className="btn-outline">Outline Button</button>
        <button className="btn-ghost">Ghost Button</button>
        <button className="btn-success">Success Button</button>
        <button className="btn-warning">Warning Button</button>
        <button className="btn-error">Error Button</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled>
          Disabled Primary
        </button>
        <button className="btn-secondary" disabled>
          Disabled Secondary
        </button>
        <button className="btn-outline" disabled>
          Disabled Outline
        </button>
      </div>
    </div>
  );
}

/**
 * Badge Examples
 * Demonstrates status badge variants
 */
export function BadgeExamples() {
  return (
    <div className="space-y-4 p-6">
      <h3 className="text-heading text-lg">Badge Examples</h3>

      <div className="flex flex-wrap gap-3">
        <span className="badge-success">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Success
        </span>
        <span className="badge-warning">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Warning
        </span>
        <span className="badge-error">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Error
        </span>
        <span className="badge-info">Info</span>
        <span className="badge-neutral">Neutral</span>
      </div>
    </div>
  );
}

/**
 * Card Examples
 * Demonstrates card variants with proper content structure
 */
export function CardExamples() {
  return (
    <div className="space-y-6 p-6">
      <h3 className="text-heading text-lg">Card Examples</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Card */}
        <div className="card p-6">
          <h4 className="text-heading text-base mb-2">Basic Card</h4>
          <p className="text-body text-sm">
            This is a basic card with soft shadow and rounded corners.
          </p>
          <button className="btn-primary mt-4">Action</button>
        </div>

        {/* Elevated Card */}
        <div className="card-elevated p-6">
          <h4 className="text-heading text-base mb-2">Elevated Card</h4>
          <p className="text-body text-sm">
            This card has a more prominent shadow for greater elevation.
          </p>
          <button className="btn-secondary mt-4">Action</button>
        </div>

        {/* Interactive Card */}
        <div className="card-interactive p-6">
          <h4 className="text-heading text-base mb-2">Interactive Card</h4>
          <p className="text-body text-sm">
            This card responds to hover with enhanced shadow.
          </p>
          <button className="btn-outline mt-4">Action</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Input Examples
 * Demonstrates form input variants
 */
export function InputExamples() {
  return (
    <div className="space-y-4 p-6 max-w-md">
      <h3 className="text-heading text-lg">Input Examples</h3>

      <div className="space-y-3">
        <div>
          <label className="text-subheading text-sm block mb-1">
            Normal Input
          </label>
          <input
            type="text"
            placeholder="Enter text here..."
            className="input-base w-full"
          />
        </div>

        <div>
          <label className="text-subheading text-sm block mb-1">
            Success Input
          </label>
          <input
            type="text"
            placeholder="Valid input"
            className="input-base input-success w-full"
          />
        </div>

        <div>
          <label className="text-subheading text-sm block mb-1">
            Error Input
          </label>
          <input
            type="text"
            placeholder="Invalid input"
            className="input-base input-error w-full"
          />
          <p className="text-error-600 text-xs mt-1">This field is required</p>
        </div>

        <div>
          <label className="text-subheading text-sm block mb-1">
            Disabled Input
          </label>
          <input
            type="text"
            placeholder="Disabled"
            disabled
            className="input-base w-full"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Typography Examples
 * Demonstrates typography scale and text classes
 */
export function TypographyExamples() {
  return (
    <div className="space-y-6 p-6">
      <h3 className="text-heading text-lg">Typography Examples</h3>

      <div className="space-y-4">
        <div>
          <h1 className="text-heading text-4xl">Heading 1</h1>
          <h2 className="text-heading text-3xl">Heading 2</h2>
          <h3 className="text-heading text-2xl">Heading 3</h3>
          <h4 className="text-heading text-xl">Heading 4</h4>
          <h5 className="text-heading text-lg">Heading 5</h5>
          <h6 className="text-heading text-base">Heading 6</h6>
        </div>

        <div>
          <p className="text-subheading text-lg">Large subheading text</p>
          <p className="text-subheading">Regular subheading text</p>
          <p className="text-body">This is body text with good readability.</p>
          <p className="text-caption">This is caption text for metadata.</p>
        </div>

        <div>
          <code className="text-code bg-neutral-100 px-2 py-1 rounded">
            const example = 'monospace code';
          </code>
        </div>
      </div>
    </div>
  );
}

/**
 * Color Palette Examples
 * Visual demonstration of the color system
 */
export function ColorPaletteExamples() {
  const colorGroups = [
    {
      name: 'Primary',
      colors: [
        '50',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900',
      ],
    },
    {
      name: 'Secondary',
      colors: [
        '50',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900',
      ],
    },
    {
      name: 'Success',
      colors: [
        '50',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900',
      ],
    },
    {
      name: 'Warning',
      colors: [
        '50',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900',
      ],
    },
    {
      name: 'Error',
      colors: [
        '50',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900',
      ],
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-heading text-lg">Color Palette</h3>

      {colorGroups.map(group => (
        <div key={group.name}>
          <h4 className="text-subheading text-sm mb-3">{group.name}</h4>
          <div className="flex rounded-lg overflow-hidden shadow-soft">
            {group.colors.map(shade => (
              <div
                key={shade}
                className={`flex-1 h-16 flex items-end justify-center pb-2 bg-${group.name.toLowerCase()}-${shade}`}
              >
                <span
                  className={`text-xs font-medium ${
                    parseInt(shade) >= 500 ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {shade}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Animation Examples
 * Demonstrates custom animations
 */
export function AnimationExamples() {
  const [trigger, setTrigger] = React.useState(0);

  return (
    <div className="space-y-6 p-6">
      <h3 className="text-heading text-lg">Animation Examples</h3>

      <button
        className="btn-primary"
        onClick={() => setTrigger(prev => prev + 1)}
      >
        Trigger Animations
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div key={`fade-${trigger}`} className="card p-4 animate-fade-in">
          <p className="text-body">Fade In Animation</p>
        </div>

        <div key={`slide-up-${trigger}`} className="card p-4 animate-slide-up">
          <p className="text-body">Slide Up Animation</p>
        </div>

        <div
          key={`slide-down-${trigger}`}
          className="card p-4 animate-slide-down"
        >
          <p className="text-body">Slide Down Animation</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Complete Theme Showcase
 * Combines all examples into a comprehensive showcase
 */
export default function ThemeShowcase() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-heading text-4xl mb-4">monodog Theme System</h1>
          <p className="text-body text-lg">
            A comprehensive design system for consistent and beautiful
            interfaces
          </p>
        </div>

        <div className="space-y-12">
          <ButtonExamples />
          <BadgeExamples />
          <CardExamples />
          <InputExamples />
          <TypographyExamples />
          <ColorPaletteExamples />
          <AnimationExamples />
        </div>
      </div>
    </div>
  );
}
