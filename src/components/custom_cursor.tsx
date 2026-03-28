import { useEffect, useRef } from "react"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Hidden until first mouse move
    let hasMoved = false

    const move = (e: MouseEvent) => {
      if (!hasMoved) {
        hasMoved = true
        cursor.style.opacity = "1"
      }
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
    }

    const hide = () => { cursor.style.opacity = "0" }
    const show = () => { if (hasMoved) cursor.style.opacity = "1" }

    const addHover = () => cursor.classList.add("hovering")
    const removeHover = () => cursor.classList.remove("hovering")

    document.addEventListener("mousemove", move)
    document.addEventListener("mouseleave", hide)
    document.addEventListener("mouseenter", show)

    const observe = () => {
      const interactives = document.querySelectorAll(
        "a, button, [role='button'], input, textarea, select, [data-hover]"
      )
      interactives.forEach((el) => {
        el.addEventListener("mouseenter", addHover)
        el.addEventListener("mouseleave", removeHover)
      })
    }

    observe()
    const observer = new MutationObserver(observe)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener("mousemove", move)
      document.removeEventListener("mouseleave", hide)
      document.removeEventListener("mouseenter", show)
      observer.disconnect()
    }
  }, [])

  return <div ref={cursorRef} id="lumio-cursor" style={{ opacity: 0 }} />
}
