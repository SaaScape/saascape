import { IProps } from './ViewApplicationContainer'
import StatisticBanner from '../../../components/StatisticBanner'
import moment from 'moment'

const ViewApplication = (props: IProps) => {
  return (
    <section className="view-application p-relative">
      <div className="top-bar-container">
        <div className="top-bar d-flex justify-between align-center">
          <div>
            <h1>Overview</h1>
            <p>Application overview</p>
          </div>
          <div className="right"></div>
        </div>
      </div>

      <StatisticBanner loading={props?.loading}>
        <div>
          <div className="title">Application Name</div>
          <div className="value">{props?.application?.application_name}</div>
        </div>
        <div>
          <div className="title">Created</div>
          <div className="value">{moment(props?.application?.created_at).fromNow()}</div>
        </div>
        <div>
          <div className="title">Plans</div>
          <div className="value">0</div>
        </div>
        <div>
          <div className="title">Versions</div>
          <div className="value">0</div>
        </div>
        <div>
          <div className="title">Instances</div>
          <div className="value">0</div>
        </div>
      </StatisticBanner>
    </section>
  )
}

export default ViewApplication
