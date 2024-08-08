/*
 * Copyright SaaScape (c) 2024.
 */
import React from 'react'
import { ViewProps } from './ViewDeploymentContainer.tsx'
import StatisticBanner from '../../../components/StatisticBanner.tsx'

function ViewDeployment({ deployment, loading, selectedApplication, targetInstances }: ViewProps) {
  console.log(deployment)

  const deploymentVersion = `${(deployment as any)?.version_obj?.namespace}/${(deployment as any)?.version_obj?.repository}/${(deployment as any)?.version_obj?.tag}`
  const deploymentGroup =
    deployment && selectedApplication?.config?.deployment_groups?.[deployment?.deployment_group?.toString()]

  return (
    <section className="sub-section view-plan">
      <div className="top-bar-container">
        <div className="top-bar d-flex justify-between align-center">
          <div className="d-flex align-center">
            <div>
              <h1>{deployment?.name || 'Loading...'}</h1>
              <p>View deployment progress</p>
            </div>
            <div></div>
          </div>
          <div className="right"></div>
        </div>
      </div>
      <div>
        <StatisticBanner className="m-b-20" loading={loading}>
          <div>
            <div className="title">Deployment Name</div>
            <div className="value">{deployment?.name}</div>
          </div>
          <div>
            <div className="title">Target Group</div>
            <div className="value">{deploymentGroup?.name}</div>
          </div>
          <div>
            <div className="title">Target Version</div>
            <div className="value">{deploymentVersion}</div>
          </div>
          <div>
            <div className="title">Status</div>
            <div className="value">{deployment?.deployment_status}</div>
          </div>
        </StatisticBanner>
      </div>
    </section>
  )
}

export default ViewDeployment
