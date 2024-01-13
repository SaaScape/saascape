import Search from "antd/es/input/Search"
import { IViewProps } from "./ServersContainer"
import { Button, Table } from "antd"

const Servers = (props: IViewProps) => {
  const { loading, columns, functions } = props
  return (
    <section className='servers'>
      <div className='top-bar d-flex justify-between align-center'>
        <div className='left'>
          <div className='search-container'>
            <Search
              disabled={loading}
              placeholder='Search for server'
              onSearch={functions?.onSearch}
            />
          </div>
        </div>
        <div className='right'>
          <Button
            disabled={loading}
            className='btn-add'
            onClick={functions?.onManageServer}
          >
            Add new Server
          </Button>
        </div>
      </div>
      <div className='table-container'>
        <Table
          dataSource={[]}
          onChange={props?.functions?.onTableChange}
          loading={loading}
          columns={columns}
          rowKey={(record) => record._id}
          onRow={functions?.onRow}
        ></Table>
      </div>
    </section>
  )
}

export default Servers
