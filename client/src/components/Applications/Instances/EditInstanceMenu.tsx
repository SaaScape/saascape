/*
 * Copyright SaaScape (c) 2024.
 */

import IInstance from 'types/schemas/Instances.ts'
import { Button, Form, Input, InputNumber, Select, Tooltip } from 'antd'
import { IStore } from '../../../store/store.ts'
import { useSelector } from 'react-redux'
import Icon from '../../Icon.tsx'
import { useEffect, useState } from 'react'
import { misc } from 'types/enums.ts'
import { apiAxios } from '../../../helpers/axios.ts'
import { IDomain } from '../../../pages/Domains/DomainsContainer.tsx'

interface IProps {
  instance?: IInstance
  onClose: () => void
  onSave: (instance: IInstance) => void
  saving: boolean
}

const requiredFormItemRules = [{ required: true }]

const EditInstanceMenu = ({ instance, onClose, onSave, saving }: IProps) => {
  const [isCustomDatabase, setIsCustomDatabase] = useState(instance?.is_custom_database)
  const [domains, setDomains] = useState<IDomain[]>([])
  const [isFetchingDomains, setIsFetchingDomains] = useState(false)
  const swarms = useSelector((state: IStore) => state.swarms)

  const [form] = Form.useForm()

  useEffect(() => {
    getDomains('')
  }, [])

  const toolTips = {
    port:
      instance?.port_assignment === 'manual'
        ? `Manually specify a port for this instance to run on`
        : 'This instance has been assigned a port automatically',
    replicas: 'Number of instances to run',
    database: 'Name of the database',
  }

  const setUseCustomDatabase = (value: boolean) => {
    setIsCustomDatabase(value)
    if (!value) {
      form.setFieldValue('database', '')
    }
  }

  const getDomains = async (value: string) => {
    setIsFetchingDomains(true)
    let searchQuery = `limit=25&page=1&availableOnly=true&includeDomain=${instance?.domain_id}`
    value?.length && (searchQuery += `&searchValue=${value}`)
    const { data } = await apiAxios.get(`/domains?${searchQuery}`)
    if (data?.success) {
      setDomains(data?.data?.data?.paginatedData?.records)
    }
    setIsFetchingDomains(false)
  }
  const domainOptions = () => {
    const domainsArr = domains?.map((domain) => {
      return {
        label: domain.domain_name,
        value: domain._id,
      }
    })

    if (!domainsArr.some((domain) => domain.value?.toString() === instance?.domain_id?.toString())) {
      domainsArr.push({
        label: instance?.domain?.domain_name || '',
        value: instance?.domain_id?.toString() || '',
      })
    }

    return domainsArr
  }

  const onFinish = (values: any) => {
    onSave?.({ ...values, isCustomDatabase })
  }

  return (
    <div className={'edit-instance-container p-relative'}>
      <div className={'body p-20'}>
        <Form form={form} initialValues={instance} layout={'vertical'} onFinish={onFinish}>
          <Form.Item label={'Instance Name'} name={'name'} rules={requiredFormItemRules}>
            <Input />
          </Form.Item>
          <Form.Item label={'Swarm'} name={'swarm_id'} rules={requiredFormItemRules}>
            <Select
              onClick={(e) => e.stopPropagation()}
              options={(swarms || []).map((swarm) => ({
                label: swarm.name,
                value: swarm._id,
              }))}
            />
          </Form.Item>
          <Form.Item label="Domain" name="domain_id" rules={[{ required: true, message: 'Please select a domain' }]}>
            <Select
              onClick={(e) => e.stopPropagation()}
              loading={isFetchingDomains}
              options={domainOptions()}
              showSearch
              onSearch={getDomains}
              filterOption={false}
            />
          </Form.Item>
          <Form.Item tooltip={toolTips?.port} label={'Port'} name={'port'} rules={requiredFormItemRules}>
            <InputNumber min={0} max={65535} readOnly={instance?.port_assignment === 'auto'} />
          </Form.Item>
          <Form.Item label={'Replicas'} name={'replicas'} rules={requiredFormItemRules}>
            <InputNumber min={0} />
          </Form.Item>

          <div className="database-selection-container d-flex align-center">
            <Form.Item label="Database" name="database" rules={requiredFormItemRules}>
              {isCustomDatabase ? <Input /> : <Select suffixIcon={<Icon icon="DATABASE" />} />}
            </Form.Item>
            <Tooltip title={isCustomDatabase ? 'Use tenant database ' : 'Use a custom database'}>
              <Button
                type="text"
                className="icon d-flex justify-center align-center m-b-0"
                onClick={() => setUseCustomDatabase(!isCustomDatabase)}
              >
                <Icon icon="ROTATE" />
              </Button>
            </Tooltip>
          </div>

          <Form.Item label="Tenant">{instance?.tenant ? instance.tenant?.toString() : misc.NOT_ASSIGNED}</Form.Item>
        </Form>
      </div>
      <div className="footer p-absolute d-flex justify-end">
        <Button className={'m-r-10'} onClick={onClose} loading={saving}>
          Cancel
        </Button>
        <Button type="primary" onClick={() => form.submit()} loading={saving}>
          Save
        </Button>
      </div>
    </div>
  )
}

export default EditInstanceMenu
