import { Form, Input, Modal } from 'antd'
import { toast } from 'react-toastify'

interface ModalProps {
  open: boolean
  onCancel: () => void
  onOk: (values: any) => void
}

function OvhSetupModal({ open, onOk, onCancel }: ModalProps) {
  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      title={
        <div className={'d-flex title'}>
          <figure className={'logo m-r-10'}>
            <img width={40} src="/files/images/ovh.png" alt="ovh logo" />
          </figure>
          <span>Setup OVH</span>
        </div>
      }
    >
      <div>
        <Form layout="vertical">
          <Form.Item label={'App Key'} name={'appKey'} rules={[{ required: true }]} required>
            <Input />
          </Form.Item>
          <Form.Item label={'App Secret'} name={'appSecret'} rules={[{ required: true }]} required>
            <Input />
          </Form.Item>
          <Form.Item label={'Consumer Key'} name={'consumerKey'} rules={[{ required: true }]} required>
            <Input />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default OvhSetupModal
