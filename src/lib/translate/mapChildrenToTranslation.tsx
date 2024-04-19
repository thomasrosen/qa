import React from 'react'

export const mapChildrenToTranslation = (
  translationPairs: Record<string, string>,
  element: React.ReactNode,
  key: string = '0'
): React.ReactNode => {
  if (!element) {
    return element
  }

  if (typeof element === 'string' || typeof element === 'number') {
    if (translationPairs[key]) {
      return translationPairs[key]
    } else {
      return element
    }
  }

  if (Array.isArray(element)) {
    return element.map((subElement, i) => (
      <React.Fragment key={i}>
        {mapChildrenToTranslation(translationPairs, subElement, `${key}${i}`)}
      </React.Fragment>
    ))
  }

  if (React.isValidElement(element)) {
    if (element?.props && element?.props.children) {
      const clonedElement = React.cloneElement(
        element,
        element.props,
        mapChildrenToTranslation(translationPairs, element?.props.children, key)
      )
      return clonedElement
    }

    if (element.props && !element.props.children) {
      return element
    }
  }

  return element
}
