import { useState } from "react";

export type ButtonData = {
    className?: string,
    types?:  "button" | "submit" | "reset",
    children : React.ReactNode
    onClicks? :  React.MouseEventHandler<HTMLButtonElement>,
    ids? : string,
}


export function LoginButton ({className= '', types, children, onClicks ,ids} : ButtonData) {
    return (
        <button
        onClick={onClicks}
        className={`sm:mt-3 py-5 sm:py-4 w-full px-5 text-center text-md
        sm:text-[28px] items-center font-medium bg-black-nave
        text-white-smoke shadow-[2px_2px_2px_0px_rgba(0,0,0,0.2)] rounded-[10px]
        hover:bg-black/70 transition-transform duration-500 ease-in-out active:scale-110
        cursor-pointer
        ${className}`}
        id={ids}
        type={types}
        >{children}</button>
    )
}