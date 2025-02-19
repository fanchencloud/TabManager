<!--
 * @FileDescription: popup主页面
 * @Author: chen
 * @CreateTime: 2023/11/26 3:15
 * @LastEditors: chen
-->
<template>
  <div class="main">
    <div class="topForm">
      <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          :rules="rules"
          :inline="true"
          label-width="auto"
          class="demo-ruleForm"
          status-icon
      >
        <el-form-item prop="workspaceName">
          <el-input v-model="ruleForm.workspaceName" placeholder="工作区名称" class="myInput"/>
        </el-form-item>
        <el-form-item>
          <el-button-group class="ml-4">
            <!--<el-button type="primary" plain @click="createWorkSpace">新建工作区</el-button>-->
            <el-button type="primary" plain @click="createWorkSpace(ruleFormRef)">新建工作区</el-button>
            <el-popconfirm
                title="确定关闭目前打开的所有页面吗?"
                confirm-button-text="确认"
                cancel-button-text="取消"
                @confirm="closeAllTabs">
              <template #reference>
                <el-button type="danger" plain>关闭所有打开的页面</el-button>
              </template>
            </el-popconfirm>
            <el-button type="info" @click="exportData" plain>导出数据</el-button>
            <el-button type="success" @click="importData" plain>导入数据</el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
      <!-- 隐藏的文件输入框 -->
      <input type="file" id="fileInput" ref="fileInput" @change="handleFileChange"/>

    </div>

    <div class="title">
      <el-row>
        <el-col :span="6">
          <div class="grid-content ep-bg-purple">工作区名称</div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content ep-bg-purple-light">保存时间</div>
        </el-col>
        <el-col :span="12">
          <div class="grid-content ep-bg-purple">操作</div>
        </el-col>
      </el-row>
    </div>

    <div class="workspaceList">
      <el-row
          v-for="item in workSpaceList"
          :key="item.fid"
          class="workspaceItem"
      >
        <el-col :span="6">
          <div class="workspaceItemName">{{ item.workSpaceName }}</div>
        </el-col>
        <el-col :span="6">
          <div class="workspaceItemCreateTime">{{ item.saveDataTime }}</div>
        </el-col>
        <el-col :span="12">
          <div class="workspaceItemOperation">
            <el-button-group class="ml-4">
              <el-button type="success" plain @click="savePages(item.fid)">
                保存当前打开页面
              </el-button
              >
              <el-button type="primary" plain @click="handoff(item.fid)">
                切换
              </el-button
              >
              <el-popconfirm
                  title="确定删除当前工作区吗?"
                  confirm-button-text="确认"
                  cancel-button-text="取消"
                  @confirm="deleteWorkspace(item.fid)"
              >
                <template #reference>
                  <el-button type="danger" plain>删除</el-button>
                </template>
              </el-popconfirm>
              <el-button type="info" plain @click="manager(item.fid)"
              >管理
              </el-button
              >
            </el-button-group>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-dialog
        v-model="centerDialogVisible"
        width="46%"
        center
        :show-close="false"
    >
      <div style="text-align: center">
        确定切换到工作区【{{
          workspaceItemDialog.workSpaceName
        }}】吗?<br/>将会关闭当前窗口的所有标签页,并打开工作区的所有标签页
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="openWorkspace">确认</el-button>
          <el-button @click="centerDialogVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted} from "vue";
import {getData, mergeData, saveData, TabItem, WorkSpaceItem} from "../common.js";
import {ElNotification} from "element-plus";
import localforage from "localforage";

onMounted(() => {
  workSpaceList.value = [];
  loadWorkSpaces();
});

const ruleFormRef = ref(null);
const ruleForm = ref({
  workspaceName: "",
});
const rules = reactive({
  workspaceName: [
    {required: true, message: '请输入工作区名称', trigger: 'blur'}
  ],
})

const workSpaceList = ref([]);

const createWorkSpace = async (formEl) => {
  // 检查工作区名称是否为空
  if (!formEl) return false

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      console.log('submit!')
      const workSpaceItem = new WorkSpaceItem();
      workSpaceItem.workSpaceName = ruleForm.value.workspaceName;
      workSpaceItem.fid = new Date().getTime() + '';
      workSpaceItem.saveDataTime = new Date().toLocaleString();
      await saveData(workSpaceItem.fid, workSpaceItem);
      // 清空工作区名称
      ruleForm.value.workspaceName = "";
      // 刷新工作区列表
      await loadWorkSpaces();
    } else {
      console.log('error submit!', fields)
    }
  })
};

/**
 * 加载工作区列表
 */
const loadWorkSpaces = async () => {
  workSpaceList.value = [];
  const res = await localforage.keys();
  // 对res进行排序
  const sortedObjKeys = res.sort();
  for (let index in sortedObjKeys) {
    const fid = sortedObjKeys[index];
    const workSpaceItem = await getData(fid);
    workSpaceList.value.push(workSpaceItem);
  }
};

/**
 * 关闭所有打开的页面 - 顶部按钮
 */
