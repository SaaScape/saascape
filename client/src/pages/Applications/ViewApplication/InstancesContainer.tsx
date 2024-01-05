import { useEffect } from "react"
import Instances from "./Instances"
import { IInstanceMainProps } from "./ViewApplicationContainer"
import { Button } from "antd"

const InstancesContainer = (props: IInstanceMainProps) => {
  useEffect(() => {
    props.setTopBar(
      "Instances",
      "View and manage all instances deployed of the application",
      <div className='right d-flex align-center'>
        <Button type='primary'>Create Instance</Button>
      </div>
    )
  }, [])
  return <Instances />
}

export default InstancesContainer
