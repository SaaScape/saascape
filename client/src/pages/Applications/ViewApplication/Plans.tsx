import { IPlanProps } from "./PlansContainer"

const Plans = (props: IPlanProps) => {
  return (
    <section className='sub-section plans'>
      <div className='top-bar d-flex justify-between'>
        <div>
          <h1>Plans</h1>
          <p>View and manage plans associated with your application</p>
        </div>
        <div className='right'></div>
      </div>
    </section>
  )
}

export default Plans
