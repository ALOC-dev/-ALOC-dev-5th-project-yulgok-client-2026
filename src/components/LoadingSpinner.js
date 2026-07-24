import { createElement } from 'react';

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-[3px]',
  lg: 'h-10 w-10 border-4',
};

function LoadingSpinner({ label, size = 'md', className = '' }) {
  const sizeClass = sizeClasses[size] ?? sizeClasses.md;

  return createElement(
    'span',
    {
      className: `inline-flex items-center justify-center ${className}`.trim(),
      role: 'status',
      'aria-live': 'polite',
    },
    createElement('span', {
      className: `${sizeClass} rounded-full border-current border-r-transparent animate-spin motion-reduce:animate-none`,
      'aria-hidden': 'true',
    }),
    createElement('span', { className: 'sr-only' }, label),
  );
}

export default LoadingSpinner;
