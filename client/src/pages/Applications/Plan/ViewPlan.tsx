import { IViewProps } from "./ViewPlanContainer"
import { planTermConverter } from "../../../helpers/utils"
import StatisticBanner from "../../../components/StatisticBanner"

const ViewPlan = (props: IViewProps) => {
  return (
    <section className='sub-section view-plan'>
      <div className='top-bar-container'>
        <div className='top-bar d-flex justify-between align-center'>
          <div>
            <h1>{props?.plan?.plan_name || "Loading..."}</h1>
            <p>View and managed plan</p>
          </div>
          <div className='right'></div>
        </div>
      </div>

      <StatisticBanner loading={props?.loading}>
        <div>
          <div className='title'>Plan Name</div>
          <div className='value'>{props?.plan?.plan_name}</div>
        </div>
        <div>
          <div className='title'>Cost</div>
          <div className='value'>
            <span className='currency'>{props?.currency?.symbol}</span>
            <span className='price'>{props?.plan?.price}</span>
          </div>
        </div>
        <div>
          <div className='title'>Billing Frequency</div>
          <div className='value'>
            <span className='interval-count'>
              {props?.plan?.billing_interval_count}{" "}
            </span>
            <span className='interval'>
              {planTermConverter(props?.plan?.billing_interval || "")}
              {(props?.plan?.billing_interval_count || 0) > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div>
          <div className='title'>Subscribers</div>
          <div className='value'>0</div>
        </div>
      </StatisticBanner>
    </section>
  )
}

export default ViewPlan
