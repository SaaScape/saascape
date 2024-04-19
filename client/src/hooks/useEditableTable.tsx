import { ReactNode, useEffect, useState } from "react"
import { ColumnProps } from "antd/es/table"
import { FormInstance } from "antd/es/form/Form"
import { Button } from "antd"
import Icon from "../components/Icon"
import { cloneDeep } from "lodash"

export interface IColumnProps extends ColumnProps<any> {
  editableRender?: (value: string, record: any, index: number) => ReactNode
  render?: (value: string, record: any, index: number) => ReactNode
  key: string
  secureField?: boolean
}
interface IProps {
  form: FormInstance<any>
  columns: IColumnProps[]
  setDataSource: (data: { [key: string]: any }) => void
  templateObj: { _id: string; [key: string]: any }
}

interface IUpdatedField {
  _id: string
  name: string
  value: string
}
interface IUpdatedFields {
  newFields?: {
    [key: string]: IUpdatedField
  }
  deletedFields?: {
    [key: string]: boolean
  }
  [key: string]:
    | IUpdatedField
    | { [key: string]: boolean }
    | { [key: string]: IUpdatedField }
    | undefined
}

const useEditableTable = ({
  form,
  columns = [],
  setDataSource,
  templateObj,
}: IProps) => {
  const [editable, setEditable] = useState<{
    _id: string
    key: string
  } | null>(null)

  const [renderColumns, setRenderColumns] = useState<IColumnProps[]>([])
  const [updatedFields, setUpdatedFields] = useState<IUpdatedFields>({})
  const [showSecrets, setShowSecrets] = useState(false)

  useEffect(() => {
    const modifiedColumns: IColumnProps[] = []
    for (const column of columns) {
      modifiedColumns.push({
        ...column,
        render: EditableColumn(column),
        onCell: (record) => {
          return {
            onClick: () => {
              form.setFieldsValue(record)
              setEditable({ _id: record._id, key: column.key })
            },
          }
        },
      })
    }

    modifiedColumns.push({
      key: "actions",
      width: "125px",
      className: "actions-column",
      align: "right",
      render: (_, record) => {
        return (
          <div className='d-flex justify-end'>
            <Button
              className='delete-record'
              type='text'
              onClick={() => deleteRecord(record)}
            >
              <Icon icon='TRASH' />
            </Button>
          </div>
        )
      },
    })

    setRenderColumns(modifiedColumns)
  }, [columns, editable, showSecrets])

  const resetUpdatedFields = () => {
    setUpdatedFields({})
  }

  const displaySecrets = (value?: boolean) => {
    setShowSecrets((curr) => value ?? !curr)
  }

  const generateNewFieldObj = (recordNumber: number) => {
    const obj = cloneDeep(templateObj)
    obj._id = recordNumber.toString()
    obj.isNew = true

    console.log(obj, recordNumber)
    return obj
  }

  const addNewRecord = () => {
    let currValue = 0
    let newRecord: { [key: string]: any }
    setDataSource((curr: any) => {
      currValue = curr.length + 1
      newRecord = generateNewFieldObj(currValue)
      return [...curr, newRecord]
    })

    setUpdatedFields((curr: any) => {
      const obj = { ...curr }
      obj.newFields ??= {}

      obj.newFields[currValue] = newRecord
      return obj
    })
  }
  const onFinish = (values: any) => {
    const { isNew, _id } = form.getFieldValue(null)

    setUpdatedFields((curr) => {
      const obj = { ...curr }

      if (isNew) {
        obj.newFields ??= {}
        obj.newFields[_id] = {
          ...(curr?.newFields?.[_id] || {}),
          ...values,
        }
      } else {
        obj[_id] ??= {}
        obj[_id] = {
          ...(curr?.[_id] || {}),
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
  }

  const deleteRecord = (record: any) => {
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

  const checkIfEditable = (_id: string, key: string) =>
    _id === editable?._id && key === editable?.key

  const EditableColumn = (column: IColumnProps) => {
    const { render, editableRender, key, secureField } = column

    return (text: any, record: any, index: number): ReactNode => {
      const isEditable = checkIfEditable(record?._id, key)

      return isEditable
        ? editableRender?.(text, record, index) || render?.(text, record, index)
        : !showSecrets && secureField
        ? "********"
        : render?.(text, record, index)
    }
  }

  return {
    form,
    onFinish,
    editableColumns: renderColumns,
    updatedFields,
    addNewRecord,
    displaySecrets,
    resetUpdatedFields,
  }
}

export default useEditableTable
