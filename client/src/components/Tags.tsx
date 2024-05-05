import { Button, Select, Tag } from "antd"
import { useState } from "react"
import { UpdateType } from "types/enums"
interface ITagContainerProps {
  tags: string[]
  className?: string
  allowDelete?: boolean
  onTagDelete?: (tag: string[], updateType: UpdateType) => Promise<void>
}
export const TagContainer = ({
  tags,
  className,
  allowDelete,
  onTagDelete,
}: ITagContainerProps) => {
  const onTagRemoval = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
    const tagValue = e.target.closest(".ant-tag")?.textContent
    onTagDelete?.([tagValue], UpdateType.REMOVE)
  }

  const generateTags = () => {
    return tags?.map((tag, index) => (
      <Tag
        color='geekblue'
        key={index}
        closable={allowDelete}
        onClose={onTagRemoval}
      >
        {tag}
      </Tag>
    ))
  }

  return (
    <div className={`tag-container ${className || ""}`}>{generateTags()}</div>
  )
}

interface ITagModalProps {}
export const TagModal = ({}: ITagModalProps) => {}

interface ITagInterfaceProps {
  onSave: (tags: string[], updateType: UpdateType) => void
}
export const TagInterface = ({ onSave }: ITagInterfaceProps) => {
  const [tags, setTags] = useState([])

  return (
    <div className='tag-interface'>
      <div className='p-10'>
        <div>
          <div className='title m-b-10'>Tags</div>
          <Select
            onClick={(e) => {
              e.stopPropagation()
            }}
            style={{ width: "100%" }}
            onChange={(e) => {
              setTags(e)
            }}
            mode='tags'
          />
        </div>
        <div className='m-t-20'>
          <span>TAGS ADDED</span>
          <TagContainer className={"m-t-10"} tags={tags} />
        </div>
      </div>
      <div className='footer-bar d-flex p-10'>
        <Button className='m-r-10'>Cancel</Button>
        <Button type='primary' onClick={() => onSave(tags, UpdateType.ADD)}>
          Save
        </Button>
      </div>
    </div>
  )
}
