import { Button, Collapse, Form, Input, Modal, Select } from "antd"
import { IContact } from "../../pages/Contacts/ContactsContainer"

interface IProps {
  open: boolean
  onSave: (values: any) => void
  onCancel: () => void
  contact: IContact | null
}

const ManageContactModal = (props: IProps) => {
  const { open, onSave, onCancel, contact } = props

  const [form] = Form.useForm()

  const title = (
    <div className='top-bar'>
      <div className='title'>{contact ? "Edit Contact" : "Create Contact"}</div>
      <div className='description'></div>
    </div>
  )
  const onSubmit = (values: any) => {
    onSave(values)
  }

  const addressCollapse = [
    {
      label: "Address",
      children: (
        <>
          <div className='grid c-2'>
            <Form.Item
              name={"address_country"}
              label={"Country"}
              rules={[{ required: true }]}
            >
              <Input type='text' placeholder={"United Kingdom"} />
            </Form.Item>
          </div>
          <div className='grid c-3'>
            <Form.Item
              name={"address_line_1"}
              label={"Line 1"}
              rules={[{ required: true }]}
            >
              <Input type='text' placeholder={"123 Open Sourced Street"} />
            </Form.Item>
            <Form.Item name={"address_line_2"} label={"Line 2"}>
              <Input type='text' placeholder={"+44 123 456 789"} />
            </Form.Item>
          </div>
          <div className='grid c-3'>
            <Form.Item
              name={"address_city"}
              label={"City"}
              rules={[{ required: true }]}
            >
              <Input type='text' placeholder={"London"} />
            </Form.Item>
            <Form.Item
              name={"address_postal_code"}
              required
              label={"Post Code"}
              rules={[{ required: true }]}
            >
              <Input type='text' placeholder={"SE1 234"} />
            </Form.Item>
            <Form.Item name={"address_state"} label={"State"}>
              <Input type='text' placeholder={"England"} />
            </Form.Item>
          </div>
        </>
      ),
    },
  ]

  const initialValues = contact || {
    contact_type: "lead",
  }

  return (
    <Modal
      onCancel={onCancel}
      className='manage-contact-modal'
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
        <div className='grid c-3'>
          <Form.Item
            label='First Name'
            name='first_name'
            required
            rules={[{ required: true }]}
          >
            <Input type='text' placeholder='John' />
          </Form.Item>
          <Form.Item
            label='Last Name'
            name='last_name'
            required
            rules={[{ required: true }]}
          >
            <Input type='text' placeholder='Doe' />
          </Form.Item>
        </div>
        <div className='grid c-2'>
          <Form.Item
            name={"contact_type"}
            label={"Contact Type"}
            rules={[{ required: true }]}
          >
            <Select options={[{ value: "lead", label: "Lead" }]} />
          </Form.Item>
        </div>
        <div className='grid c-2'>
          <Form.Item
            name={"email"}
            label={"Email"}
            rules={[{ required: true }]}
          >
            <Input type={"email"} placeholder={"john.doe@example.com"} />
          </Form.Item>
        </div>
        <div className='grid c-2'>
          <Form.Item
            name={"phone"}
            label={"Phone Number"}
            rules={[{ required: true }]}
          >
            <Input type='text' placeholder={"+44 123 456 789"} />
          </Form.Item>
        </div>
        <Collapse items={addressCollapse} ghost />
        <div className='d-flex justify-end'>
          <Button className='m-r-10' onClick={onCancel}>
            Cancel
          </Button>
          <Button htmlType='submit' type='primary'>
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default ManageContactModal
