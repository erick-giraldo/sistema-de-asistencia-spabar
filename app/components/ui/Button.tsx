import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
    // Base styles
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:pointer-events-none",
    {
        variants: {
            variant: {
                default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
                primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
                secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
                success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
                danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
                warning: "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500",
                info: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
                outline: "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
                ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
                link: "bg-transparent text-blue-600 underline-offset-4 hover:underline focus:ring-blue-500",
            },
            size: {
                sm: "px-3 py-1.5 text-xs",
                md: "px-4 py-2 text-sm",
                lg: "px-6 py-2.5 text-base",
                xl: "px-8 py-3 text-sm",
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