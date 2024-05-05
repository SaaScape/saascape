/*
 * Copyright SaaScape (c) 2024.
 */
import React, { useEffect, useRef } from 'react'
import { Button } from 'antd'
import Icon from './Icon.tsx'
import { CSSTransition } from 'react-transition-group'

interface IProps {
  children: React.ReactNode
  title: string
  onClose: () => void
  visible: boolean
}
const SideFullMenu = ({ children, title, visible, onClose }: IProps) => {
  const fullSideMenuRef = useRef<HTMLDivElement>(null)
  const fullSideMenuContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible) return
    const handleClick = (e: MouseEvent) => {
      if (fullSideMenuRef.current?.contains(e.target as Node)) return
      onClose()
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [visible, fullSideMenuRef, onClose])

  return (
    <CSSTransition
      nodeRef={fullSideMenuContainerRef}
      classNames={'overlay-animation-container'}
      in={visible}
      timeout={300}
      unmountOnExit={true}
    >
      <div ref={fullSideMenuContainerRef} className="custom-component full-side-menu-container">
        <div ref={fullSideMenuRef} className={`custom-component full-side-menu ${visible ? 'visible' : 'hidden'}`}>
          <div className="full-side-menu-header d-flex justify-between align-center">
            <h3>{title}</h3>
            <div>
              <Button onClick={onClose} type={'text'} icon={<Icon icon={'CLOSE'} />}></Button>
            </div>
          </div>
          <div className="full-side-menu-content">{children}</div>
        </div>
      </div>
    </CSSTransition>
  )
}

export default SideFullMenu
