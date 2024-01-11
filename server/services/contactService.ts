import { ObjectId } from "mongodb"
import { db } from "../db"
import constants from "../helpers/constants"
import Pagination from "../helpers/pagination"
import { IContact } from "../schemas/Contacts"

export class ContactService {
  async findMany(query: any) {
    const pagination = new Pagination(query)

    const findObj: any = {
      status: constants.STATUSES.ACTIVE_STATUS,
    }

    if (query?.searchValue) {
      findObj["$or"] = [
        { first_name: { $regex: query.searchValue, $options: "i" } },
        { last_name: { $regex: query.searchValue, $options: "i" } },
        { email: { $regex: query.searchValue, $options: "i" } },
      ]
    }

    const contacts = await pagination.runPaginatedQuery({
      collection: db.managementDb?.collection("contacts"),
      findObj,
    })

    return {
      contacts,
    }
  }

  async findById(id: string) {
    const contact = await db.managementDb?.collection("contacts").findOne({
      _id: new ObjectId(id),
      status: constants.STATUSES.ACTIVE_STATUS,
    })
    return { contact }
  }

  async create(data: any) {
    const foundContact = await db.managementDb
      ?.collection("contacts")
      .findOne({ email: data.email })
    if (foundContact) {
      throw { showError: "Contact already exists" }
    }

    const payload: IContact = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      address: {
        line1: data?.address_line1,
        line2: data?.address_line2,
        city: data?.address_city,
        state: data?.address_state,
        postcode: data?.address_postcode,
        country: data?.address_country,
      },
      contact_type: data?.contact_type,
      linked_ids: [],
      status: constants.STATUSES.ACTIVE_STATUS,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const contact = await db.managementDb
      ?.collection<IContact>("contacts")
      .insertOne(payload)

    return {
      contact,
    }
  }

  async update(id: string, data: any) {
    const contacts = await db?.managementDb
      ?.collection<IContact>("contacts")
      ?.find({ $or: [{ _id: new ObjectId(id) }, { email: data.email }] })
      .toArray()

    console.log(id, contacts)
    if (
      !contacts?.some((contact) => contact?._id?.toString() === id.toString())
    )
      throw { showError: "Contact not found" }

    if (
      contacts?.some(
        (contact) =>
          contact?.email === data.email && contact?._id?.toString() !== id
      )
    ) {
      throw { showError: "Contact already exists with this email" }
    }

    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      address: {
        line1: data?.address_line1,
        line2: data?.address_line2,
        city: data?.address_city,
        state: data?.address_state,
        postcode: data?.address_postcode,
        country: data?.address_country,
      },
      contact_type: data?.contact_type,
      updated_at: new Date(),
    }

    const contact = await db.managementDb
      ?.collection<IContact>("contacts")
      .updateOne({ _id: new ObjectId(id) }, { $set: payload })

    if (!contact || contact.modifiedCount < 1)
      throw { showError: "Contact not updated" }

    return {
      contact,
    }
  }
}
