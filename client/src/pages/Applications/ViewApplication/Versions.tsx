import { Button, Card, Table } from "antd"
import { IVersionProps } from "./VersionsContainer"

const Versions = (props: IVersionProps) => {
  const { versionColumns } = props

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
            <Button type='primary'>Create Version</Button>
          </div>
        </div>
      </div>
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
