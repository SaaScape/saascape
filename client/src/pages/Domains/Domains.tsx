import Search from 'antd/es/input/Search'
import { IViewProps } from './DomainsContainer'
import { Button } from 'antd'
import PaginatedTable from '../../components/PaginatedTable'

const Domains = (props: IViewProps) => {
  const { loading, columns, functions, paginatedData, tableConfig, onTableChange } = props
  return (
    <section className="domains">
      <div className="top-bar d-flex justify-between align-center">
        <div className="left">
          <div className="search-container">
            <Search disabled={loading} placeholder="Search for domain" onSearch={functions?.onSearch} />
          </div>
        </div>
        <div className="right">
          <Button disabled={loading} className="btn-add" onClick={functions?.onAddDomainClick}>
            Add new Domain
          </Button>
        </div>
      </div>
      <div className="table-container">
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

export default Domains
