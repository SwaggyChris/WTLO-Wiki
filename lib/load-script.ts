export function loadScript(src: string): Promise<{ cleanup: () => void }> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${src}"]`)
    if (existingScript) {
      resolve({ cleanup: () => existingScript.remove() })
      return
    }

    const script = document.createElement("script")
    script.src = src
    script.async = true

    const cleanup = () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }

    script.onload = () => resolve({ cleanup })
    script.onerror = () => {
      cleanup()
      reject(new Error(`Failed to load script: ${src}`))
    }

    document.head.appendChild(script)
  })
}
