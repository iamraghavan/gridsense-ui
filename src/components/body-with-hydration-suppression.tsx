"use client"

import React from "react"

export function BodyWithHydrationSuppression({
  children,
}: {
  children: React.ReactNode
}) {
  return <body suppressHydrationWarning>{children}</body>
}
