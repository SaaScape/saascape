import { Button, Form, Modal, Select } from "antd"
import { IApplication } from "../../../store/slices/applicationSlice"

interface IProps {
  visible: boolean
  onCancel: () => void
  type: "environment_variables" | "secrets"
  application?: IApplication
  variables: { _id: string }[]
  onImport: (values: any) => void
}

const typeMap = {
  environment_variables: "Environment Variables",
  secrets: "Secrets",
}

const ImportAppVariables = ({
  visible,
  onCancel,
  type,
  application,
  variables,
  onImport,
}: IProps) => {
  const generateVariableOptions = () => {
    const appVariables =
      application?.config?.[
        type === "environment_variables"
          ? "environment_config"
          : "secrets_config"
      ]

    const selectedVariableIds = variables?.map((variable) => variable._id)

    const selectableVariables = Object.values(appVariables || {}).filter(
      (variable) => {
        return !selectedVariableIds?.includes(variable._id)
      }
    )

    return selectableVariables.map((variable) => {
      return {
        label: variable.name,
        value: variable._id,
      }
    })
  }

  const onFinish = (values: any) => {
    const appVariables =
      application?.config?.[
        type === "environment_variables"
          ? "environment_config"
          : "secrets_config"
      ]

    const obj = {
      appVariables,
      variables: [
        {
          _id: values.variable_id,
        },
      ],
    }
    onImport?.(obj)
  }

  return (
    <Modal
      title={`Import ${typeMap[type]} from Application`}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <div className='m-t-20'>
        <Form onFinish={onFinish}>
          <Form.Item name={"variable_id"}>
            <Select options={generateVariableOptions()} />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Import
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default ImportAppVariables
