import { Card, Table } from "antd"
import { IPlanProps } from "./PlansContainer"

const Plans = (props: IPlanProps) => {
  return (
    <section className='sub-section plans'>
      <main>
        <Card className='data-card'>
          <div className='content'>
            <div className='table-container'>
              <Table
                dataSource={props?.plans?.[1]}
                loading={props?.loading}
                columns={props?.planColumns}
                rowKey={(record) => record._id}
                onRow={props?.functions?.onRow?.()}
              />
            </div>
          </div>
        </Card>
      </main>
    </section>
  )
}

export default Plans
