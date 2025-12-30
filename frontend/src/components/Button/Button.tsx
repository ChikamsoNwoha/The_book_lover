// src/components/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary:
    'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
  secondary: 'bg-gray-800 text-white border border-gray-700',
  outline: 'bg-transparent text-white',
  ghost: 'bg-transparent text-white hover:bg-white/10',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      className,
      disabled,
      loading,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          // Core glassmorphism + gradient border design
          'relative group isolate font-medium rounded-2xl transition-all duration-300',
          
          // Gradient border (using pseudo-elements)
          'before:absolute before:inset-0 before:rounded-2xl before:p-px before:bg-gradient-to-r',
          'before:from-purple-500 before:via-pink-500 before:to-purple-500 before:opacity-80',
          'before:-z-10 before:transition-opacity before:duration-300',
          
          // Inner glass background
          'after:absolute after:inset-px after:rounded-2xl after:bg-black/90',
          'after:backdrop-blur-xl after:-z-10 after:transition-colors after:duration-300',
          
          // Hover & active states
          'hover:before:opacity-100 hover:after:bg-black/70',
          'active:scale-95',

          // Variant & size
          variantStyles[variant],
          sizeStyles[size],

          // Disabled / loading
          (disabled || loading) && 'opacity-60 cursor-not-allowed',

          // User override
          className
        )}
        {...props}
      >
        {/* Animated shine effect on hover */}
        <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </span>

        {/* Button content */}
        <span className="relative flex items-center justify-center gap-2 z-10">
          {loading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            leftIcon
          )}
          {children}
          {rightIcon}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';