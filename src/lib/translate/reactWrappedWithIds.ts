import { wrapWithId } from '@/lib/translate/wrapWithId'
import { isValidElement } from 'react'

export const reactWrappedWithIds = (
  element: React.ReactNode,
  key: string = '0'
): string => {
  if (!element) {
    return ''
  }

  if (typeof element === 'string' || typeof element === 'number') {
    return wrapWithId(element, key)
  }

  if (Array.isArray(element)) {
    return element
      .map((subElement, i) => reactWrappedWithIds(subElement, `${key}${i}`))
      .join('')
  }

  if (isValidElement(element)) {
    if (element?.props && element?.props.children) {
      return reactWrappedWithIds(element?.props.children, key)
    }

    if (element.props && !element.props.children) {
      return ''
    }
  }

  return ''
}
