/*
 * Copyright SaaScape (c) 2024.
 */

import { ObjectId } from 'mongodb'
import { db } from '../db'
import { IDomain } from '../schemas/Domains'
import constants from '../helpers/constants'
import acme, { Authorization } from 'acme-client'
import ServerService from '../services/serverService'
import { decipherData, encryptData } from '../helpers/utils'
import DomainService from '../services/domainsService'
import { logError } from '../helpers/error'

export default class SSL {
  domainId: string
  domain?: IDomain
  constructor(domainId: string) {
    this.domainId = domainId
  }

  async getDomain() {
    const domain = await db?.managementDb?.collection<IDomain>('domains').findOne({
      _id: new ObjectId(this.domainId),
      status: 'active',
    })

    if (!domain) throw new Error('Domain not found')
    this.domain = domain
  }

  private async getAcmeClient() {
    const { NODE_ENV } = process.env
    const letsEncryptMode = NODE_ENV === constants.NODE_ENV.PRODUCTION ? 'production' : 'staging'

    //   Should we be using an existing accunt key?
    const acmeClient = new acme.Client({
      directoryUrl: acme.directory.letsencrypt?.[letsEncryptMode],
      accountKey: await acme.crypto.createPrivateKey(),
    })

    return acmeClient
  }

  async initializeSSL(renewal: boolean = false) {
    try {
      // Check if domain is ssl_enabled
      await this.getDomain()
      if (!this.domain?.enable_ssl) return
      if (
        ![
          constants.SSL_STATUSES.EXPIRED,
          constants.SSL_STATUSES.PENDING_INITIALIZATION,
          constants.SSL_STATUSES.EXPIRING,
        ].includes(this?.domain?.SSL?.status || '')
      )
        throw new Error(`Domain SSL is not pending ${renewal ? 'renewal' : 'initialization'}`)

      await db?.managementDb?.collection<IDomain>('domains')?.updateOne(
        {
          _id: new ObjectId(this.domainId),
        },
        {
          $set: {
            'SSL.status': constants?.SSL_STATUSES?.INITIALIZING,
          },
        },
      )

      const acmeClient = await this.getAcmeClient()

      console.log('Creating CSR for domain', this.domain?.domain_name)
      const [key, csr] = await acme.crypto.createCsr({
        commonName: this.domain?.domain_name,
      })

      console.log('Creating certificate for domain', this.domain?.domain_name)
      const cert = await acmeClient.auto({
        csr,
        email: 'keir@keirdavie.me',
        termsOfServiceAgreed: true,
        challengePriority: ['http-01'],
        challengeCreateFn: async (authz, challenge, keyAuthorization) => {
          await this.prepareChallenge(authz, challenge, keyAuthorization)
        },
        challengeRemoveFn: async (authz, challenge) => {
          console.log('removing challenege', challenge.token)
          await db.managementDb?.collection<IDomain>('domains')?.updateOne(
            {
              _id: new ObjectId(this.domainId),
            },
            {
              $unset: {
                'SSL.challenge_token': 1,
                'SSL.challenge_auth_key': 1,
              },
            },
          )
        },
      })

      const keyString = key.toString()
      const csrString = csr.toString()
      const certString = cert.toString()

      const encryptedData = {
        key: encryptData(keyString),
        csr: encryptData(csrString),
        cert: encryptData(certString),
      }

      await db?.managementDb?.collection<IDomain>('domains')?.updateOne(
        {
          _id: new ObjectId(this.domainId),
        },
        {
          $set: {
            'SSL.certificates': {
              key: encryptedData.key,
              csr: encryptedData.csr,
              cert: encryptedData.cert,
            },
            'SSL.status': constants.SSL_STATUSES.ACTIVE,
          },
        },
      )

      const certData = await this.getCertificateInfo()

      await db?.managementDb?.collection<IDomain>('domains')?.updateOne(
        {
          _id: new ObjectId(this.domainId),
        },
        {
          $set: {
            'SSL.start_date': new Date(certData?.notBefore),
            'SSL.end_date': new Date(certData?.notAfter),
          },
        },
      )

      const domainService = new DomainService()
      await domainService.applySSLCer(this.domain?._id)

      return true
    } catch (err: any) {
      // Set SSL status to failed

      const errorObj = {
        message: err.message,
      }
      const { _id } = await logError({
        error: JSON.stringify(errorObj),
        entityId: this.domain?._id,
        module: constants.MODULES.DOMAIN,
        event: renewal ? constants.EVENTS.SSL_RENEWAL : constants.EVENTS.SSL_INITIALIZE,
        status: constants.STATUSES.FAILED_STATUS,
      })
      console.warn(err)

      await db?.managementDb?.collection<IDomain>('domains')?.updateOne(
        {
          _id: new ObjectId(this.domainId),
        },
        {
          $set: {
            'SSL.status': constants.SSL_STATUSES.FAILED,
          },
        },
      )
    }
  }

  async prepareChallenge(authz: Authorization, challenge: any, keyAuthorization: string) {
    await db.managementDb?.collection<IDomain>('domains')?.updateOne(
      {
        _id: new ObjectId(this.domainId),
      },
      {
        $set: {
          'SSL.challenge_token': challenge.token,
          'SSL.challenge_auth_key': keyAuthorization,
        },
      },
    )

    const serverService = new ServerService()
    await serverService.addDomainAuthFile(keyAuthorization, challenge.token, this.domain?._id)
  }

  async getCertificateInfo() {
    await this.getDomain()
    if (!this.domain) throw new Error('Domain not found')

    const { SSL } = this.domain
    const { cert, key, csr } = SSL?.certificates || {}

    const decipheredCerts = {
      cert: cert && decipherData(cert.encryptedData, cert.iv),
      key: key && decipherData(key.encryptedData, key.iv),
      csr: csr && decipherData(csr.encryptedData, csr.iv),
    }

    if (!decipheredCerts.cert) throw new Error('Certificate not found')

    const crypto = acme.crypto
    const certInfo = crypto.readCertificateInfo(decipheredCerts.cert)
    const { notBefore, notAfter } = certInfo

    return {
      notBefore,
      notAfter,
    }
  }
}
