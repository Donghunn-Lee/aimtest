import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = `rounded-md font-medium focus:outline-none ${!disabled && 'transition-all duration-100 ease-in-out focus:ring-2 focus:ring-offset-2'} flex items-center justify-center leading-none`;

  const variantStyles = {
    primary: `bg-blue-600 text-white ${!disabled && 'hover:bg-blue-700 focus:ring-blue-500'} `,
    secondary: `bg-gray-300 text-gray-900 ${!disabled && 'hover:bg-gray-400 focus:ring-gray-500'} `,
    danger: `bg-red-600 text-white ${!disabled && 'hover:bg-red-700 focus:ring-red-500'} `,
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs md:px-3 md:py-1.5 md:text-xs lg:px-4 lg:py-2 lg:text-lg',
    md: 'px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-md lg:px-5 lg:py-2.5 lg:text-xl',
    lg: 'px-4 py-2 text-lg md:px-5 md:py-2.5 md:text-xl lg:px-6 lg:py-3 lg:text-2xl',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={twMerge(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyle,
        disabledStyle,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
