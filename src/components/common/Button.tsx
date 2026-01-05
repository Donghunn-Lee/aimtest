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
  const baseStyles = `relative rounded-md font-bold focus:outline-none transition-all duration-200 ease-out flex items-center justify-center leading-none tracking-wide`;

  const variantStyles = {
    primary: `bg-[#00ff00] text-black border border-transparent hover:bg-[#00cc00] hover:shadow-[0_0_15px_rgba(0,255,0,0.4)] disabled:bg-gray-600 disabled:text-gray-400`,

    secondary: `bg-white/5 text-gray-200 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:text-white disabled:opacity-50`,

    danger: `bg-red-600/80 text-white border border-transparent hover:bg-red-600`,
  };
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2 py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2 text-sm md:text-base',
    lg: 'px-6 py-3 text-base md:text-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = disabled ? 'cursor-not-allowed' : 'active:scale-95';

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
