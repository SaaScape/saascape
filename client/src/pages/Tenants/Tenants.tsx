import Search from 'antd/es/input/Search'
import { IProps } from './TenantsContainer'
import { Button, Table } from 'antd'

const Tenants = (props: IProps) => {
  const { columns, loading, tenants, functions } = props
  return (
    <section className="tenants">
      <div className="top-bar d-flex justify-between align-center">
        <div className="left">
          <div className="search-container">
            <Search disabled={loading} placeholder="Search by tenant name" />
          </div>
        </div>
        <div className="right">
          <Button disabled={loading} className="btn-add" type="primary" onClick={functions?.onCreateTenantClick}>
            Add new tenant
          </Button>
        </div>
      </div>
      <div className="table-container">
        <Table
          dataSource={tenants}
          loading={loading}
          columns={columns}
          rowKey={(record) => record._id}
          onRow={functions?.onRow}
        ></Table>
      </div>
    </section>
  )
}

export default Tenants
