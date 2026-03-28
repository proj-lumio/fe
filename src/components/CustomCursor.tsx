import { useEffect, useRef } from "react"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let x = 0
    let y = 0

    const move = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      cursor.style.left = `${x}px`
      cursor.style.top = `${y}px`
    }

    const addHover = () => cursor.classList.add("hovering")
    const removeHover = () => cursor.classList.remove("hovering")

    document.addEventListener("mousemove", move)

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
      observer.disconnect()
    }
  }, [])

  return <div ref={cursorRef} id="lumio-cursor" />
}
