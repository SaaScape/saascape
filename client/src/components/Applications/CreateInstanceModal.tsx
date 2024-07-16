/*
 * Copyright SaaScape (c) 2024.
 */

import { Button, Form, Input, Modal, Select, Tooltip } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useState } from 'react'
import { IVersion } from '../../pages/Applications/ViewApplication/VersionsContainer'
import { IApplication } from '../../store/slices/applicationSlice'
import { apiAxios } from '../../helpers/axios'
import { useSelector } from 'react-redux'
import { IStore } from '../../store/store'
import Icon from '../Icon'
import { IDomain } from '../../pages/Domains/DomainsContainer.tsx'

interface IProps {
  open: boolean
  onCancel: () => void
  selectedApplication: IApplication | null
  onFinish: (values: any) => void
}

const CreateInstanceModal = ({ open, onCancel, selectedApplication, onFinish }: IProps) => {
  const [versions, setVersions] = useState<IVersion[]>()
  const [domains, setDomains] = useState<IDomain[]>()
  const [isFetchingVersions, setIsFetchingVersions] = useState(false)
  const [isFetchingDomains, setIsFetchingDomains] = useState(false)
  const [isCustomDatabase, setIsCustomDatabase] = useState(false)

  const swarms = useSelector((state: IStore) => state.swarms)

  const [form] = Form.useForm()

  useEffect(() => {
    searchForVersions('')
    getDomains('')
  }, [selectedApplication])

  useEffect(() => {
    form.setFieldValue('is_custom_database', isCustomDatabase)
  }, [isCustomDatabase, form])

  const searchForVersions = async (value: string) => {
    if (!selectedApplication) return
    setIsFetchingVersions(true)
    let searchQuery = `limit=25&page=1`
    value?.length && (searchQuery += `&searchValue=${value}`)
    const { data } = await apiAxios.get(`/applications/${selectedApplication?._id}/versions?${searchQuery}`)
    if (data?.success) {
      setVersions(data?.data?.data?.paginatedData?.records)
    }
    setIsFetchingVersions(false)
  }

  const versionOptions = versions?.map((version) => {
    return {
      label: version.tag,
      value: version._id,
    }
  })

  const swarmOptions = swarms?.map((swarm) => {
    return {
      label: swarm.name,
      value: swarm._id,
    }
  })

  const onFormFinish = (values: any) => {
    const { is_custom_database } = form.getFieldValue(null)
    const obj = { ...values, is_custom_database }
    onFinish?.(obj)
  }

  const isUseCustomDatabase = (value: boolean) => {
    setIsCustomDatabase(value)
    if (!value) {
      form.setFieldValue('database', '')
    }
  }

  const initialValues = {
    swarm_id: swarmOptions?.[0]?.value,
  }

  const getDomains = async (value: string) => {
    setIsFetchingDomains(true)
    let searchQuery = `limit=25&page=1&availableOnly=true`
    value?.length && (searchQuery += `&searchValue=${value}`)
    const { data } = await apiAxios.get(`/domains?${searchQuery}`)
    if (data?.success) {
      setDomains(data?.data?.data?.paginatedData?.records)
    }
    setIsFetchingDomains(false)
  }
  const domainOptions = domains?.map((domain) => {
    return {
      label: domain.domain_name,
      value: domain._id,
    }
  })

  return (
    <Modal
      destroyOnClose
      className="create-instance-modal"
      width={'75%'}
      open={open}
      onCancel={onCancel}
      title="Create Instance"
      footer={null}
    >
      <div className="top-bar">
        <div className="title">Instance</div>
        <p>Deploy your application with an instance</p>
      </div>

      <Form form={form} onFinish={onFormFinish} initialValues={initialValues}>
        <div className="grid c-2">
          <Form.Item label="Instance Name" name="name" rules={[{ required: true, message: 'Please enter a name' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Version" name="version_id" rules={[{ required: true, message: 'Please select a version' }]}>
            <Select
              loading={isFetchingVersions}
              options={versionOptions}
              showSearch
              onSearch={searchForVersions}
              filterOption={false}
            />
          </Form.Item>
        </div>
        <div className="grid c-2">
          <Form.Item label="Description" name="description">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name={'swarm_id'} label="Swarm" rules={[{ required: true }]}>
            <Select options={swarmOptions} suffixIcon={<Icon icon="DOCKER" style="brands" />} />
          </Form.Item>
        </div>
        <div className="grid c-2">
          <div className="database-selection-container d-flex align-center">
            <Form.Item label="Database" name="database" rules={[{ required: true }]}>
              {isCustomDatabase ? <Input /> : <Select suffixIcon={<Icon icon="DATABASE" />} />}
            </Form.Item>
            <Tooltip title={isCustomDatabase ? 'Use tenant database ' : 'Use a custom database'}>
              <Button
                type="text"
                className="icon d-flex justify-center"
                onClick={() => isUseCustomDatabase(!isCustomDatabase)}
              >
                <Icon icon="ROTATE" />
              </Button>
            </Tooltip>
          </div>
          <Form.Item label="Domain" name="domain_id">
            <Select
              onClick={(e) => e.stopPropagation()}
              loading={isFetchingDomains}
              options={domainOptions}
              showSearch
              onSearch={getDomains}
              filterOption={false}
              allowClear={true}
            />
          </Form.Item>
        </div>
      </Form>
      <div className="d-flex justify-end">
        <Button type="primary" onClick={() => form.submit()}>
          Create
        </Button>
      </div>
    </Modal>
  )
}

export default CreateInstanceModal
