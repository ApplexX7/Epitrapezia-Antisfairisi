import { useState } from "react";

export type ButtonData = {
    className?: string,
    types?:  "button" | "submit" | "reset",
    children : React.ReactNode
}


export function LoginButton ({className= '', types, children} : ButtonData) {
    return (
        <button
        className={`sm:mt-3 py-5 sm:py-4 w-full px-5 text-center text-md
        sm:text-[28px] items-center font-medium bg-black-nave
        text-white-smoke shadow-[2px_2px_2px_0px_rgba(0,0,0,0.2)] rounded-[10px]
        hover:bg-black/70 transition-transform duration-500 ease-in-out focus:scale-110
        ${className}`}
        type={types}
        >{children}</button>
    )
}