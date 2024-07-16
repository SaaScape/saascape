/*
 * Copyright SaaScape (c) 2024.
 */

import { Button, Form, Modal, Upload, UploadFile, UploadProps } from 'antd'
import Icon from '../../Icon.tsx'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { UploadChangeParam } from 'antd/lib/upload'
import { checkIfCSVValid, CSVToArray } from '../../../helpers/utils.ts'
import type { CSVData } from '../../../helpers/utils.ts'

interface IProps {
  open: boolean
  onCancel: () => void
  onImport: (data: CSVData) => void
}

const getCSVData = async (file: File) => {
  // TODO: How can we allow comma seperated values within columns? Is possible?

  const reader = new FileReader()
  const csvString: string = await new Promise((resolve, reject) => {
    let textString = ''
    reader.onload = (e) => {
      const text = e.target?.result
      textString += text
    }
    reader.onloadend = () => {
      resolve(textString)
    }
    reader.readAsText(file)
  })

  const rows = CSVToArray(csvString)

  const isCSVValid = checkIfCSVValid(rows, ['name', 'value'])

  if (!isCSVValid) {
    toast.error('Invalid CSV file. Please check the file and try again')
    return
  }

  return rows
}

const CSVImportVariables = ({ open, onCancel, onImport }: IProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [csvData, setCSVData] = useState<CSVData>([])

  useEffect(() => {
    setCSVData([])
  }, [fileList])

  const onFileChange = async (info: UploadChangeParam) => {
    if (info.file?.type !== 'text/csv') {
      toast.error('Invalid file type. Please upload a CSV file')
      return
    }
    const data = await getCSVData(info.file as unknown as File)
    if (!data) return
    setCSVData(data)
  }

  const uploadProps: UploadProps = {
    fileList,
    beforeUpload: (file) => {
      if (file.type !== 'text/csv') {
        return false
      }
      setFileList([file])
      return false
    },
    onRemove: (file) => {
      setFileList((curr) => curr.filter((f) => f.uid !== file.uid))
    },
    onChange: onFileChange,
  }

  const onImportClick = () => {
    onImport(csvData)
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key={'cancel'} onClick={onCancel}>
          Cancel
        </Button>,
        <Button key={'import'} onClick={onImportClick} type={'primary'}>
          Import
        </Button>,
      ]}
    >
      <div>
        <h1>Import Variables</h1>
        <p>Import variables from a file</p>

        <Form>
          <Form.Item>
            <Upload {...uploadProps} className={'d-flex align-center'}>
              <Button icon={<Icon icon={'UPLOAD'} />}>Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default CSVImportVariables
