import { Button, Table } from 'antd'
import Search from 'antd/es/input/Search'
import { IProps } from './ApplicationsContainer'

const Applications = (props: IProps) => {
  const { columns, loading, applications, functions } = props
  return (
    <section className="applications">
      <div className="top-bar d-flex justify-between align-center">
        <div className="left">
          <div className="search-container">
            <Search disabled={loading} placeholder="Search by application name" />
          </div>
        </div>
        <div className="right">
          <Button disabled={loading} className="btn-add" type="primary" onClick={functions?.onCreateApplicationClick}>
            Add new application
          </Button>
        </div>
      </div>
      <div className="table-container">
        <Table
          dataSource={applications}
          loading={loading}
          columns={columns}
          rowKey={(record) => record._id?.toString()}
          onRow={functions?.onRow}
        ></Table>
      </div>
    </section>
  )
}

export default Applications
