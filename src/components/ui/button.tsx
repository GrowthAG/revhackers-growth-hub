
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Button - Design System RevHackers
 * Radius: 4px (--radius base)
 * Zero glow. Zero rounded-full em buttons de ação.
 * strokeWidth dos ícones internos: herdado do contexto (1.5 padrão)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-950 text-white hover:bg-zinc-800 shadow-xs",

        // Destrutivo
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-xs",

        // Primary Accent (Green)
        accent:
          "bg-[#00CC6A] text-black hover:bg-[#00b35e] font-bold shadow-xs",

        // Outline em fundo claro
        outline:
          "border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300",

        // Outline em fundo escuro
        "outline-dark":
          "border border-zinc-800 bg-transparent text-white hover:bg-zinc-900 hover:border-zinc-700",

        // Secundário neutro
        secondary:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",

        // Ghost
        ghost:
          "bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",

        // Ghost em fundo escuro
        "ghost-dark":
          "bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white",

        // Link
        link:
          "bg-transparent text-zinc-900 underline-offset-4 hover:underline hover:text-[#00CC6A] p-0 h-auto",
      },
      size: {
        sm:      "h-9  px-4  text-xs font-semibold rounded-lg",
        default: "h-11 px-6  text-sm font-semibold rounded-xl",
        lg:      "h-12 px-7  text-sm font-bold rounded-xl",
        xl:      "h-14 px-9  text-base font-bold rounded-xl",
        icon:    "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
