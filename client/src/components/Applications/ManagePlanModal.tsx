/*
Copyright (c) 2024 Keir Davie <keir@keirdavie.me>
Author: Keir Davie <keir@keirdavie.me>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
  onAddonCreate?: (values: any) => void
  onAddonUpdate?: (values: any) => void
  onAddonDelete?: () => void
  plan?: IPlan | null
  isAddon?: boolean
  addonId?: string | null
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

  const isUpdate =
    !!props?.plan?._id &&
    (props.isAddon ? (!!props?.addonId ? true : false) : true)
  const isReadOnly = isUpdate || props?.isAddon

  const title = (
    <div className='top-bar'>
      <div className='title'>
        {props?.plan?._id && props?.addonId ? "Edit" : "Create"}{" "}
        {props?.isAddon ? "Add-on" : ""} Plan
      </div>
      <div className='description'>
        A plan allows you to create subscriptions for your application
      </div>
    </div>
  )

  const onSave = async (values: any) => {
    values.isAddon = props?.isAddon
    if (isUpdate) {
      props?.isAddon
        ? props?.onAddonUpdate?.({ _id: props?.addonId, ...values })
        : props?.onPlanUpdate?.({ _id: props?.plan?._id, ...values })
    } else {
      props?.isAddon
        ? props?.onAddonCreate?.({ _id: props?.plan?._id, ...values })
        : props?.onPlanCreate?.(values)
    }
  }

  const initialValues = () => {
    const values = { ...props?.plan }
    if (values && props?.isAddon) {
      values.price = 0
      values.plan_name = ""
      values.additional_configuration = []

      if (props?.addonId) {
        const addonObj = values?.addon_plans?.find(
          (addon) => addon?._id === props?.addonId
        )
        values.price = addonObj?.price || 0
        values.plan_name = addonObj?.plan_name || ""
        values.additional_configuration = addonObj?.additional_configuration
      }
    }
    return values
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
        initialValues={initialValues() || {}}
      >
        <Form.Item hidden name={"isAddon"}>
          <Input type='checkbox' checked={props?.isAddon} />
        </Form.Item>
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
              onConfirm={
                props?.isAddon ? props?.onAddonDelete : props?.onPlanDelete
              }
            >
              <Button className='m-r-10' danger>
                Delete
              </Button>
            </Popconfirm>
          )}
          <Button htmlType='submit' type='primary'>
            {isUpdate ? "Update" : "Create"} Plan
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default ManagePlanModal
