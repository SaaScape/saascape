import { Card } from "antd"

const Dashboard = () => {
  return (
    <section className='dashboard p-20'>
      <div className='main'>
        <Card className='data-card'>
          <div className='title'>Tenants</div>
        </Card>
        <Card className='data-card'>
          <div className='title'>Recurring Revenue</div>
        </Card>
        <Card className='data-card'>
          <div className='title'>Servers</div>
        </Card>
        <Card className='data-card'>
          <div className='title'>Instances</div>
        </Card>
        <Card className='growth-card'>
          <div className='title'>Recent Growth</div>
        </Card>
        <Card className='app-stats'>
          <div className='title'>Application Stats</div>
        </Card>
      </div>
    </section>
  )
}

export default Dashboard
