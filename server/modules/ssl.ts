import { ObjectId } from "mongodb"
import { db } from "../db"
import { IDomain } from "../schemas/Domains"
import constants from "../helpers/constants"
import acme, { Authorization } from "acme-client"
import ServerService from "../services/serverService"
import { encryptData } from "../helpers/utils"
import DomainService from "../services/domainsService"

export default class SSL {
  domainId: string
  domain?: IDomain
  constructor(domainId: string) {
    this.domainId = domainId
  }

  async getDomain() {
    const domain = await db?.managementDb
      ?.collection<IDomain>("domains")
      .findOne({
        _id: new ObjectId(this.domainId),
        status: "active",
      })

    if (!domain) throw new Error("Domain not found")
    this.domain = domain
  }

  private async getAcmeClient() {
    const { NODE_ENV } = process.env
    const letsEncryptMode =
      NODE_ENV === constants.NODE_ENV.PRODUCTION ? "production" : "staging"

    //   Should we be using an existing accunt key?
    const acmeClient = new acme.Client({
      directoryUrl: acme.directory.letsencrypt?.[letsEncryptMode],
      accountKey: await acme.crypto.createPrivateKey(),
    })

    return acmeClient
  }

  async initializeSSL() {
    // Check if domain is ssl_enabled
    await this.getDomain()
    if (
      this?.domain?.SSL?.status !==
      constants.SSL_STATUSES.PENDING_INITIALIZATION
    )
      throw new Error("Domain SSL is not pending initialization")

    await db?.managementDb?.collection<IDomain>("domains")?.updateOne(
      {
        _id: new ObjectId(this.domainId),
      },
      {
        $set: {
          "SSL.status": constants?.SSL_STATUSES?.INITIALIZING,
        },
      }
    )

    const acmeClient = await this.getAcmeClient()

    console.log("Creating CSR for domain", this.domain?.domain_name)
    const [key, csr] = await acme.crypto.createCsr({
      commonName: this.domain?.domain_name,
    })

    console.log("Creating certificate for domain", this.domain?.domain_name)
    const cert = await acmeClient.auto({
      csr,
      email: "keir@keirdavie.me",
      termsOfServiceAgreed: true,
      challengePriority: ["http-01"],
      challengeCreateFn: async (authz, challenge, keyAuthorization) => {
        await this.prepareChallenge(authz, challenge, keyAuthorization)
      },
      challengeRemoveFn: async (authz, challenge) => {
        console.log("removing challenege", challenge.token)
        await db.managementDb?.collection<IDomain>("domains")?.updateOne(
          {
            _id: new ObjectId(this.domainId),
          },
          {
            $unset: {
              "SSL.challenge_token": 1,
              "SSL.challenge_auth_key": 1,
            },
          }
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

    await db?.managementDb?.collection<IDomain>("domains")?.updateOne(
      {
        _id: new ObjectId(this.domainId),
      },
      {
        $set: {
          "SSL.certificates": {
            key: encryptedData.key,
            csr: encryptedData.csr,
            cert: encryptedData.cert,
          },
          "SSL.status": constants.SSL_STATUSES.ACTIVE,
        },
      }
    )

    const domainService = new DomainService()
    await domainService.applySSLCer(this.domain?._id)

    return true
  }

  async prepareChallenge(
    authz: Authorization,
    challenge: any,
    keyAuthorization: string
  ) {
    await db.managementDb?.collection<IDomain>("domains")?.updateOne(
      {
        _id: new ObjectId(this.domainId),
      },
      {
        $set: {
          "SSL.challenge_token": challenge.token,
          "SSL.challenge_auth_key": keyAuthorization,
        },
      }
    )

    const serverService = new ServerService()
    await serverService.addDomainAuthFile(
      keyAuthorization,
      challenge.token,
      this.domain?._id
    )
  }
}
