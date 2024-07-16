import { Button, Table } from "antd"
import Search from "antd/es/input/Search"
import { IViewProps } from "./ContactsContainer"
import PaginatedTable from "../../components/PaginatedTable"

const Contacts = (props: IViewProps) => {
  const {
    columns,
    loading,
    functions,
    paginatedData,
    tableConfig,
    onTableChange,
  } = props
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
            onClick={functions?.onManageContact}
          >
            Add new Contact
          </Button>
        </div>
      </div>
      <div className='table-container'>
        <PaginatedTable
          loading={loading}
          columns={columns}
          tableConfig={tableConfig}
          paginatedData={paginatedData}
          onTableChange={onTableChange}
          functions={functions}
        />
      </div>
    </section>
  )
}

export default Contacts
