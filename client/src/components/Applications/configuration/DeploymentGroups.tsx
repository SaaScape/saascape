import { Button, Card, Form, Input, Popconfirm, Table } from 'antd'
import { updateApplication } from '../../../store/slices/applicationSlice'
import { IApplication } from 'types/schemas/Applications.ts'
import { useEffect, useState } from 'react'
import useEditableTable, { IColumnProps } from '../../../hooks/useEditableTable'
import { useForm } from 'antd/es/form/Form'
import { toast } from 'react-toastify'
import { apiAxiosToast } from '../../../helpers/axios'
import { useDispatch } from 'react-redux'
import { ILinkedIdEnabledDocument } from '../../../interfaces/interfaces'
import { ConfigModules } from 'types/enums.ts'

interface IProps {
  application?: IApplication
}

export interface IEnvironmentVariable extends ILinkedIdEnabledDocument {
  _id: string
  name: string
  value: string
}

const EnvironmentConfig = ({ application }: IProps) => {
  const [loading, setLoading] = useState(false)
  //   Secrets below will either be the application config secrets or the instance secrets. If instance is defined then we will use instance secrets
  const [deploymentGroups, setDeploymentGroups] = useState<any>([])

  const dispatch = useDispatch()

  useEffect(() => {
    setDeploymentGroups(Object.values(application?.config?.deployment_groups || {}))
  }, [application?.config?.deployment_groups])

  const [columns] = useState<IColumnProps[]>([
    {
      title: 'ID',
      key: '_id',
      dataIndex: '_id',
      render: (id) => id,
      width: 250,
    },
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      render(value) {
        return value
      },
      editableRender() {
        return (
          <Form.Item name="name">
            <Input onChange={() => form.submit()} />
          </Form.Item>
        )
      },
    },
  ])

  const [form] = useForm()

  const editableTable = useEditableTable({
    form,
    columns,
    setDataSource: setDeploymentGroups,
    templateObj: { _id: '', name: 'Environment name', value: 'Env value' },
  })

  const {
    editableColumns,
    onFinish,
    updatedFields: updatedDeploymentGroups,
    addNewRecord,
    resetUpdatedFields,
  } = editableTable

  const onSave = async () => {
    // If instance then we will update instance keys, otherwise we will update application config secrets

    const toastId = toast.info(<div>Saving deployment groups... Please wait!</div>, {
      isLoading: true,
    })

    console.log(updatedDeploymentGroups)

    const route = `/applications/${application?._id}/config`

    const { data } = await apiAxiosToast(toastId).put(route, {
      configModule: ConfigModules.DEPLOYMENT_GROUPS,
      deploymentGroups: updatedDeploymentGroups,
    })

    if (data?.success) {
      console.log(data.data.application.errors)
      const errors: [string, { [key: string]: any }][] = Object.entries(data.data.application?.errors)
      const hasErrors = errors?.length

      let toastMessage = <div></div>

      if (hasErrors) {
        const errorArray = []

        for (const arr of errors) {
          const [key, data] = arr
          switch (key) {
            case 'deleted':
              break
            case 'newFields':
              for (const newId in data) {
                const thisIdError = data[newId]
                errorArray.push(
                  <p>
                    <strong>Error</strong> <br />
                    Unable to create deployment group "<i>{thisIdError?.name}</i>" <br /> <br />
                    <strong>Reason</strong> <br />
                    {thisIdError.error}
                  </p>,
                  <br />,
                )
              }
              break
            default:
              errorArray.push(
                <p>
                  <strong>Error</strong> <br />
                  Unable to update deployment group "<i>{data?.name}</i>" <br /> <br />
                  <strong>Reason</strong> <br />
                  {data.error}
                </p>,
                <br />,
              )
              break
          }
        }
        toastMessage = <div>{errorArray}</div>
      } else {
        toastMessage = <div>Saving deployment groups... Done!</div>
      }

      toast.update(toastId, {
        type: hasErrors ? toast.TYPE.WARNING : toast.TYPE.SUCCESS,
        render: toastMessage,
        isLoading: false,
        autoClose: hasErrors ? false : 1000,
      })
      resetUpdatedFields()
      dispatch(updateApplication(data?.data?.application?.latestApplication))
    }
  }

  return (
    <>
      <section className="application-secrets-config">
        <Card>
          <div className="top-bar d-flex justify-between align-center">
            <div className="left">
              <span className="title">Deployment Groups</span>
            </div>
            <div className="right">
              <div className="right d-flex">
                <Button onClick={addNewRecord}>Add Deployment Group</Button>
              </div>
            </div>
          </div>
          <Form form={form} onFinish={onFinish}>
            <Table loading={loading} dataSource={deploymentGroups} columns={editableColumns} rowKey={'_id'} />
            <Popconfirm title="Are you sure you want to save?" onConfirm={onSave}>
              <Button type="primary">Save</Button>
            </Popconfirm>
          </Form>
        </Card>
      </section>
    </>
  )
}

export default EnvironmentConfig
