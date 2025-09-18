"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        style: {
          zIndex: 9999,
        },
        className: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        descriptionClassName: "group-[.toast]:text-muted-foreground",
        actionButtonClassName: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButtonClassName: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      }}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-border": "var(--border)",
          "--normal-text": "var(--foreground)",
          "--success-bg": "var(--success)",
          "--success-border": "var(--success)",
          "--success-text": "var(--success-foreground)",
          "--error-bg": "var(--destructive)",
          "--error-border": "var(--destructive)",
          "--error-text": "var(--destructive-foreground)",
          "--warning-bg": "var(--warning)",
          "--warning-border": "var(--warning)",
          "--warning-text": "var(--warning-foreground)",
          "--info-bg": "var(--info)",
          "--info-border": "var(--info)",
          "--info-text": "var(--info-foreground)",
          zIndex: 9999,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
