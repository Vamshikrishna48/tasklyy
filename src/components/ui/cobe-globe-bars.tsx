"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"

export interface BarMarker {
  id: string
  location: [number, number]
  value: number
  label: string
}

export interface GlobeBarsProps {
  markers?: BarMarker[]
  className?: string
  speed?: number
  initialScale?: number
}

const defaultMarkers: BarMarker[] = [
  { id: "delhi", location: [28.61, 77.21], value: 96, label: "Delhi NCR" },
  { id: "bengaluru", location: [12.97, 77.59], value: 98, label: "Bengaluru" },
  { id: "mumbai", location: [19.08, 72.88], value: 94, label: "Mumbai" },
  { id: "hyderabad", location: [17.38, 78.48], value: 92, label: "Hyderabad" },
  { id: "chennai", location: [13.08, 80.27], value: 89, label: "Chennai" },
  { id: "pune", location: [18.52, 73.86], value: 91, label: "Pune" },
  { id: "kolkata", location: [22.57, 88.36], value: 87, label: "Kolkata" },
]

export function GlobeBars({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
  initialScale = 1,
}: GlobeBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const scaleRef = useRef(initialScale)
  const [displayScale, setDisplayScale] = useState(Math.round(initialScale * 100))

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  const zoomIn = useCallback(() => {
    const next = Math.min(scaleRef.current * 1.2, 2.5)
    scaleRef.current = next
    setDisplayScale(Math.round(next * 100))
  }, [])

  const zoomOut = useCallback(() => {
    const next = Math.max(scaleRef.current * 0.82, 0.65)
    scaleRef.current = next
    setDisplayScale(Math.round(next * 100))
  }, [])

  const resetZoom = useCallback(() => {
    scaleRef.current = 1
    setDisplayScale(100)
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 1.35

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 1.35,
        theta: 0.3,
        scale: scaleRef.current,
        dark: 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 9,
        baseColor: [1, 1, 1],
        markerColor: [0.15, 0.55, 0.55],
        glowColor: [0.94, 0.93, 0.91],
        markerElevation: 0,
        // @ts-expect-error cobe marker definition
        markers: markers.map((m) => ({ location: m.location, size: 0.02, id: m.id })),
        arcs: [],
        arcColor: [0.2, 0.6, 0.6],
        arcWidth: 0.5,
        arcHeight: 0.25,
        opacity: 0.7,
      })

      function animate() {
        if (!isPausedRef.current) phi += speed
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.3 + thetaOffsetRef.current + dragOffset.current.theta,
          scale: scaleRef.current,
        })
        animationId = requestAnimationFrame(animate)
      }

      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    // Mouse wheel zoom listener
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.08 : 0.92
      const next = Math.min(Math.max(scaleRef.current * factor, 0.65), 2.5)
      scaleRef.current = next
      setDisplayScale(Math.round(next * 100))
    }

    // Touch pinch-to-zoom listener
    let initialTouchDist = 0
    let initialTouchScale = 1

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        initialTouchScale = scaleRef.current
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialTouchDist > 0) {
        e.preventDefault()
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const factor = dist / initialTouchDist
        const next = Math.min(Math.max(initialTouchScale * factor, 0.65), 2.5)
        scaleRef.current = next
        setDisplayScale(Math.round(next * 100))
      }
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false })
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
      canvas.removeEventListener("wheel", handleWheel)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
    }
  }, [markers, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <style>{`
        @keyframes bar-fill { from { width: 0; } to { width: var(--value, 0%); } }
      `}</style>

      {/* Floating Interactive Zoom Toolbar */}
      <div className="absolute top-2 right-2 z-30 flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-md pointer-events-auto">
        <button
          type="button"
          onClick={zoomIn}
          title="Zoom in (or use mouse scroll)"
          className="h-6 w-6 rounded-md hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm active:scale-90 transition-all select-none"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          title="Zoom out (or use mouse scroll)"
          className="h-6 w-6 rounded-md hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm active:scale-90 transition-all select-none"
        >
          −
        </button>
        <button
          type="button"
          onClick={resetZoom}
          title="Reset Zoom"
          className="h-6 w-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-[9px] text-slate-500 font-bold active:scale-90 transition-all select-none"
        >
          {displayScale}%
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          style={{
            position: "absolute",
            // @ts-expect-error CSS Anchor Positioning
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 8,
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            gap: "0.2rem",
            padding: "0.35rem 0.5rem",
            background: "#fff",
            border: "1.5px solid #1a1a2e",
            borderRadius: 3,
            minWidth: 60,
            pointerEvents: "none" as const,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            // @ts-expect-error CSS custom property
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            // @ts-expect-error CSS custom property
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.4s, filter 0.4s",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.5rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: "#888",
            }}
          >
            {m.label}
          </span>
          <span
            style={{
              width: "100%",
              height: 6,
              background: "#eee",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <span
              style={{
                display: "block",
                height: "100%",
                width: `${m.value}%`,
                background: "#1a1a2e",
                borderRadius: 3,
                animation: "bar-fill 1s ease-out forwards",
                // @ts-expect-error CSS custom property
                "--value": `${m.value}%`,
              }}
            />
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              fontWeight: 600,
              color: "#1a1a2e",
            }}
          >
            {m.value}%
          </span>
        </div>
      ))}
    </div>
  )
}
