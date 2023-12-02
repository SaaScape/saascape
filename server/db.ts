import mongoDb from "mongodb"
import { MongoClient } from "mongodb"

const { MONGO_URI, MANAGEMENT_DB_NAME } = process.env

class Db {
  mongoClient?: mongoDb.MongoClient
  managementDb?: mongoDb.Db
  constructor() {}

  async init() {
    if (!MONGO_URI) throw new Error("MONGO_URI not set")
    if (!MANAGEMENT_DB_NAME) throw new Error("MANAGEMENT_DB_NAME not set")
    this.mongoClient = new MongoClient(MONGO_URI)
    this.managementDb = this.mongoClient.db(MANAGEMENT_DB_NAME)
    if (!this.managementDb) throw new Error("Management DB not found")
  }

  async connect() {
    if (!this.mongoClient) throw new Error("MongoClient not initialized")
    await this.mongoClient.connect()

    console.log("Connected to MongoDB")
  }

  async disconnect() {
    if (!this.mongoClient) throw new Error("MongoClient not initialized")
    await this.mongoClient.close()
    console.log("Disconnected from MongoDB")
  }
}

export const db = new Db()
