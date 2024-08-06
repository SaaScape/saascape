/*
 * Copyright SaaScape (c) 2024.
 */

import { Button, DatePicker, Form, Input, Modal, Radio, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useReducer, useState } from 'react'
import { apiAxios } from '../../../helpers/axios.ts'
import { IApplication } from 'types/schemas/Applications.ts'
import { IVersion } from '../../../pages/Applications/ViewApplication/VersionsContainer.tsx'

interface Props {
  onCancel: () => void
  open: boolean
  selectedApplication: IApplication | null
  onCreate: (values: any) => void
}

// type ScheduleReducer = (state: boolean, action: boolean) => boolean
//
// const scheduleReducer: ScheduleReducer = (state, action) => action

const CreateDeploymentModal = ({ open, onCancel, selectedApplication, onCreate }: Props) => {
  // const [schedule, dispatchSchedule] = useReducer(scheduleReducer, false)
  const [isFetchingVersions, setIsFetchingVersions] = useState(false)
  const [versions, setVersions] = useState<IVersion[]>()

  const [form] = useForm()

  useEffect(() => {
    searchForVersions('')
  }, [selectedApplication])

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

  const deploymentGroupOptions = Object.values(selectedApplication?.config?.deployment_groups || {})?.map((group) => ({
    label: group.name,
    value: group._id,
  }))

  const onFinish = (values: any) => {
    // deploymentClass?.createDeployment(values)
    onCreate?.(values)
  }

  const initialValues = {}

  return (
    <Modal
      destroyOnClose
      className="saascape-modal create-deployment-modal "
      width={'75%'}
      open={open}
      onCancel={onCancel}
      title="Deployment"
      footer={null}
    >
      <div className="top-bar">
        <div className="title">Create Deployment</div>
        <p>Plan a deployment to an instance group.</p>
      </div>

      <Form form={form} onFinish={onFinish} initialValues={initialValues}>
        <div className="grid c-2">
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter a name' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Deployment Group"
            name="deployment_group"
            rules={[{ required: true, message: 'Please select a deployment group' }]}
          >
            <Select options={deploymentGroupOptions} />
          </Form.Item>
        </div>
        <div className="grid c-2">
          <Form.Item label="Description" name="description">
            <TextArea />
          </Form.Item>
        </div>

        {/*TODO: Implement ability to schedule deployments*/}
        {/*<Form.Item label="Schedule" name="schedule_deployment">*/}
        {/*  <Radio.Group value={schedule} defaultValue={schedule} onChange={(e) => dispatchSchedule(e.target?.value)}>*/}
        {/*    <Radio value={true}>Yes</Radio>*/}
        {/*    <Radio value={false}>No</Radio>*/}
        {/*  </Radio.Group>*/}
        {/*</Form.Item>*/}
        {/*{schedule && (*/}
        {/*  <div className="grid c-2">*/}
        {/*    <Form.Item label={'Deployment Time'} name={'deployment_schedule'}>*/}
        {/*      <DatePicker showTime />*/}
        {/*    </Form.Item>*/}
        {/*  </div>*/}
        {/*)}*/}
        <div className="grid c-2">
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

        <div className="d-flex justify-end">
          <Button type="primary" onClick={() => form.submit()}>
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default CreateDeploymentModal
