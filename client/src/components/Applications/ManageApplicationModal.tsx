import { Button, Form, Input, Modal } from "antd"
import { IApplication } from "../../pages/Applications/ApplicationsContainer"
import { useForm } from "antd/es/form/Form"
import TextArea from "antd/es/input/TextArea"

interface IProps {
  open: boolean
  onSave: (values: any) => void
  onCancel: () => void
  application: IApplication | null
}
const ManageApplicationModal = (props: IProps) => {
  const { open, onSave, onCancel, application } = props

  const [form] = useForm()

  const title = (
    <div className='top-bar'>
      <div className='title'>
        {application ? "Edit Application" : "Create Application"}
      </div>
      <div className='description'>
        An application is an application that you can deploy
      </div>
    </div>
  )

  const onSubmit = (values: any) => {
    onSave(values)
  }

  return (
    <Modal
      onCancel={onCancel}
      className='manage-application-modal'
      destroyOnClose={true}
      open={open}
      title={title}
      footer={null}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={application || {}}
        onFinish={onSubmit}
        preserve={false}
      >
        <Form.Item
          label='Application Name'
          name='application_name'
          required
          rules={[{ required: true }]}
        >
          <Input type='text' placeholder='Name your application' />
        </Form.Item>
        <Form.Item
          label='Description'
          name='description'
          required
          rules={[{ required: true }]}
        >
          <TextArea placeholder='Describe your application' />
        </Form.Item>

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

export default ManageApplicationModal
