import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-2 text-base text-white font-semibold ring-offset-background placeholder:text-white/50 placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-0 focus-visible:border-pink-400 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
