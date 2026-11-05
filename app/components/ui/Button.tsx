import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
    // Base styles
    "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    {
        variants: {
            variant: {
                default: "bg-spa-accent text-spa-bg hover:brightness-110",
                primary: "bg-spa-accent text-spa-bg hover:brightness-110",
                secondary: "bg-spa-text text-spa-bg hover:brightness-90",
                success: "bg-spa-accent text-spa-bg hover:brightness-110",
                danger: "bg-spa-alert text-spa-bg hover:brightness-110",
                warning: "bg-spa-alert text-spa-bg hover:brightness-110",
                info: "bg-spa-text text-spa-bg hover:brightness-90",
                outline: "border border-spa-strong bg-transparent text-spa-text hover:border-spa-hover",
                ghost: "bg-transparent text-spa-text hover:bg-spa-raised",
                link: "bg-transparent text-spa-text underline-offset-4 hover:underline",
            },
            size: {
                sm: "min-h-11 px-3 text-xs",
                md: "min-h-11 px-4 text-sm",
                lg: "min-h-12 px-6 text-base",
                xl: "min-h-14 px-8 text-base",
            },
            fullWidth: {
                true: "w-full",
                false: "w-auto",
            },
            responsive: {
                true: "w-full sm:w-auto",
                false: "",
            }
        },
        defaultVariants: {
            variant: "default",
            size: "md",
            fullWidth: false,
            responsive: false,
        },
    }
)

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    loading?: boolean
    loadingText?: string
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            fullWidth,
            responsive,
            loading = false,
            loadingText,
            icon,
            iconPosition = 'left',
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={cn(buttonVariants({ variant, size, fullWidth, responsive, className }))}
                {...props}
            >
                {loading ? (
                    <>
                        <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        {loadingText || children}
                    </>
                ) : (
                    <>
                        {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
                        {children}
                        {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
                    </>
                )}
            </button>
        )
    }
)

Button.displayName = 'Button'

export { Button, buttonVariants }