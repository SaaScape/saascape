/*
Copyright (c) 2024 Keir Davie <keir@keirdavie.me>
Author: Keir Davie <keir@keirdavie.me>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import * as solid from '@fortawesome/free-solid-svg-icons'
import * as regular from '@fortawesome/free-regular-svg-icons'
import * as brands from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export type IconStyles = 'solid' | 'regular' | 'brands'

interface IProps {
  icon: string
  style?: IconStyles
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
    SERVER: solid.faServer,
    DOMAIN: solid.faGlobe,
    TENANT: solid.faBuilding,
    DATABASE: solid.faDatabase,
    APPLICATION: solid.faTerminal,
    BRANCH: solid.faCodeBranch,
    PLAN: solid.faCreditCard,
    CONFIG: solid.faCogs,
    CONTACTS: solid.faAddressBook,
    TRASH: solid.faTrash,
    MENU: solid.faEllipsisVertical,
    NEW_TAB: solid.faUpRightFromSquare,
    SECURE: solid.faLock,
    INSECURE: solid.faUnlock,
    PEN: solid.faPen,
    ROTATE: solid.faRotate,
    INSTANCE: solid.faCircleNodes,
    PLUG: solid.faPlug,
    TAG: solid.faTag,
    CLOSE: solid.faClose,
    UPLOAD: solid.faUpload,
  },
  regular: {
    BELL: regular.faBell,
  },
  brands: {
    DOCKER: brands.faDocker,
    STRIPE: brands.faStripe,
    DOCKER_HUB: brands.faDocker,
  },
}

const Icon = (props: IProps) => {
  const { icon, style = 'solid' } = props

  return <FontAwesomeIcon icon={iconsObj?.[style]?.[icon]} />
}

export default Icon
