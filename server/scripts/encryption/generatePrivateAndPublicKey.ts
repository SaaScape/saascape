import crypto from "crypto"
import fsp from "fs/promises"
import path from "path"

// After running this script we must rebuild the client.
;(async () => {
  // Generate RSA key pair (public and private keys)
  const serverKeys = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  })
  const clientKeys = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  })

  const serverDir = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "clientTransportKeys"
  )

  const clientDir = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "client",
    "src",
    "data",
    "clientTransportKeys"
  )

  const keyPairs = {
    client: {
      publicKey: serverKeys.publicKey,
      privateKey: clientKeys.privateKey,
    },
    server: {
      publicKey: clientKeys.publicKey,
      privateKey: serverKeys.privateKey,
    },
  }

  await fsp.mkdir(serverDir, { recursive: true })
  await fsp.mkdir(clientDir, { recursive: true })

  //   Create servers data
  await fsp.writeFile(
    path.join(serverDir, "privateKey.pem"),
    keyPairs.server.privateKey
  )
  await fsp.writeFile(
    path.join(serverDir, "publicKey.pem"),
    keyPairs.server.publicKey
  )

  //   Create clients data
  await fsp.writeFile(
    path.join(clientDir, "publicKey.json"),
    JSON.stringify(keyPairs?.client)
  )

  console.log("Keys have been generated")
})()
