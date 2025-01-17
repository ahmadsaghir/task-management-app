// components/ui/toast.jsx
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
        ref={ref}
        className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
        {...props} />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-lg border px-4 py-3 shadow-lg transition-all data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full",
    {
        variants: {
            variant: {
                default: "border-gray-200 bg-white text-gray-900",
                destructive: "border-red-500 bg-red-50 text-red-600",
                success: "border-green-500 bg-green-50 text-green-600",
                info: "border-blue-500 bg-blue-50 text-blue-600",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
    const Icon = {
        default: Info,
        destructive: AlertCircle,
        success: CheckCircle2,
        info: Info
    }[variant || 'default']

    return (
        <ToastPrimitives.Root
            ref={ref}
            className={toastVariants({ variant })}
            {...props}>
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {props.children}
            </div>
            <ToastPrimitives.Close className="ring-offset-background rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2">
                <X className="h-4 w-4" />
            </ToastPrimitives.Close>
        </ToastPrimitives.Root>
    )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Action
        ref={ref}
        className="ring-offset-background hover:bg-secondary focus:ring-ring inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        {...props} />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Close
        ref={ref}
        className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        {...props} />
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Title ref={ref} className="text-sm font-semibold" {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
    <ToastPrimitives.Description ref={ref} className="text-sm" {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export {
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction,
};