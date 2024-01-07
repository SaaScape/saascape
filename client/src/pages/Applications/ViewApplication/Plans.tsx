import { Button, Card, Table } from "antd"
import { IProps } from "./PlansContainer"

const Plans = (props: IProps) => {
  return (
    <section className='sub-section plans'>
      <div className='top-bar-container'>
        <div className='top-bar d-flex justify-between align-center'>
          <div>
            <h1>Plans</h1>
            <p>
              View and manage plans associated with{" "}
              {props?.application?.application_name}
            </p>
          </div>
          <div className='right'>
            <Button
              type='primary'
              onClick={() => props.setCreateModalVisible(true)}
            >
              Create Plan
            </Button>
          </div>
        </div>
      </div>

      <main>
        <Card className='data-card'>
          <div className='content'>
            <div className='table-container'>
              <Table
                dataSource={props?.plans?.[1]}
                loading={props?.loading}
                columns={props?.planColumns}
                rowKey={(record) => record._id}
                onRow={props?.functions?.onRow}
              />
            </div>
          </div>
        </Card>
      </main>
    </section>
  )
}

export default Plans
