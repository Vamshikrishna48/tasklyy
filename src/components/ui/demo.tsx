"use client"

import { GlobeBars } from "@/components/ui/cobe-globe-bars"

export default function GlobeBarsDemo() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-white p-8 overflow-hidden">
      <div className="w-full max-w-lg">
        <GlobeBars />
      </div>
    </div>
  )
}
