import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`relative inline-block cursor-pointer outline-none border-0 align-middle no-underline text-base font-sans font-bold uppercase px-8 py-5 rounded-xl bg-pink-50 border-2 border-pink-300 text-pink-900 shadow-[0_0_0_2px_#b18597,0_10px_0_0_#ffe3e2] transition-all duration-150 ease-[cubic-bezier(0,0,0.58,1)] active:translate-y-3 active:shadow-[0_0_0_2px_#b18597,0_0_#ffe3e2] hover:bg-pink-100 hover:translate-y-1 hover:shadow-[0_0_0_2px_#b18597,0_8px_0_0_#ffe3e2] focus:outline-none ${className}`}
      style={{ fontFamily: "'Rubik', sans-serif" }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 