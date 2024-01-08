import { Button, Card, Table } from "antd"
import { IVersionProps } from "./VersionsContainer"
import StatisticBanner from "../../../components/StatisticBanner"

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

        {/* <Card className='data-card'>
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
        </Card> */}
      </main>
    </section>
  )
}

export default Versions
