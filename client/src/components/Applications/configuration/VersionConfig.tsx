import { Button, Card, Form, Input } from "antd"
import { useState } from "react"
import { toast } from "react-toastify"
import { apiAxiosToast } from "../../../helpers/axios"
import { IApplication } from "../../../store/slices/applicationSlice"
import constants from "../../../helpers/constants/constants"

interface IProps {
  application: IApplication | null
}

const VersionConfig = ({ application }: IProps) => {
  const [required, setRequired] = useState(false)
  const [saving, setSaving] = useState(false)

  const onSave = async (values: any) => {
    console.log(values)
    setSaving(true)
    const toastNotification = toast.info("Saving...", {
      isLoading: true,
    })

    const { data } = await apiAxiosToast(toastNotification)?.put(
      `/applications/${application?._id}/config`,
      {
        configModule: constants.CONFIG_MODULES.VERSION_CONFIG,
        ...values,
      }
    )
    if (data?.success) {
      toast.update(toastNotification, {
        isLoading: false,
        type: "success",
        render: "Saved successfully",
        autoClose: 2000,
      })

      console.log(data.data)
    }

    setSaving(false)
  }

  return (
    <>
      <section className='application-version-config'>
        <Card>
          <Form layout='vertical' onFinish={onSave}>
            <Form.Item label='Docker Hub'>
              <div className='grid c-3'>
                <Form.Item name={"docker_hub_username"} label='Username'>
                  <Input onChange={(e) => setRequired(!!e.target?.value)} />
                </Form.Item>
              </div>
              <div className='grid c-3'>
                <Form.Item
                  name={"docker_hub_password"}
                  label='Password'
                  required={required}
                  rules={[{ required }]}
                >
                  <Input.Password />
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item>
              <Button loading={saving} htmlType='submit' type='primary'>
                Save
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </section>
    </>
  )
}

export default VersionConfig
