import React from 'react';
import { CustomButtonProps } from '@/lib/utils'

export const CustomButton: React.FC<CustomButtonProps> = ({ className = '', bgImage, children, onClick}) => {
    const style = bgImage ? { backgroundImage: `url(${bgImage})` } : undefined;
    const brightness = bgImage ? "": "brightness-150";
  
    return (
      <button
        onClick={onClick}
        className={`shadow-[2px_1px_2px_1px_rgba(0,0,0,0.2)] flex backdrop-blur-lg 
         justify-center items-center ${brightness}
        hover:opacity-85 rounded-full cursor-pointer ${className}`}
        style={style}
        type="button"
      >
        {children}
      </button>
    );
};