import { getDepartmentList, list } from '.'

export function getDepartment(id: string) {
  const data = getDepartmentList({ id })[0]

  function getPath(id, result = []) {
    const item = list.find(item => item.id === id)
    result = [...result, id]
    if (item.parentId)
      result = getPath(item.parentId, result)
    return result
  }

  return {
    ...data,
    parentIds: getPath(data.id),
  }
}

export default defineEventHandler(({ context }) => {
  return {
    data: getDepartment(context.params.id),
  }
})
