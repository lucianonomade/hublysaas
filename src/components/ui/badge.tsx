import * as React from 'react'
import { cn } from '@/lib/utils'

const Badge = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        variant?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'
    }
>(({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
        default: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-green-500/10 text-green-500 border-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        destructive: 'bg-destructive/10 text-destructive border-destructive/20',
        secondary: 'bg-secondary text-secondary-foreground border-secondary',
    }

    return (
        <div
            ref={ref}
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
                variantStyles[variant],
                className
            )}
            {...props}
        />
    )
})
Badge.displayName = 'Badge'

export { Badge }
