import { Card, Table } from "antd"
import { IVersionProps } from "./VersionsContainer"

const Versions = (props: IVersionProps) => {
  const { versionColumns } = props

  return (
    <section className='sub-section versions p-relative'>
      <main>
        <Card className='data-card'>
          <div className='top-bar'>
            <div className='title'>Last 30 Days</div>
          </div>
          <div className='content statistics'>
            <div className='statistic'>
              <div className='statistic-title'>Total New Versions</div>
              <div className='statistic-value'>22</div>
            </div>
            <div className='statistic'>
              <div className='statistic-title'>Total New Versions</div>
              <div className='statistic-value'>22</div>
            </div>
          </div>
        </Card>
        <Card className='data-card'>
          <div className='top-bar'>
            <div className='title'>Latest Version</div>
          </div>
          <div className='content'>
            <Table columns={versionColumns} dataSource={[]} />
          </div>
        </Card>
        <Card className='data-card'>
          <div className='top-bar'>
            <div className='title'>Version History</div>
          </div>
          <div className='content'>
            <Table columns={versionColumns} dataSource={[]} />
          </div>
        </Card>
      </main>
    </section>
  )
}

export default Versions
