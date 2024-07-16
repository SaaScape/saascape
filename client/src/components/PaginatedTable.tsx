import { Table } from "antd"

interface IProps {
  tableConfig: ITableConfig
  columns: any[]
  loading: boolean
  onTableChange: (config: any) => void
  paginatedData?: IPaginatedData
  functions?: {
    [functionName: string]: (...args: any[]) => any
  }
}

export interface IPaginatedData {
  totalDocuments: number
  records: {
    [pageNumber: number]: any[]
  }
}

export interface ITableConfig {
  current: number
  pageSize: number
}

const PaginatedTable = (props: IProps) => {
  const {
    loading,
    columns,
    functions,
    paginatedData,
    tableConfig,
    onTableChange,
  } = props

  return (
    <Table
      pagination={{
        pageSize: tableConfig?.pageSize,
        total: paginatedData?.totalDocuments,
        current: tableConfig?.current,
      }}
      dataSource={paginatedData?.records?.[tableConfig?.current]}
      onChange={onTableChange}
      loading={loading}
      columns={columns}
      rowKey={(record) => record?._id}
      onRow={functions?.onRow}
    />
  )
}

export default PaginatedTable