const closeAllTabs = () => {
  closeAllTabFun();
  chrome.tabs.create(
      {
        url: "chrome://newtab/",
        active: true,
      },
      () => {
      }
  );
};
// 关闭所有标签页的函数
const closeAllTabFun = () => {
  // 使用chrome.tabs.query来获取所有的标签页只查询当前窗口的标签页
  chrome.tabs.query(
      {
        // 要求标签页在当前窗口中
        currentWindow: true,
      },
      (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.remove(tab.id);
        });
      }
  );
};

/**
 * 保存当前打开页面(当前窗口)
 * @param fid 工作区id
 */
const savePages = async (fid) => {
  // 查询当前工作区
  const workspaceItem = await getData(fid);
  if (workspaceItem === null) {
    ElNotification({
      message: "工作区不存在",
      type: "error",
    });
    return false;
  }
  workspaceItem.saveDataTime = new Date().toLocaleString();
  workspaceItem.spaceTabs.length = 0;
  // 查询当前窗口的所有标签页
  chrome.tabs.query(
      {
        // 要求标签页在当前窗口中
        currentWindow: true,
      },
      async (tabs) => {
        tabs.forEach((tab) => {
          const tabItem = new TabItem();
          tabItem.id = tab.id;
          tabItem.title = tab.title;
          tabItem.url = tab.url;
          workspaceItem.spaceTabs.push(tabItem);
        });
        // 保存工作区
        await saveData(workspaceItem.fid, workspaceItem);
        ElNotification({
          message: "保存成功",
          type: "success",
        });
        // 刷新工作区列表
        await loadWorkSpaces();
      }
  );
};

/**
 * 切换工作区，关闭当前窗口的所有标签页，打开工作区的所有标签页
 * @param fid 工作区id
 */
const handoff = async (fid) => {
  // 查询当前工作区
  const workspaceItem = await getData(fid);
  if (workspaceItem === null) {
    ElNotification({
      message: "工作区不存在",
      type: "error",
    });
    return false;
  }
  if (workspaceItem.spaceTabs && workspaceItem.spaceTabs.length > 0) {
    workspaceItemDialog.value = workspaceItem;
    centerDialogVisible.value = true;
  }
  // 当前工作区不存在标签页
  else {
    ElNotification({
      message: "工作区不存在标签页",
      type: "error",
    });
    return false;
  }
};

// 切换工作区确认框
const centerDialogVisible = ref(false);
const workspaceItemDialog = ref({});

const openWorkspace = () => {
  closeAllTabFun();
  for (let i = 0; i < workspaceItemDialog.value.spaceTabs.length; i++) {
    const tab = workspaceItemDialog.value.spaceTabs[i];
    chrome.tabs.create(
        {
          url: tab.url,
          active: false,
        },
        function (tab) {
        }
    );
  }
  workspaceItemDialog.value = {};
  centerDialogVisible.value = false;
};

/**
 * 删除工作区
 * @param fid 工作区id
 */
const deleteWorkspace = async (fid) => {
  // 查询当前工作区
  const workspaceItem = await getData(fid);
  if (workspaceItem === null) {
    ElNotification({
      message: "工作区不存在",
      type: "error",
    });
    return false;
  }
  ElNotification({
    message: "删除成功",
    type: "success",
  });
  await localforage.removeItem(fid);
  await loadWorkSpaces();
};
const manager = (fid) => {
  window.location.href =
      "#/workspaceManager?fid=" + fid + "&t=" + new Date().getTime();
};

const exportData = () => {
  console.debug("workSpaceList: {}", workSpaceList.value)
  const blob = new Blob([JSON.stringify(workSpaceList.value)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = new Date().toLocaleString() + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

const fileInput = ref(null);
const importData = () => {
  fileInput.value.click();
}

const handleFileChange = (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    // 获取上传的文件
    const file = files[0];
    console.log('选中的文件:', file);

    // 可以在这里进行文件上传操作，比如发送到服务器
    // uploadFile(file);

    const reader = new FileReader();

    reader.onload = async function (e1) {
      const data = JSON.parse(e1.target.result);
      console.debug('data:{}', data)
      const mergeWorkspace = mergeData(data, workSpaceList.value)
      for (let i = 0; i < mergeWorkspace.length; i++) {
        const workspace = mergeWorkspace[i];
        await saveData(workspace.fid, workspace)
      }
      await loadWorkSpaces()
    };

    reader.readAsText(file);
  }
}

</script>

<style scoped>
.main {
  width: 720px;
  min-height: 310px;
  max-height: 500px;
}

.topForm {
  //display: flex;
  //justify-content: space-between;
  //align-items: center;
  padding: 20px 20px 20px 20px;
}

.myInput {
  width: 180px;
}

.title {
  padding: 0 20px;
  font-weight: bolder;
  font-size: 1rem;
}

.workspaceList {
  padding: 0 20px;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 230px;
  scrollbar-width: thin;
}

.workspaceItem {
  margin: 0.4rem 0;
}

/* 隐藏文件选择框 */
input[type="file"] {
  display: none;
}

/* 滚动槽 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  border-radius: 3px;
  cursor: pointer;
  background: rgba(25, 137, 250, 0.46);
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 3px;
  cursor: pointer;
  background: rgba(25, 137, 250, 0.46);
  -webkit-box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}
</style>
