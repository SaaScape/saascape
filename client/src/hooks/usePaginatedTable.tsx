import { useEffect, useRef, useState } from "react"
import { IPaginatedData, ITableConfig } from "../components/PaginatedTable"
import { queryParamBuilder } from "../helpers/utils"
import { apiAxios } from "../helpers/axios"

export interface IPaginatedViewProps {
  paginatedData: IPaginatedData
  tableConfig: ITableConfig
  onTableChange: (config: any) => void
}
interface IProps {
  apiUrl: string
  sortField?: string
  order?: number
}
const usePaginatedTable = (props: IProps) => {
  // TODO: IMPLEMENT INITIAL REQUEST DATE FEATURE
  const { apiUrl, sortField = "created_at", order = -1 } = props

  const [dataFetching, setDataFetching] = useState(false)

  const [paginatedData, setPaginatedData] = useState<IPaginatedData>({
    totalDocuments: 0,
    records: {},
  })

  const [tableConfig, setTableConfig] = useState<ITableConfig>({
    current: 1,
    pageSize: 10,
  })

  const [queryConfig, setQueryConfig] = useState({
    searchValue: "",
  })

  const prevTableConfigRef = useRef<ITableConfig>()

  useEffect(() => {
    return () => {
      prevTableConfigRef.current = tableConfig
    }
  }, [tableConfig])

  useEffect(() => {
    ;(() => {
      const records = paginatedData?.records?.[tableConfig?.current]?.length
      if (
        prevTableConfigRef.current?.current !== tableConfig?.current &&
        !records
      )
        return getData(queryConfig?.searchValue)

      if (prevTableConfigRef.current?.pageSize !== tableConfig?.pageSize) {
        setPaginatedData((curr) => ({
          ...curr,
          records: {},
        }))
        return getData(queryConfig?.searchValue)
      }
    })()
  }, [tableConfig])

  const getData = async (value: string) => {
    setDataFetching(true)

    const {
      data: { data, success },
    } = await apiAxios.get(
      `${apiUrl}${queryParamBuilder({
        page: tableConfig?.current,
        limit: tableConfig?.pageSize,
        searchValue: value,
        sortField,
        order,
      })}`
    )

    if (success) {
      setPaginatedData((curr) => ({
        totalDocuments: +data?.data?.documentCount,
        records: {
          ...(curr?.records || {}),
          [+data?.data?.paginatedData?.page]:
            data?.data?.paginatedData?.records,
        },
      }))
    }
    setDataFetching(false)
  }

  const onSearch = (value: string) => {
    setQueryConfig({ searchValue: value })
    getData(value)
  }

  const reload = () => {
    getData(queryConfig?.searchValue)
  }

  const onTableChange = (config: any) => {
    setTableConfig(config)
  }

  return {
    tableConfig,
    // setTableConfig,
    // prevTableConfigRef,
    // queryConfig,
    // setQueryConfig,
    paginatedData,
    // setPaginatedData,
    // getData,
    onSearch,
    dataFetching,
    reload,
    onTableChange,
  }
}

export default usePaginatedTable
