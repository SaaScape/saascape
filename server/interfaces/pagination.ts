export interface IQuery {
  statuses?: string
  limit?: string
  sortField?: string
  order?: 1 | -1
  initialRequestDate?: string
  page?: string
  payment_statuses?: string
}
