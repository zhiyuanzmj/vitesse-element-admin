<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { ElLoading, ElMessage } from 'element-plus'
import { type EnumGroup, getEnumGroup, post, put } from '../api'

const { id, ...props } = defineProps<{
  id: string
  show: boolean
}>()

let row = $ref<EnumGroup>({ status: true })
id && ({ data: row } = await getEnumGroup(id))

let show = $(useVModel(props, 'show'))
const formRef = $shallowRef<FormInstance>()

const getList = inject('getList', () => {})
async function submit() {
  await formRef?.validate()
  const loading = ElLoading.service({ fullscreen: true })
  try {
    id ? await put(row) : await post(row)
    ElMessage.success('操作成功')
    show = false
    getList()
  } finally {
    loading.close()
  }
}
</script>

<template>
  <el-dialog v-model="show" :close-on-click-modal="false" custom-class="!w-2xl" draggable :title="`${id ? '修改' : '添加'}${$route.meta.title}`">
    <el-form ref="formRef" label-width="auto" :model="row" @submit.prevent="submit">
      <el-form-item :rules="[{ message: '不能为空', required: true }]" prop="name" label="名称">
        <el-input v-model="row.name" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="row.description" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch v-model="row.status" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">确认提交</el-button>
        <el-button @click="show = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
