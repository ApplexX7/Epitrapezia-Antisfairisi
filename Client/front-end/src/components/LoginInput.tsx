import React from "react";

export type InputData = {
    className?: string;
    type?: string,
    name?: string,
    placeholder?: string
  };

export  function InputLogin({ className = '', type, name, placeholder} : InputData){
    return (
        <input className={`py-2 md:py-5 bg-white-smoke/60 pr-5 pl-5 w-full block 
            rounded-[10px] placeholder:text-black-nave sm:placeholder:text-[22px] 
            sm:text-[22px] font-normal shadow-[2px_0px_2px_2px_rgba(0,0,0,0.2)] 
            focus:outline-none focus:ring-2 focus:ring-white-smoke 
            placeholder:opacity-70 ${className}`}
        type={type}
        name={name}
        placeholder={placeholder}
        required
       />
    )
}