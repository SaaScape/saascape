import Icon from "../Icon"
import { Link } from "react-router-dom"

const UserMenu = () => {
  const userMenuItems: { icon?: string; text: string }[][] = [
    [{ icon: "USER", text: "Profile" }],
    [{ icon: "SETTINGS", text: "Settings" }],
    [{ icon: "LOGOUT", text: "Logout" }],
  ]

  return (
    <div className='component-user-menu'>
      {userMenuItems.map((items, index) => (
        <ul key={index}>
          {items.map((item, itemIndex) => {
            return (
              <li key={itemIndex}>
                <Link to='/'>
                  {item?.icon && <Icon icon={item?.icon} />}
                  <span>{item.text}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      ))}
    </div>
  )
}

export default UserMenu
