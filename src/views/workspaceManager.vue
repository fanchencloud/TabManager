<!--
 * @FileDescription: 工作区管理页面
 * @Author: chen
 * @CreateTime: 2023/11/27 19:10
 * @LastEditors: chen
-->
<template>
  <div class="main">
    <div class="title">
      <el-config-provider :locale="locale">
        <el-page-header @back="goBack">
          <template #content>
            <div class="title_content">
              <div class="title_content_left">工作区名称：{{ workspaceItem.workSpaceName }}</div>
              <div class="title_content_right">页面数量：{{ workspaceItem.spaceTabs.length }}</div>
            </div>
          </template>
        </el-page-header>
      </el-config-provider>
    </div>
    <el-divider/>

    <div class="second_title">
      <el-row>
        <el-col :span="18">
          <div class="">页面名称</div>
        </el-col>
        <el-col :span="6">
          <div class="operation">操作</div>
        </el-col>
      </el-row>
    </div>

    <div class="pageList">
      <el-row v-for="item in workspaceItem.spaceTabs" :key="item.id" class="pageItem">
        <el-col :span="18">
          <el-tooltip
              class="box-item"
              effect="dark"
              placement="auto-start"
              :content="item.title"
          >
            <div class="pageTitle">{{ item.title }}</div>
          </el-tooltip>
        </el-col>
        <el-col :span="6">
          <div class="operations">
            <el-button-group class="ml-4">
              <el-button type="primary" :icon="View" @click="view(item.url)">查看</el-button>
              <el-button type="danger" @click="deletePage(item.id)">
                删除
                <el-icon class="el-icon--right">
                  <Delete/>
                </el-icon>
              </el-button>
            </el-button-group>
          </div>
        </el-col>
      </el-row>
    </div>

    <div style="height: 1rem"></div>

  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {getData, getQueryVariable, saveData} from "../common.js";
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import {ElNotification} from "element-plus";
import localforage from "localforage";
import {Delete, View,} from '@element-plus/icons-vue'

const locale = ref(zhCn)

const fid = ref('')

/**
 * 工作区项
 */
const workspaceItem = ref({
  fid: "",            // 主键ID
  workSpaceName: "",  // 工作区名称
  saveDataTime: "",   // 保存时间
  spaceTabs: [],      // 工作区中的页面
})

onMounted(async () => {
  fid.value = getQueryVariable("fid")
  await loadPageData()
})

const loadPageData = async () => {
  // 从数据库中获取工作区信息
  const item = await getData(fid.value)
  if (item === null) {
    ElNotification({
      message: '工作区不存在',
      type: 'error',
    })
    return false
  }
  workspaceItem.value = item
}

const goBack = () => {
  window.location.href = "#/"
}

const view = (pageUrl) => {
  chrome.tabs.create({
        "url": pageUrl,
        "active": false
      },
      function (tab) {
      }
  );
}

const deletePage = async (pageId) => {
  // 遍历工作区中的页面，删除id为pageId的页面
  for (let i = 0; i < workspaceItem.value.spaceTabs.length; i++) {
    const pageItem = workspaceItem.value.spaceTabs[i];
    if (pageItem.id === pageId) {
      workspaceItem.value.spaceTabs.splice(i, 1)
      break
    }
  }
  console.debug(workspaceItem.value)
  // 更新本地存储
  saveData(fid.value, workspaceItem.value).then(() => {
    ElNotification({
      message: '删除成功',
      type: 'success',
    })
    loadPageData()
  })
}
</script>

<style scoped>
.main {
  width: 700px;
  min-height: 250px;
  max-height: 500px;
}

.title {
  margin-top: 10px;
  padding: 0 10px;
}

.title_content {
  width: 550px;
  display: flex;
  justify-content: space-between;
}

.second_title {
  margin-top: -10px;
  padding: 0 10px 4px 10px;
  font-size: 1.2rem;
  border-bottom: 1px solid #535bf2;
}

.second_title .operation {
  text-align: center;
}

.pageList {
  margin: 14px 0;
}

.pageItem {
  margin: 10px 0;
  padding: 0 10px 6px 10px;
  border-bottom: 1px solid #ebeef5;
}

/* pageItem的最后一个不设置下边框 */
.pageItem:last-child {
  border-bottom: none;
}

.pageItem .pageTitle {
  font-size: 1rem;
  max-width: 480px;
  /* 文字超过后隐藏 */
  overflow: hidden;
  /* 文字不换行，显示省略 */
  text-overflow: ellipsis;
  /* 强制一行显示 */
  white-space: nowrap;
}

.pageItem .operations {
  display: flex;
  justify-content: center;
}
</style>
