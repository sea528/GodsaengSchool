import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'link' | 'icon';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  loading = false,
  icon,
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative flex items-center justify-center rounded-[12px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-98";
  
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover",
    secondary: "bg-secondary-bg text-secondary-text hover:bg-secondary-bg/80 border border-transparent",
    link: "bg-transparent text-muted-text hover:text-primary font-medium p-0 h-auto shadow-none",
    icon: "bg-transparent text-muted-text hover:bg-gray-100 p-2 rounded-full h-auto w-auto shadow-none"
  };

  const sizes = variant === 'link' || variant === 'icon' ? '' : "h-[52px] px-6 text-[16px]";
  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes} ${width} ${className}`} 
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="animate-spin mr-2" size={20} />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};