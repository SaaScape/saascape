import { Button, Table } from "antd"
import Search from "antd/es/input/Search"
import { IViewProps } from "./ContactsContainer"

const Contacts = (props: IViewProps) => {
  const { columns, loading, functions, paginatedContacts, tableConfig } = props
  return (
    <section className='contacts'>
      <div className='top-bar d-flex justify-between align-center'>
        <div className='left'>
          <div className='search-container'>
            <Search
              disabled={loading}
              placeholder='Search for contact'
              onSearch={props?.functions?.onSearch}
            />
          </div>
        </div>
        <div className='right'>
          <Button
            disabled={loading}
            className='btn-add'
            onClick={functions?.onCreateContactClick}
          >
            Add new Contact
          </Button>
        </div>
      </div>
      <div className='table-container'>
        <Table
          pagination={{
            pageSize: tableConfig?.pageSize,
            total: paginatedContacts?.totalDocuments,
            current: tableConfig?.current,
          }}
          dataSource={paginatedContacts?.records?.[tableConfig?.current]}
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

export default Contacts
