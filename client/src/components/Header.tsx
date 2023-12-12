import { Input } from "antd"
import Icon from "./Icon"

const Header = () => {
  return (
    <header>
      <div className='container d-flex justify-between align-center'>
        <div className='d-flex align-center'>
          <span className='menu-toggle'>
            <Icon icon='BARS' />
          </span>
          <div className='search-container'>
            <Input placeholder='Search...' />
            <span className='icon'>
              <Icon icon='SEARCH' />
            </span>
          </div>
        </div>
        <div></div>
      </div>
    </header>
  )
}

export default Header
