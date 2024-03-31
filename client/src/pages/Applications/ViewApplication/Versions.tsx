import { Button, Card, Table } from "antd"
import { IVersionProps } from "./VersionsContainer"
import StatisticBanner from "../../../components/StatisticBanner"

const Versions = (props: IVersionProps) => {
  const { versionColumns, loading, versions, functions } = props

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

      <div className='table-container'>
        <Table
          dataSource={versions}
          onChange={props?.functions?.onTableChange}
          loading={loading}
          columns={versionColumns}
          rowKey={(record) => record._id}
          onRow={functions?.onRow}
        ></Table>
      </div>
    </section>
  )
}

export default Versions
