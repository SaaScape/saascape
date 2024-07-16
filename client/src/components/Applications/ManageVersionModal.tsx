import { Button, Form, Input, Modal } from "antd"

interface IManageVersionModalProps {
  open: boolean
  onManageVersionClose: () => void
  onCreateVersion: (values: any) => void
  saving?: boolean
}
const ManageVersionModal = ({
  open,
  onManageVersionClose,
  onCreateVersion,
  saving,
}: IManageVersionModalProps) => {
  const title = "Create New Version"

  const submitForm = (values: any) => {
    onCreateVersion?.(values)
  }

  return (
    <Modal
      open={open}
      destroyOnClose
      footer={null}
      onCancel={onManageVersionClose}
      title={title}
    >
      <Form onFinish={submitForm} layout='vertical'>
        <div className='repository grid c-3'>
          <Form.Item label='Namespace' name={"namespace"}>
            <Input placeholder='Enter namespace ' />
          </Form.Item>

          <Form.Item label='Repository' name={"repository"}>
            <Input placeholder='Enter repository name' />
          </Form.Item>

          <Form.Item label='Tag' name={"tag"}>
            <Input placeholder='Enter tag' />
          </Form.Item>
        </div>

        <Form.Item>
          <div className='d-flex justify-end'>
            <Button
              className='m-r-10'
              onClick={onManageVersionClose}
              loading={saving}
            >
              Cancel
            </Button>
            <Button type='primary' htmlType='submit' loading={saving}>
              Create
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ManageVersionModal
