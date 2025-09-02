import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useContext } from "react";
import { ThemeContext } from "@/app/LayoutClient";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:scale-115",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90 border",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 border",
        outline:
          "border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 border",
        ghost: "hover:bg-accent hover:text-accent-foreground border",
        link: "underline-offset-4 hover:underline border-b",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const { theme } = useContext(ThemeContext);
    const Comp = asChild ? Slot : "button";

    // Theme-aware classes for different variants
    let themeClass = "";
    if (theme === "dark") {
      switch (variant) {
        case "default":
          themeClass = "border-white";
          break;
        case "outline":
          themeClass = "border-gray-600";
          break;
        case "secondary":
          themeClass = "bg-gray-700 text-gray-200 hover:bg-gray-600";
          break;
        case "ghost":
          themeClass = "hover:bg-gray-800 hover:text-gray-200";
          break;
        case "link":
          themeClass = "text-blue-400 hover:text-blue-300";
          break;
        case "destructive":
          themeClass = "bg-red-600 hover:bg-red-700";
          break;
      }
    } else {
      switch (variant) {
        case "default":
          themeClass = "border-black";
          break;
        case "outline":
          themeClass = "border-gray-300";
          break;
        case "secondary":
          themeClass = "bg-gray-200 text-gray-800 hover:bg-gray-300";
          break;
        case "ghost":
          themeClass = "hover:bg-gray-100 hover:text-gray-800";
          break;
        case "link":
          themeClass = "text-blue-600 hover:text-blue-800";
          break;
        case "destructive":
          themeClass = "bg-red-500 hover:bg-red-600";
          break;
      }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), themeClass)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
