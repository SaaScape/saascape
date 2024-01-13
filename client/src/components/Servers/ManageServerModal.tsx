import { Button, Form, Input, Modal, Select } from "antd"
import TextArea from "antd/es/input/TextArea"

interface IProps {
  onCancel: () => void
  open: boolean
  server?: any
  testConnection?: (...args: any[]) => any
  onSave: (...args: any[]) => any
  loading: boolean
}

const ManageServerModal = (props: IProps) => {
  const { onCancel, open, server, testConnection, loading, onSave } = props

  const title = (
    <div className='top-bar'>
      <div className='title'>{server ? "Manage Server" : "Create Server"}</div>
      <div className='description'></div>
    </div>
  )

  const [form] = Form.useForm()

  const onSubmit = (values: any) => {
    onSave?.(values, form)
  }

  const onTestConnection = async () => {
    const errorArr: any[] = []

    await form
      .validateFields({
        validateOnly: true,
      })
      .catch((errors) => {
        const { errorFields } = errors
        for (const field of errorFields) {
          if (
            ![
              "admin_username",
              "private_key",
              "server_ip_address",
              "ssh_port",
            ].includes(field?.name?.[0])
          )
            continue
          errorArr.push(field)
        }
        form.setFields(errorArr)
      })

    if (errorArr.length > 0) return

    const values = form.getFieldsValue()
    testConnection?.(values, form)
  }

  const initialValues = {}

  return (
    <Modal
      onCancel={onCancel}
      className='manage-server-modal'
      destroyOnClose={true}
      open={open}
      title={title}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={initialValues}
        onFinish={onSubmit}
      >
        <div className='grid c-2'>
          <Form.Item
            label='Server Name'
            name='server_name'
            required
            rules={[{ required: true }]}
          >
            <Input type='text' placeholder='server-01' />
          </Form.Item>
        </div>
        <div className='grid c-3'>
          <Form.Item
            label='IP Address'
            name='server_ip_address'
            required
            rules={[{ required: true }]}
          >
            <Input type='text' />
          </Form.Item>
          <div className='grid c-2'>
            <Form.Item
              label='SSH Port'
              name='ssh_port'
              required
              rules={[{ required: true }]}
            >
              <Input type='number' />
            </Form.Item>
          </div>
        </div>
        <div className='grid c-3'>
          <Form.Item
            label='Username'
            name='admin_username'
            required
            rules={[{ required: true }]}
          >
            <Input type='text' />
          </Form.Item>
        </div>
        <div className='grid c-2'>
          <Form.Item
            label='Private Key'
            name='private_key'
            required
            rules={[{ required: true }]}
          >
            <TextArea />
          </Form.Item>
          <div className='d-flex align-center p-t-7'>
            <Button loading={loading} onClick={onTestConnection}>
              Test Connection
            </Button>
          </div>
        </div>

        <div className='d-flex justify-end'>
          <Button loading={loading} className='m-r-10' onClick={onCancel}>
            Cancel
          </Button>
          <Button loading={loading} htmlType='submit' type='primary'>
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default ManageServerModal
