import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  // Base: Rounded, Font, Transition, Flex
  // 3D Effect: Border-Bottom-Width
  const baseStyle = "inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-150 active:translate-y-1 active:border-b-0 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    // Blue - Primary Action
    primary: "bg-[#4361EE] text-white border-b-4 border-[#3A0CA3] hover:bg-[#3A56D4] active:mt-1 shadow-lg shadow-blue-200",
    // Gray/Blue - Secondary
    secondary: "bg-slate-200 text-slate-600 border-b-4 border-slate-300 hover:bg-slate-300 active:mt-1",
    // Green - Success
    success: "bg-[#4ADE80] text-white border-b-4 border-[#16A34A] hover:bg-[#22C55E] active:mt-1",
    // Red - Danger
    danger: "bg-[#F472B6] text-white border-b-4 border-[#BE185D] hover:bg-[#EC4899] active:mt-1",
    // Ghost
    ghost: "bg-transparent text-slate-400 hover:text-slate-600 border-none shadow-none active:translate-y-0"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs border-b-2 min-h-[32px]",
    md: "px-5 py-2.5 text-sm border-b-4 min-h-[44px]",
    lg: "px-8 py-4 text-base border-b-4 min-h-[56px]"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};