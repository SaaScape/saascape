import { Spin } from "antd"

const LoadingElem = () => {
  return (
    <div className='d-flex justify-center'>
      <Spin spinning>Loading...</Spin>
    </div>
  )
}

export default LoadingElem
