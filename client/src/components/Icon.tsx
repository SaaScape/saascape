import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import * as solid from "@fortawesome/free-solid-svg-icons"
import * as regular from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export type IconStyles = "solid"
interface IProps {
  icon: string
  style?: "solid" | "regular"
}

interface IIconsObj {
  [style: string]: { [icon: string]: IconDefinition }
}

const iconsObj: IIconsObj = {
  solid: {
    BARS: solid.faBars,
    PLUS: solid.faPlus,
    DASHBOARD: solid.faDashboard,
    USERS: solid.faUsers,
    CLIENTS: solid.faPerson,
    SEARCH: solid.faSearch,
    LOGOUT: solid.faRightFromBracket,
    USER_PEN: solid.faUserPen,
    TREND_UP: solid.faArrowTrendUp,
    TREND_DOWN: solid.faArrowTrendDown,
    USER: solid.faUser,
    SETTINGS: solid.faGear,
  },
  regular: {
    BELL: regular.faBell,
  },
}

const Icon = (props: IProps) => {
  const { icon, style = "solid" } = props

  return <FontAwesomeIcon icon={iconsObj?.[style]?.[icon]} />
}

export default Icon
