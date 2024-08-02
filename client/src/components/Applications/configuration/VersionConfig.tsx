import { Button, Card, Checkbox, Form, Input } from 'antd'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { apiAxiosToast } from '../../../helpers/axios'
import { updateApplication } from '../../../store/slices/applicationSlice'
import { IApplication } from 'types/schemas/Applications.ts'
import constants from '../../../helpers/constants/constants'
import { useDispatch } from 'react-redux'

interface IProps {
  application: IApplication | null
}

const VersionConfig = ({ application }: IProps) => {
  const [required, setRequired] = useState(false)
  const [saving, setSaving] = useState(false)
  const versionConfig = application?.config?.version_config || {}

  const initialValues = { ...versionConfig }

  const dispatch = useDispatch()

  const onSave = async (values: any) => {
    console.log(values)
    setSaving(true)
    const toastNotification = toast.info('Saving...', {
      isLoading: true,
    })

    const { data } = await apiAxiosToast(toastNotification)?.put(`/applications/${application?._id}/config`, {
      configModule: constants.CONFIG_MODULES.VERSION_CONFIG,
      ...values,
    })
    if (data?.success) {
      toast.update(toastNotification, {
        isLoading: false,
        type: 'success',
        render: 'Saved successfully',
        autoClose: 2000,
      })

      dispatch(updateApplication(data?.data?.application))
    }

    setSaving(false)
  }

  return (
    <>
      <section className="application-version-config">
        <Card className="m-b-20">
          <div className="title m-b-20">Version Configuration</div>
          <Form layout="vertical" onFinish={onSave} initialValues={initialValues}>
            <Form.Item label="Docker Repository">
              <div className="grid c-3">
                <Form.Item label="Namespace" name={'namespace'}>
                  <Input placeholder="Enter namespace" />
                </Form.Item>

                <Form.Item label="Repository" name={'repository'}>
                  <Input placeholder="Enter repository name" />
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item name={'docker_hub_webhooks'} valuePropName="checked">
              <Checkbox>Enable Docker Hub Webhooks</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button loading={saving} htmlType="submit" type="primary">
                Save
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card className="m-b-20">
          <Form layout="vertical" initialValues={initialValues} onFinish={onSave}>
            <Form.Item label="Docker Hub">
              <div className="grid c-3">
                <Form.Item name={'docker_hub_username'} label="Username">
                  <Input onChange={(e) => setRequired(!!e.target?.value)} />
                </Form.Item>
              </div>
              <div className="grid c-3">
                <Form.Item name={'docker_hub_password'} label="Password" required={required} rules={[{ required }]}>
                  <Input.Password />
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item>
              <Button loading={saving} htmlType="submit" type="primary">
                Update Credentials
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </section>
    </>
  )
}

export default VersionConfig
