/*
 * Copyright SaaScape (c) 2024.
 */

import IInstance from 'types/schemas/Instances.ts'
import { Button, Form, Input, InputNumber, Select, Tooltip } from 'antd'
import { IStore } from '../../../store/store.ts'
import { useSelector } from 'react-redux'
import Icon from '../../Icon.tsx'
import { useState } from 'react'
import { misc } from 'types/enums.ts'

interface IProps {
  instance?: IInstance
  onClose: () => void
}

const requiredFormItemRules = [{ required: true }]

const EditInstanceMenu = ({ instance, onClose }: IProps) => {
  console.log(instance)
  const [isCustomDatabase, setIsCustomDatabase] = useState(instance?.is_custom_database)
  const swarms = useSelector((state: IStore) => state.swarms)

  const [form] = Form.useForm()
  const toolTips = {
    port:
      instance?.port_assignment === 'manual'
        ? `Manually specify a port for this instance to run on`
        : 'This instance has been assigned a port automatically',
    replicas: 'Number of instances to run',
    database: 'Name of the database',
  }

  const useCustomDatabase = (value: boolean) => {
    setIsCustomDatabase(value)
    if (!value) {
      form.setFieldValue('database', '')
    }
  }

  return (
    <div className={'edit-instance-container p-relative'}>
      <div className={'body p-20'}>
        <Form form={form} initialValues={instance} layout={'vertical'}>
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
                onClick={() => useCustomDatabase(!isCustomDatabase)}
              >
                <Icon icon="ROTATE" />
              </Button>
            </Tooltip>
          </div>

          <Form.Item label="Tenant">{instance?.tenant ? instance.tenant?.toString() : misc.NOT_ASSIGNED}</Form.Item>
        </Form>
      </div>
      <div className="footer p-absolute d-flex justify-end">
        <Button className={'m-r-10'} onClick={onClose}>
          Cancel
        </Button>
        <Button type="primary" onClick={() => form.submit()}>
          Save
        </Button>
      </div>
    </div>
  )
}

export default EditInstanceMenu
