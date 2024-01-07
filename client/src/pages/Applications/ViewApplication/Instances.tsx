import { Button } from "antd"
import { IProps } from "./InstancesContainer"

const Instances = (props: IProps) => {
  return (
    <section className='sub-section instances'>
      <div className='top-bar-container'>
        <div className='top-bar d-flex justify-between align-center'>
          <div>
            <h1>Instances</h1>
            <p>
              View and manage all instances of{" "}
              {props?.selectedApplication?.application_name}
            </p>
          </div>
          <div className='right'>
            <Button type='primary'>Create Instance</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Instances
