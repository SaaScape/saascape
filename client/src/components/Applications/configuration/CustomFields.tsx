import {
  Button,
  Card,
  Form,
  FormInstance,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  TableColumnProps,
} from "antd"
import Icon from "../../Icon"
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import { apiAxios } from "../../../helpers/axios"
import {
  IApplication,
  updateApplication,
} from "../../../store/slices/applicationSlice"
import constants from "../../../helpers/constants/constants"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"

const fieldTypes = [
  {
    label: "Text",
    value: "text",
  },
  {
    label: "Number",
    value: "number",
  },
  {
    label: "Date",
    value: "date",
  },
  {
    label: "Checkbox",
    value: "checkbox",
  },
  {
    label: "Dropdown",
    value: "dropdown",
  },
  {
    label: "Textarea",
    value: "textarea",
  },
]

interface IProps {
  application: IApplication | null
  loading: boolean
}

const CustomFields = (props: IProps) => {
  const { application, loading } = props

  const [showCustomFieldConfigModal, setShowCustomFieldConfigModal] =
    useState(false)
  const [selectedConfig, setSelectedConfig] = useState<any>(null)
  const [editable, setEditable] = useState<{
    _id: string
    field: string
  } | null>(null)

  const [dataSource, setDataSource] = useState<any>(
    application?.custom_fields || []
  )
  const [updatedFields, setUpdatedFields] = useState<any>([])
  const [form] = Form.useForm()

  const dispatch = useDispatch()

  useEffect(() => {
    if (Object.keys(updatedFields).length) return
    setDataSource([...(application?.custom_fields || [])])
  }, [application, updatedFields])

  const onCancel = () => {
    setSelectedConfig(null)
    setShowCustomFieldConfigModal(false)
  }

  const onConfigSave = async () => {
    setEditable(null)
    const toastId = toast.info(
      <div>Saving custom fields... Please wait!</div>,
      {
        isLoading: true,
      }
    )
    const { data } = await apiAxios.put(
      `/applications/${application?._id}/config`,
      {
        configModule: constants.CONFIG_MODULES.CUSTOM_FIELDS,
        fields: updatedFields,
      }
    )

    if (data?.success) {
      toast.update(toastId, {
        type: "success",
        render: <div>Saving custom fields... Done!</div>,
        isLoading: false,
        autoClose: 1000,
      })
      setUpdatedFields({})
      dispatch(updateApplication(data?.data?.application))
    } else {
      toast.update(toastId, {
        type: "error",
        render: (
          <div>
            <div>Saving custom fields... Failed!</div>
            <br />
            <div>{data?.error}</div>
          </div>
        ),
        isLoading: false,
        autoClose: 1000,
      })
    }
  }

  const checkIfEditable = (_id: string, field: string) =>
    _id === editable?._id && field === editable?.field

  const columns: TableColumnProps<any>[] = [
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      width: 400,
      onCell: (record) => {
        return {
          onClick: () => {
            form.setFieldsValue(record)
            setEditable({ _id: record._id, field: "label" })
          },
        }
      },
      render: (text, record) => {
        const isEditable = checkIfEditable(record?._id, "label")
        return isEditable ? (
          <Form.Item name='label'>
            <Input onChange={() => form.submit()} />
          </Form.Item>
        ) : (
          text
        )
      },
    },
    {
      title: "Field Name",
      dataIndex: "field",
      key: "field",
      width: 400,
      onCell: (record) => {
        return {
          onClick: () => {
            form.setFieldsValue(record)
            setEditable({ _id: record._id, field: "field" })
          },
        }
      },
      render: (text, record) => {
        const isEditable = checkIfEditable(record?._id, "field")
        return isEditable ? (
          <Form.Item name='field'>
            <Input onChange={() => form.submit()} />
          </Form.Item>
        ) : (
          text
        )
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 200,
      onCell: (record) => {
        return {
          onClick: () => {
            if (checkIfEditable(record?._id, "type")) return
            form.setFieldsValue(record)
            setEditable({ _id: record._id, field: "type" })
          },
        }
      },
      render: (text, record) => {
        const isEditable = checkIfEditable(record?._id, "type")
        return isEditable ? (
          <Form.Item name='type'>
            <Select options={fieldTypes} onChange={() => form.submit()} />
          </Form.Item>
        ) : (
          text
        )
      },
    },
    {
      key: "field_info",
      width: 300,
      className: "field-info-column",
      render: (_, record) => {
        return (
          <div className='d-flex direction-column justify-center'>
            {record?.type === "dropdown" && (
              <div className='d-flex'>
                <span className='title d-flex align-center'>Options:</span>
                <span className='value d-flex align-center'>
                  {record?.options?.join(", ")}
                </span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: "actions",
      width: "125px",
      className: "actions-column",
      align: "right",
      render: (_, record) => {
        return (
          <div className='d-flex justify-end'>
            {["dropdown"].includes(record?.type) && (
              <Button
                type='text'
                onClick={() => {
                  setSelectedConfig({ isNew: false, ...record })
                  setShowCustomFieldConfigModal(true)
                }}
              >
                <Icon icon='SETTINGS' />
              </Button>
            )}
            <Button
              className='delete-record'
              type='text'
              onClick={() => deleteConfig(record)}
            >
              <Icon icon='TRASH' />
            </Button>
          </div>
        )
      },
    },
  ]

  const addCustomField = () => {
    let currValue = 0
    setDataSource((curr: any) => {
      currValue = curr.length + 1
      return [
        ...curr,
        {
          label: `Custom Field ${currValue}`,
          type: "text",
          field: `field${currValue}`,
          _id: currValue,
          isNew: true,
        },
      ]
    })

    setUpdatedFields((curr: any) => {
      const obj = { ...curr }
      obj.newFields ??= {}

      obj.newFields[currValue] = {
        label: `Custom Field ${currValue}`,
        type: "text",
        field: `field${currValue}`,
        _id: currValue,
        isNew: true,
      }
      return obj
    })
  }

  const onFinish = (values: any, form: FormInstance) => {
    const isNew = form.getFieldValue("isNew")
    const _id = form.getFieldValue("_id")

    setUpdatedFields((curr: any) => {
      const obj = { ...curr }

      if (isNew) {
        obj.newFields ??= {}
        obj.newFields[_id] ??= {}
        obj.newFields[_id] = {
          ...(curr?.newFields?.[_id] || {}),
          ...values,
        }
      } else {
        obj[_id] ??= {}
        obj[_id] = {
          ...(curr[_id] || {}),
          ...values,
        }
      }

      return obj
    })
    setDataSource((curr: any) => {
      const dataIndex = curr.findIndex((item: any) => item._id === _id)

      curr[dataIndex] = {
        ...curr[dataIndex],
        ...values,
      }

      return [...curr]
    })

    if (showCustomFieldConfigModal) {
      setShowCustomFieldConfigModal(false)
      setSelectedConfig(null)
    }
  }

  const deleteConfig = (record: any) => {
    const { _id, isNew } = record

    setDataSource((curr: any) => {
      return curr.filter((item: any) => item._id !== _id)
    })

    setUpdatedFields((curr: any) => {
      const obj = { ...curr }
      if (isNew) delete obj?.newFields?.[_id]
      else delete obj?.[_id]

      obj.deleted ??= {}
      !isNew && (obj.deleted[_id] = true)
      return obj
    })
  }

  return (
    <>
      <section className='application-custom-fields'>
        <div className='top-bar-container'>
          <div className='top-bar d-flex justify-between align-center'>
            <span className='title'>
              Configure custom fields that can be used throughout the
              application
            </span>
            <div className='right'>
              <Button onClick={addCustomField} icon={<Icon icon='PLUS' />}>
                Add Custom Field
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <Form onFinish={(values) => onFinish(values, form)} form={form}>
            <Table
              loading={loading}
              dataSource={dataSource}
              columns={columns}
              rowKey={"_id"}
            />
            <Popconfirm
              title='Are you sure you want to save?'
              onConfirm={onConfigSave}
            >
              <Button type='primary'>Save</Button>
            </Popconfirm>
          </Form>
        </Card>
      </section>
      <CustomFieldConfigModal
        open={showCustomFieldConfigModal}
        onCancel={onCancel}
        selectedConfig={selectedConfig}
        onFinish={onFinish}
      />
    </>
  )
}

interface IConfigureFieldProps {
  open: boolean
  onCancel: () => void
  selectedConfig: any
  onFinish: (values: Object, form: FormInstance) => void
}
const CustomFieldConfigModal = (props: IConfigureFieldProps) => {
  const { open, onCancel, selectedConfig, onFinish } = props

  const [form] = Form.useForm()

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  }

  useEffect(() => {
    form.setFieldsValue(selectedConfig)
  }, [selectedConfig])

  const formValues = () => {
    switch (selectedConfig?.type) {
      case "dropdown":
        return (
          <Form.List
            name='options'
            rules={[
              {
                validator: async (_, names) => {
                  if (!names || names.length < 1) {
                    return Promise.reject(
                      new Error("At least 1 option is required")
                    )
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    {...(index === 0 ? formItemLayout : formItemLayout)}
                    required={false}
                    key={field.key}
                  >
                    <Form.Item
                      {...field}
                      label=''
                      validateTrigger={["onChange", "onBlur"]}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Please input a value or delete this field.",
                        },
                      ]}
                      noStyle
                    >
                      <Input placeholder='Value' style={{ width: "60%" }} />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircleOutlined
                        className='dynamic-delete-button'
                        onClick={() => remove(field.name)}
                      />
                    ) : null}
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type='dashed'
                    onClick={() => add()}
                    style={{ width: "60%" }}
                    icon={<PlusOutlined />}
                  >
                    Add field
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        )
      default:
        return null
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title='Configure Field'
      destroyOnClose
      footer={null}
    >
      <Form
        preserve={false}
        onFinish={(values) => onFinish?.(values, form)}
        initialValues={selectedConfig}
        form={form}
      >
        {formValues()}
        <Form.Item>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type='primary' htmlType='submit'>
            Save
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CustomFields
