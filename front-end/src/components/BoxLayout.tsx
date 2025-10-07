import React from "react";
import { BoxLayoutProps } from '@/lib/utils'

  
export function BoxLayout({ className = '', children }: BoxLayoutProps) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }