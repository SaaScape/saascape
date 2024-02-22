import { Button, Form, Input, Modal, Radio, Select, Space } from "antd"
import TextArea from "antd/es/input/TextArea"
import { ISwarm } from "../../store/slices/swarmSlice"
import { useEffect, useState } from "react"

interface IProps {
  onCancel: () => void
  open: boolean
  server?: any
  testConnection?: (...args: any[]) => any
  onSave: (...args: any[]) => any
  loading: boolean
  swarms: ISwarm[]
}

const ManageServerModal = (props: IProps) => {
  const { onCancel, open, server, testConnection, loading, onSave, swarms } =
    props

  const [showExistingSwarms, setShowExistingSwarms] = useState(!!swarms?.length)

  const title = (
    <div className='top-bar'>
      <div className='title'>{server ? "Manage Server" : "Create Server"}</div>
      <div className='description'></div>
    </div>
  )

  const [form] = Form.useForm()

  useEffect(() => {
    setShowExistingSwarms(!!swarms?.length)
  }, [swarms])

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

  const initialValues = {
    create_swarm: swarms?.length ? false : true,
    swarm_id: swarms?.length ? swarms[0]._id : null,
    node_type: "worker",
  }

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
        preserve={false}
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

        <Form.Item
          label='Swarm'
          name={"create_swarm"}
          required
          rules={[{ required: true }]}
        >
          <Radio.Group
            onChange={(e) => {
              setShowExistingSwarms(!e?.target?.value)
            }}
          >
            <Space direction='vertical'>
              <Radio value={true}>Create New Swarm</Radio>
              {swarms?.length && (
                <Radio value={false}>Join Existing Swarm</Radio>
              )}
            </Space>
          </Radio.Group>
        </Form.Item>

        {showExistingSwarms && (
          <div className='grid c-2'>
            <Form.Item
              label='Swarm to Join'
              name='swarm_id'
              required
              rules={[{ required: true }]}
            >
              <Select
                allowClear
                options={swarms?.map((swarm) => ({
                  value: swarm._id,
                  label: swarm.name,
                }))}
              />
            </Form.Item>
            <div className='grid c-3'>
              <Form.Item
                label='Node Type'
                name='node_type'
                required
                rules={[{ required: true }]}
              >
                <Select
                  allowClear
                  options={[
                    { label: "Master", value: "master" },
                    { label: "Worker", value: "worker" },
                  ]}
                />
              </Form.Item>
            </div>
          </div>
        )}

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
