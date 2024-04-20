import { Button, Table } from "antd"
import { IProps } from "./InstancesContainer"
import StatisticBanner from "../../../components/StatisticBanner"
import CreateInstanceModal from "../../../components/Applications/CreateInstanceModal"

const Instances = ({
  loading,
  selectedApplication,
  columns,
  instances,
  instancesInfo,
  showCreateInstanceModal,
  closeCreateInstanceModal,
  openCreateInstanceModal,
  onInstanceCreate,
}: IProps) => {
  return (
    <>
      <section className='sub-section instances'>
        <div className='top-bar-container'>
          <div className='top-bar d-flex justify-between align-center'>
            <div>
              <h1>Instances</h1>
              <p>
                View and manage all instances of{" "}
                {selectedApplication?.application_name}
              </p>
            </div>
            <div className='right'>
              <Button onClick={openCreateInstanceModal} type='primary'>
                Create Instance
              </Button>
            </div>
          </div>
        </div>

        <StatisticBanner loading={loading}>
          <div>
            <div className='title'>Total Instances</div>
            <div className='value'>{instancesInfo?.totalInstances || 0}</div>
          </div>
          <div>
            <div>
              <div className='title'>Running</div>
              <div className='value'>{instancesInfo?.running || 0}</div>
            </div>
          </div>
          <div>
            <div>
              <div className='title'>Stopped</div>
              <div className='value'>{instancesInfo?.stopped || 0}</div>
            </div>
          </div>
          <div>
            <div>
              <div className='title'>Failed</div>
              <div className='value'>{instancesInfo?.failed || 0}</div>
            </div>
          </div>
        </StatisticBanner>

        <div>
          <Table
            dataSource={instances}
            loading={loading}
            columns={columns}
            rowKey={(record) => record._id}
          ></Table>
        </div>
      </section>
      <CreateInstanceModal
        open={showCreateInstanceModal}
        onCancel={closeCreateInstanceModal}
        selectedApplication={selectedApplication}
        onFinish={onInstanceCreate}
      />
    </>
  )
}

export default Instances
