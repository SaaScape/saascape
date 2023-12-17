import React, { useEffect, useRef, useState } from "react"
import { CSSTransition } from "react-transition-group"

interface IProps {
  children: React.ReactNode[] | React.ReactNode
  MenuComponent: JSX.Element
  onChange?: (value: boolean) => void
}

const MenuContainer = (props: IProps) => {
  const { MenuComponent } = props
  const [showMenu, setShowMenu] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { onChange } = props

  const toggleMenu = (e: React.MouseEvent) => {
    if (menuRef.current?.contains(e.target as Node)) return
    setShowMenu((curr) => !curr)
  }

  const closeMenu = () => {
    setShowMenu(false)
  }

  useEffect(() => {
    if (!showMenu) return
    const event = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return
      if (menuRef.current?.contains(e.target as Node)) return
      closeMenu()
    }
    document.body.addEventListener("click", event)

    return () => {
      document.body.removeEventListener("click", event)
    }
  }, [showMenu])

  useEffect(() => {
    onChange?.(showMenu)
  }, [showMenu])

  return (
    <div
      ref={containerRef}
      className='component-menu-container'
      onClick={toggleMenu}
    >
      {props.children}
      <CSSTransition
        in={showMenu}
        timeout={300}
        classNames='menu-animate'
        unmountOnExit={true}
        nodeRef={menuRef}
      >
        <div ref={menuRef} className='component-menu'>
          {MenuComponent}
        </div>
      </CSSTransition>
    </div>
  )
}

export default MenuContainer
