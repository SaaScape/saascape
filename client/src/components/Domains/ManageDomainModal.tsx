import { Button, Form, Input, Modal } from "antd"
import { IDomain } from "../../pages/Domains/DomainsContainer"
import TextArea from "antd/es/input/TextArea"

interface IProps {
  onCancel: () => void
  open: boolean
  domain?: IDomain | null
  onSubmit: (...args: any[]) => any
  loading: boolean
}

const ManageDomainModal = (props: IProps) => {
  const { onCancel, open, domain, onSubmit, loading } = props

  const [form] = Form.useForm()

  const title = domain ? "Edit Domain" : "Add Domain"

  const initialValues = domain ? domain : {}

  return (
    <Modal
      onCancel={onCancel}
      className='manage-domain-modal'
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
        preserve={false}
        onFinish={onSubmit}
      >
        <div className='grid c-2'>
          <Form.Item
            label='Domain Name'
            name='domain_name'
            required
            rules={[
              { required: true },
              {
                pattern: new RegExp(
                  /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/
                ),
                message: "Invalid domain name",
              },
            ]}
          >
            <Input type='text' placeholder='Domain Name' />
          </Form.Item>
        </div>

        <div className='grid c-2'>
          <Form.Item name={"description"} label={"Description"}>
            <TextArea rows={4} placeholder='Description' />
          </Form.Item>
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

export default ManageDomainModal
