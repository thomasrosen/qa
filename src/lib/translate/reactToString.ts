import React from 'react'

export const reactToString = (element: React.ReactNode): string => {
  if (!element) {
    return ''
  }

  if (typeof element === 'string') {
    return element
  }

  if (typeof element === 'number') {
    return String(element)
  }

  if (Array.isArray(element)) {
    return element.map((subElement) => reactToString(subElement)).join('')
  }

  if (React.isValidElement(element)) {
    if (element.props && element.props.children) {
      return reactToString(element.props.children)
    }

    if (element.props && !element.props.children) {
      return ''
    }
  }

  return ''
}
