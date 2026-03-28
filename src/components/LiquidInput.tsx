import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface LiquidInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string
}

const LiquidInput = forwardRef<HTMLInputElement, LiquidInputProps>(
  ({ wrapperClassName, className, ...props }, ref) => {
    return (
      <div className={cn("liquid-input", wrapperClassName)}>
        <input
          ref={ref}
          className={cn(
            "h-full w-full bg-transparent px-4 text-sm text-white placeholder:text-[#555] focus:outline-none",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
LiquidInput.displayName = "LiquidInput"

export { LiquidInput }
