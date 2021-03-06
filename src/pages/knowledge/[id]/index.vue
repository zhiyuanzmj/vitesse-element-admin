<script setup lang="tsx" name="knowledge-id">
import { AgGridVue } from 'ag-grid-vue3'
import { ElMessage, ElMessageBox, ElSwitch } from 'element-plus'
import type { KnowledgeContent } from './api'
import { drop, getKnowledgeContentList, put } from './api'
import VForm from './components/VForm.vue'

const { id } = defineProps<{ id: string }>()

let show = $ref(false)
const { agGridBind, agGridOn, selectedList, getList, row, list } = useAgGrid<KnowledgeContent>(
  [
    { headerName: '', field: 'select', maxWidth: 68, rowDrag: true, lockPosition: 'left', pinned: 'left', valueGetter: '', unCheck: true, sortable: false, suppressMovable: true, checkboxSelection: true, headerCheckboxSelection: true },
    { headerName: '标题', field: 'title', value: '' },
    { headerName: '状态', field: 'status', suppressSizeToFit: true, value: 'true', form: { type: 'switch' }, cellRenderer: { setup: ({ params }) => () =>
      <ElSwitch disabled={!hasPermission('/knowledge/[id]/contents/[id]/put')} model-value={params.value}
        onChange={async () => {
          await ElMessageBox.confirm('确定修改状态?', '提示')
          await put({ ...params.data, status: !params.value })
          ElMessage.success('操作成功')
          getList()
        } }
      />,
    } },
    { headerName: '操作', field: 'actions', unCheck: true, maxWidth: 68, suppressMovable: true, lockPosition: 'right', pinned: 'right', cellRenderer: { setup: props => () =>
      <div className="flex items-center justify-between">
        <button v-permission="/knowledge/[id]/contents/[id]/put" className="fa6-solid:pen-to-square btn" onClick={() => {
          show = true
          row.value = props.params.data
        }}/>
        <button v-permission="/knowledge/[id]/contents/[id]/delete" className="fa6-solid:trash-can btn" onClick={() => onDrop([props.params.data])}/>
      </div>,
    } },
  ],
  params => getKnowledgeContentList({ ...params, knowledge: { id } }),
)

async function onDrop(list = selectedList.value) {
  await ElMessageBox.confirm(`确定删除 ${list.length} 条数据？`, '提示')
  const [fulfilled, rejected] = (await Promise.allSettled(list.map(i => drop(i.id, id))))
    .reduce((a, b) => (a[b.status === 'fulfilled' ? 0 : 1]++, a), [0, 0])
  fulfilled && ElMessage.success(`删除成功 ${fulfilled} 条`); await nextTick()
  rejected && ElMessage.error(`删除失败 ${rejected} 条`)
  getList()
}

function rowDragEnd({ node, overIndex }: any) {
  Promise.all([
    put({ id: node.data.id, sort: list.value[overIndex].sort }),
    put({ id: list.value[overIndex].id, sort: node.data.sort }),
  ]).then(() => getList())
}

function addHandler() {
  show = true
  row.value = {
    knowledge: { id },
    status: true,
  }
}
</script>

<template>
  <div layout>
    <VHeader back>
      <el-button v-permission="'/knowledge/[id]/contents/post'" class="!ml-auto" type="primary" @click="addHandler">
        <div fluent:add-12-filled mr-1 />新增
      </el-button>
    </VHeader>

    <div main>
      <VFilter />
      <ag-grid-vue v-bind="agGridBind" v-on="agGridOn" @row-drag-end="rowDragEnd" />
      <Pagination>
        <el-button v-permission="'/knowledge/[id]/contents/[id]/delete'" type="primary" :disabled="!selectedList.length" text @click="onDrop(selectedList)">
          删除
        </el-button>
      </Pagination>
    </div>

    <Suspense v-if="show">
      <VForm v-model:show="show" :row="row" />
      <template #fallback>
        <div v-loading.fullscreen="true" />
      </template>
    </suspense>
  </div>
</template>

<route lang="yaml">
meta:
  hidden: true
  permission:
    - title: 列表
      permission: /knowledge/[id]/contents
    - title: 添加
      permission: /knowledge/[id]/contents/post
    - title: 修改
      permission: /knowledge/[id]/contents/[id]/put
    - title: 删除
      permission: /knowledge/[id]/contents/[id]/delete
</route>
