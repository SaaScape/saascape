import { Button, Form, Input, Modal, Select } from "antd"
import { ICurrency } from "../../store/slices/configData"
import constants from "../../helpers/constants/constants"

export interface ICreatePlanModalProps {
  open: boolean
  currencies: { [key: string]: ICurrency }
  onCancel: () => void
  onPlanCreate: (values: any) => void
}

const CreatePlanModal = (props: ICreatePlanModalProps) => {
  const title = (
    <div className='top-bar'>
      <div className='title'>Create Plan</div>
      <div className='description'>
        A plan allows you to create subscriptions for your application
      </div>
    </div>
  )

  const onSave = async (values: any) => {
    props?.onPlanCreate?.(values)
  }

  return (
    <Modal
      destroyOnClose
      title={title}
      open={props?.open}
      onCancel={props?.onCancel}
      className='create-plan-modal'
      footer={null}
      width={800}
    >
      <Form layout='vertical' onFinish={onSave} preserve={false}>
        <div className='grid c-2'>
          <Form.Item
            label='Plan Name'
            name={"plan_name"}
            required
            rules={[{ required: true }]}
          >
            <Input placeholder='Enter plan name' />
          </Form.Item>
        </div>
        <div className='grid c-3'>
          <Form.Item
            label='Currency'
            name={"currency"}
            required
            rules={[{ required: true }]}
          >
            <Select showSearch>
              {Object.values(props?.currencies || {})?.map((currency) => (
                <Select.Option key={currency.code} value={currency.code}>
                  {currency.code}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className='grid c-2'>
            <Form.Item
              label='Price'
              name={"price"}
              required
              rules={[{ required: true }]}
            >
              <Input type='number' min={0} />
            </Form.Item>
          </div>
        </div>
        <div className='grid c-3'>
          <Form.Item
            label='Billing Interval'
            name={"billing_interval"}
            required
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value={constants.BILLING_INTERVAL.DAY}>
                Daily
              </Select.Option>
              <Select.Option value={constants.BILLING_INTERVAL.WEEK}>
                Weekly
              </Select.Option>
              <Select.Option value={constants.BILLING_INTERVAL.MONTH}>
                Monthly
              </Select.Option>
              <Select.Option value={constants.BILLING_INTERVAL.ANNUAL}>
                Annually
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label='Billing Interval Count'
            name={"billing_interval_count"}
            required
            rules={[{ required: true }]}
          >
            <Input type='number' min={0} />
          </Form.Item>
        </div>
        <div className='d-flex justify-end'>
          <Button className='m-r-10' onClick={props.onCancel}>
            Cancel
          </Button>
          <Button htmlType='submit' type='primary'>
            Create Plan
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default CreatePlanModal
