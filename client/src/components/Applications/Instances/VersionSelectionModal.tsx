/*
 * Copyright SaaScape (c) 2024.
 */

import { useEffect, useState } from 'react'
import { apiAxios } from '../../../helpers/axios.ts'
import { IApplication } from 'types/schemas/Applications.ts'
import { IVersion } from '../../../pages/Applications/ViewApplication/VersionsContainer.tsx'
import { Button, Form, Modal, Select } from 'antd'

import IInstance from 'types/schemas/Instances.ts'

interface IProps {
  selectedApplication: IApplication | null
  instance?: IInstance
  open: boolean
  onCancel: () => void
  onVersionUpdate: (data: any) => void
  saving: boolean
}

const VersionSelectionModal = ({ selectedApplication, open, onCancel, onVersionUpdate, instance, saving }: IProps) => {
  const [isFetchingVersions, setIsFetchingVersions] = useState(false)
  const [versions, setVersions] = useState<IVersion[]>()

  const [form] = Form.useForm()

  useEffect(() => {
    searchForVersions('')
  }, [selectedApplication])

  useEffect(() => {
    ;(async () => {
      if (!instance || !selectedApplication?._id) return
      const { data } = await apiAxios.get(`/applications/${selectedApplication?._id}/versions/${instance?.version_id}`)
      if (data?.success) {
        console.log(data.data.version)
        form.setFieldsValue({
          version_id: data?.data?.version?._id,
        })
      }
    })()
  }, [instance, selectedApplication])

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

  const versionOptions = () => {
    const versionsArr = versions?.map((version) => {
      return {
        label: version.tag,
        value: version._id,
      }
    })

    if (!versionsArr?.some((version) => version.value?.toString() === instance?.version_id?.toString())) {
      versionsArr?.push({
        label: instance?.version?.tag || '',
        value: instance?.version_id?.toString() || '',
      })
    }

    return versionsArr
  }

  const onFinish = (data: any) => {
    onVersionUpdate(data)
  }

  const initialValues = {
    version_id: instance?._id,
  }

  return (
    <Modal
      destroyOnClose
      className="update-instance-version-modal"
      open={open}
      onCancel={onCancel}
      title="Update Instance Version"
      footer={null}
    >
      <Form form={form} onFinish={onFinish} initialValues={initialValues}>
        <div className="grid c-2">
          <Form.Item label="Version" name="version_id" rules={[{ required: true, message: 'Please select a version' }]}>
            <Select
              loading={isFetchingVersions}
              options={versionOptions()}
              showSearch
              onSearch={searchForVersions}
              filterOption={false}
            />
          </Form.Item>
        </div>
      </Form>
      <div className="d-flex justify-end">
        <Button type="primary" onClick={() => form.submit()} loading={saving}>
          Update Version
        </Button>
      </div>
    </Modal>
  )
}

export default VersionSelectionModal
