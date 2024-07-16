import { Button } from "antd"
import Icon from "./Icon"

const MenuIcon = () => {
  return (
    <div className='menu-icon'>
      <Button size='large' type='text' icon={<Icon icon='MENU' />}></Button>
    </div>
  )
}

export default MenuIcon
