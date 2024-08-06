/*
 * Copyright SaaScape (c) 2024.
 */

import { IViewProps } from './DeploymentsContainer.tsx'
import Search from 'antd/es/input/Search'
import { Button } from 'antd'
import PaginatedTable from '../../../components/PaginatedTable.tsx'

const Deployments = ({
  loading,
  functions,
  columns,
  tableConfig,
  paginatedData,
  onTableChange,
  dataFetching,
}: IViewProps) => {
  return (
    <section className="servers">
      <div className="top-bar d-flex justify-between align-center">
        <div className="left">
          <div className="search-container">
            <Search disabled={loading} placeholder="Search for deployment" onSearch={functions?.onSearch} />
          </div>
        </div>
        <div className="right">
          <Button disabled={loading} className="btn-add" onClick={functions?.onManageServer}>
            Create Deployment
          </Button>
        </div>
      </div>
      <div className="table-container">
        <PaginatedTable
          loading={dataFetching}
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

export default Deployments
