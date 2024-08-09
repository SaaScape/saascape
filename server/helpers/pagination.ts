import { Collection, Db, Document } from 'mongodb'
import { IQuery } from '../interfaces/pagination'
import moment from 'moment'

interface IConfiguration {
  collection?: Collection
  findObj?: { [key: string]: any }
  aggregationPipeline?: { [key: string]: any }[]
  projectionObj?: { [key: string]: 0 | 1 }
  timeConstraintField?: string
}

interface IPaginationObj {
  nextPage?: number
  prevPage?: number
  page: number
  totalDocuments: number
}

const requiredPaginationParams = ['limit', 'page']
export default class Pagination {
  query: IQuery
  constructor(query: IQuery) {
    for (const key of requiredPaginationParams) {
      if (!Object.keys(query).includes(key)) throw { showError: `Missing required param: ${key}`, status: 400 }
    }
    this.query = query
  }

  private preparePaginationObj(totalDocuments: number, page: number, limit: number) {
    const paginationObj: IPaginationObj = {
      page,
      totalDocuments,
    }

    const hasMoreDocuments = +page * +limit < totalDocuments
    if (hasMoreDocuments) {
      paginationObj.nextPage = +page + 1
    }
    if (+page - 1 > 0) {
      paginationObj.prevPage = +page - 1
    }

    return paginationObj
  }

  async runPaginatedQuery(data: IConfiguration) {
    const {
      limit = 20,
      page = 1,
      initialRequestDate = moment().toISOString(),
      sortField = '_id',
      order = -1,
    } = this.query
    const { collection, findObj, projectionObj = {}, timeConstraintField = 'created_at', aggregationPipeline } = data
    if (!collection) throw new Error('Collection not specified')
    if (!findObj && !aggregationPipeline) throw new Error('FindObj not specified')

    const skip = +((+page - 1) * +limit)

    let documentCount = 0

    const sortObj: { [key: string]: -1 | 1 } = {
      [sortField]: +order > 0 ? 1 : -1,
    }

    const isAggregate = !!aggregationPipeline

    let records: Document[] = []

    switch (isAggregate) {
      case true:
        const aggregateWithTimeConstraint = [
          {
            $match: {
              [timeConstraintField]: {
                $lte: moment(initialRequestDate).toDate(),
              },
            },
          },
          ...(aggregationPipeline || []),
        ]

        documentCount =
          (await collection.aggregate([...aggregateWithTimeConstraint, { $count: 'totalDocuments' }]).toArray())?.[0]
            ?.totalDocuments || 0

        records = await collection
          .aggregate([
            ...aggregateWithTimeConstraint,
            {
              $sort: sortObj,
            },
            {
              $skip: +skip,
            },
            {
              $limit: +limit,
            },
          ])
          .toArray()
        break
      default:
        documentCount = await collection.countDocuments({
          ...findObj,
          [timeConstraintField]: { $lte: moment(initialRequestDate).toDate() },
        })
        records = await collection
          .find({
            ...findObj,
            [timeConstraintField]: {
              $lte: moment(initialRequestDate).toDate(),
            },
          })
          .sort(sortObj)
          .skip(+skip)
          .limit(+limit)
          .project(projectionObj)
          .toArray()
        break
    }

    const paginationObj = this.preparePaginationObj(documentCount, +page, +limit)

    return {
      documentCount,
      paginatedData: { ...paginationObj, records },
    }
  }
}
