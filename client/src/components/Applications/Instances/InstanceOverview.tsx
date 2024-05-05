import IInstance from 'types/schemas/Instances'
import { IApplication } from '../../../store/slices/applicationSlice'
import { Button, Card, Tag } from 'antd'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { IStore } from 'client/src/store/store'
import Icon from '../../Icon'
import MenuContainer, { useMenuContainer } from '../../MenuContainer'
import { TagContainer, TagInterface } from '../../Tags'
import { apiAxios } from '../../../helpers/axios'
import { UpdateType, ConfigModules } from 'types/enums'

import { useState } from 'react'

interface IProps {
  instance?: IInstance
  application?: IApplication
  setInstance: (instance: IInstance) => void
  toggleInstanceEdit: (open: boolean) => void
}
const InstanceOverview = ({ instance, application, setInstance, toggleInstanceEdit }: IProps) => {
  const [saving, setSaving] = useState(false)
  const swarms = useSelector((state: IStore) => state.swarms)

  const menuContainer = useMenuContainer()
  console.log(menuContainer)

  const swarm = swarms.find((swarm) => swarm?._id === instance?.swarm_id)

  const handleTagSave = async (tags: string[], updateType: UpdateType) => {
    const payload: {
      configModule: ConfigModules
      updateType: UpdateType
      tags: string[]
    } = {
      configModule: ConfigModules.TAGS,
      updateType,
      tags,
    }
    const { data } = await apiAxios.put(`/applications/${application?._id}/instances/${instance?._id}/config`, payload)

    if (data.success) {
      setInstance(data?.data?.instance?.instance)
    }

    menuContainer?.closeMenu?.()
  }

  return (
    <section className="instance-overview">
      <Card className="instance-overview-card" loading={saving}>
        <div className="instance-overview-grid">
          <div className="grid-child">
            <div>
              <div className="title">Instance</div>
              <span>{instance?.name}</span>
            </div>
            <div>
              <div className="title">Image</div>
              <span>{`${instance?.version?.namespace ? `${instance?.version?.namespace}/` : ''}` || ''}</span>
              <span>{`${instance?.version?.repository ? `${instance?.version?.repository}/` : ''}`}</span>
              <span>{instance?.version?.tag}</span>
            </div>
            <div>
              <div className="title">Database</div>
              <span>{instance?.database?.toString()}</span>
            </div>
            <div>
              <div className="title">Created at</div>
              <span>{moment(instance?.created_at).format('LLL')}</span>
            </div>
            <div>
              <div className="title">Deployed On</div>
              <span>{moment(instance?.deployed_at).format('LLL')}</span>
            </div>
          </div>
          <div className="grid-child">
            <div>
              <div className="title">Swarm</div>
              <div className="d-flex align-center justify-between">
                <span>{swarm?.name || instance?.swarm_id?.toString() || 'None'}</span>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleInstanceEdit(true)
                  }}
                  type="link"
                  icon={<Icon icon="PLUG" />}
                >
                  Configure
                </Button>
              </div>
            </div>
          </div>
          <div className="grid-child">
            <div>
              <div className="title">Port Configuration</div>
              <div className="d-flex justify-between align-center">
                <span>{instance?.port || 'Not Configured'}</span>
                <Button type="link" icon={<Icon icon="PLUG" />}>
                  Configure
                </Button>
              </div>
            </div>
            <div className="p-relative">
              <div>Tags</div>
              <TagContainer onTagDelete={handleTagSave} allowDelete tags={instance?.tags || []} />
              <MenuContainer
                MenuComponent={<TagInterface onSave={handleTagSave} />}
                width={400}
                menuContainer={menuContainer}
              >
                <Button className="tag-btn" type="link" icon={<Icon icon="TAG" />}>
                  Add Tags
                </Button>
              </MenuContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* <StatisticBanner loading={false}>
        <div>
          <div className='title'>Replicas</div>
          <div className='value'>{1}</div>
        </div>
        <div>
          <div>
            <div className='title'>CPU Usage</div>
            <div className='value'>{`22%`}</div>
          </div>
        </div>
        <div>
          <div>
            <div className='title'>Memory</div>
            <div className='value'>{"424 Mb"}</div>
          </div>
        </div>
        <div>
          <div>
            <div className='title'>Version</div>
            <div className='value'>{instance?.version?.tag}</div>
          </div>
        </div>
      </StatisticBanner> */}
    </section>
  )
}

export default InstanceOverview
