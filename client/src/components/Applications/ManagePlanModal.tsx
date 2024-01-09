import {
  Button,
  Card,
  Collapse,
  CollapseProps,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
} from "antd"
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons"
import { ICurrency } from "../../store/slices/configData"
import constants from "../../helpers/constants/constants"
import { IPlan } from "../../pages/Applications/ViewApplication/PlansContainer"

export interface IManagePlanModalProps {
  open: boolean
  currencies: { [key: string]: ICurrency }
  onCancel: () => void
  onPlanCreate?: (values: any) => void
  onPlanUpdate?: (values: any) => void
  onPlanDelete?: () => void
  plan?: IPlan | null
}

const ManagePlanModal = (props: IManagePlanModalProps) => {
  const additionalConfigCollapseItems: CollapseProps["items"] = [
    {
      key: "1",
      label: "Additional Configuration",
      children: (
        <Form.List name='additional_configuration'>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align='baseline'
                >
                  <Form.Item
                    {...restField}
                    name={[name, "property"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder='Property' />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "value"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder='Value' />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type='dashed'
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add field
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      ),
    },
  ]

  const isUpdate = !!props?.plan?._id
  const isReadOnly = isUpdate

  const title = (
    <div className='top-bar'>
      <div className='title'>{props?.plan?._id ? "Edit" : "Create"} Plan</div>
      <div className='description'>
        A plan allows you to create subscriptions for your application
      </div>
    </div>
  )

  const onSave = async (values: any) => {
    props?.plan?._id
      ? props?.onPlanUpdate?.(values)
      : props?.onPlanCreate?.(values)
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
      <Form
        layout='vertical'
        onFinish={onSave}
        preserve={false}
        initialValues={props?.plan || {}}
      >
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
            <Select disabled={isReadOnly} showSearch>
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
            <Select disabled={isReadOnly}>
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
            <Input disabled={isReadOnly} type='number' min={0} />
          </Form.Item>
        </div>
        <Collapse items={additionalConfigCollapseItems} ghost />
        <div className='d-flex justify-end'>
          <Button className='m-r-10' onClick={props.onCancel}>
            Cancel
          </Button>
          {isUpdate && (
            <Popconfirm
              title='Are you sure you want to delete this plan?'
              onConfirm={props?.onPlanDelete}
            >
              <Button className='m-r-10' danger>
                Delete
              </Button>
            </Popconfirm>
          )}
          <Button htmlType='submit' type='primary'>
            {props?.plan?._id ? "Update" : "Create"} Plan
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default ManagePlanModal
