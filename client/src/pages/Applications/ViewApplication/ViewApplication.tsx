import { Button } from "antd"
import { IProps } from "./ViewApplicationContainer"

const ViewApplication = (props: IProps) => {
  console.log(props)
  return (
    <section className='view-application p-relative'>
      <div className='top-bar-container'>
        <div className='top-bar d-flex justify-between align-center'>
          <div>
            <h1>Overview</h1>
            <p>Application overview</p>
          </div>
          <div className='right'>
            <Button>Hello</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ViewApplication
