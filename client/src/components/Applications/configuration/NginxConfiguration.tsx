/*
 * Copyright SaaScape (c) 2024.
 */

import { updateApplication } from '../../../store/slices/applicationSlice.ts'
import { IApplication } from 'types/schemas/Applications.ts'
import { Button, Card, Form } from 'antd'
import { useState } from 'react'
import 'react-quill/dist/quill.snow.css'
import TextArea from 'antd/es/input/TextArea'
import { toast } from 'react-toastify'
import { apiAxiosToast } from '../../../helpers/axios.ts'
import { ConfigModules } from 'types/enums.ts'
import { useDispatch } from 'react-redux'

interface IProps {
  application: IApplication
}

const NginxConfiguration = ({ application }: IProps) => {
  const [saving, setSaving] = useState(false)

  const dispatch = useDispatch()

  const onSave = async (values: any) => {
    console.log(values)
    setSaving(true)
    const toastId = toast.info('Saving NGINX config', { isLoading: true })
    const { data } = await apiAxiosToast(toastId).put(`/applications/${application._id}/config`, {
      configModule: ConfigModules.NGINX_DIRECTIVE,
      directive: values.directives,
    })

    if (data.success) {
      toast.update(toastId, {
        isLoading: false,
        type: toast.TYPE.SUCCESS,
        render: 'NGINX config saved successfully',
        autoClose: 3000,
      })
      console.log(data)
      dispatch(updateApplication(data?.data?.application))
    }

    setSaving(false)
  }

  const initialValues = application?.config?.nginx || {}

  return (
    <>
      <section className="application-nginx-config">
        <Card className="m-b-20">
          <div className="title m-b-20">NGINX Directives</div>
          <Form initialValues={initialValues} onFinish={onSave}>
            <Form.Item name={'directives'}>
              <TextArea rows={15} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              Save
            </Button>
          </Form>
        </Card>
      </section>
    </>
  )
}

export default NginxConfiguration
