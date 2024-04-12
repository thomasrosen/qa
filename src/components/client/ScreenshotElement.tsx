'use client'

import html2canvas from 'html2canvas'
import { useRef } from 'react'

export function ScreenshotElement({
  htmlId,
  ...props
}: {
  htmlId: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const takeScreenshot = () => {
    const divRef = document.getElementById(htmlId)

    if (divRef && wrapperRef.current) {
      wrapperRef.current.style.display = 'none'

      html2canvas(divRef).then((canvas) => {
        // Do something with the canvas, e.g. convert to image and download
        const imgData = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.setAttribute('download', 'screenshot.png')
        downloadLink.setAttribute('href', imgData)
        downloadLink.click()
        if (wrapperRef.current) {
          wrapperRef.current.style.display = 'block'
        }
      })
    }
  }

  return <div {...props} ref={wrapperRef} onClick={takeScreenshot} />
}
