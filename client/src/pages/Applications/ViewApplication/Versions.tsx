import { Button } from "antd"
import Search from "antd/es/input/Search"
import { IVersionProps } from "./VersionsContainer"
import StatisticBanner from "../../../components/StatisticBanner"
import PaginatedTable from "../../../components/PaginatedTable"

const Versions = (props: IVersionProps) => {
  const {
    versionColumns,
    loading,
    functions,
    tableConfig,
    paginatedData,
    onTableChange,
    dataFetching,
  } = props

  return (
    <section className='sub-section versions p-relative'>
      <div className='top-bar-container'>
        <div className='top-bar d-flex justify-between align-center'>
          <div>
            <h1>Versions</h1>
            <p>
              View and manage all versions of{" "}
              {props?.selectedApplication?.application_name}
            </p>
          </div>
          <div className='right'>
            <Button type='primary' onClick={functions?.openManageVersionModal}>
              Create Version
            </Button>
          </div>
        </div>
      </div>
      <StatisticBanner loading={props?.loading}>
        <div>
          <div className='title'>Total New Versions</div>
          <div className='value'>22</div>
        </div>
        <div>
          <div>
            <div className='title'>Total New Versions</div>
            <div className='value'>22</div>
          </div>
        </div>
      </StatisticBanner>

      <div className='search-container'>
        <Search
          disabled={loading}
          placeholder='Search for version'
          onSearch={functions?.onSearch}
        />
      </div>

      <div className='table-container'>
        <PaginatedTable
          loading={dataFetching}
          columns={versionColumns}
          tableConfig={tableConfig}
          paginatedData={paginatedData}
          onTableChange={onTableChange}
          functions={functions}
        />
      </div>
    </section>
  )
}

export default Versions
