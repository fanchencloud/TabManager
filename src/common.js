import localforage from "localforage";

export const TabItem = function () {
  this.id = "";
  this.title = "";
  this.url = "";
}

export var WorkSpaceItem = function () {
  this.fid = "";            // 主键ID
  this.workSpaceName = "";  // 工作区名称
  this.saveDataTime = "";   // 保存时间
  this.spaceTabs = [];      // 工作区中的页面
}
/**
 * 地址让获取参数
 * @param variable 地址栏参数名称
 * @returns {string|boolean} 参数数据
 */
export const getQueryVariable = (variable) => {
  const hashUrl = window.location.hash
  const query = hashUrl.split('?')[1]
  const vars = query.split('&')
  for (const element of vars) {
    const pair = element.split('=')
    if (pair[0] === variable) {
      return pair[1]
    }
  }
  return ''
}

/**
 * 保存数据
 * @param key 键
 * @param data 值
 * @param serialization 是否序列化
 */
export const saveData = async (key, data, serialization = true) => {
  console.debug("saveData key:", key + " data:", data)
  if (serialization) {
    data = JSON.stringify(data)
  }
  await localforage.setItem(key, data)
}

export const getData = (key, serialization = true) => {
  return new Promise((resolve, reject) => {
    localforage.getItem(key).then((data) => {
      if (serialization) {
        data = JSON.parse(data)
      }
      resolve(data)
    }).catch((err) => {
      reject(err)
    })
  })
}

/**
 * 合并数据（将本地的数据合并到上传的数据中）
 * @param data1 需要合并的数据（上传的）
 * @param data2 需要合并的数据（本地的）
 * @returns {*[]}
 */
export const mergeData = (data1, data2) => {
  const mergedData = [...data1];
  data2.forEach(newItem => {
    const existingItemIndex = mergedData.findIndex(item => item.fid === newItem.fid);
    if (existingItemIndex === -1) {
      // 如果新数据的fid不存在，则添加新的工作空间
      mergedData.push(newItem);
    } else {
      // 如果fid已经存在，合并spaceTabs
      const existingItem = mergedData[existingItemIndex];
      newItem.spaceTabs.forEach(newTab => {
        // 判断是否存在相同title和url的tab
        const existingTabIndex = existingItem.spaceTabs.findIndex(tab => tab.title === newTab.title && tab.url === newTab.url);
        if (existingTabIndex === -1) {
          // 如果tab不存在，添加新的tab
          existingItem.spaceTabs.push(newTab);
        } else {
          // 如果tab已经存在，可以选择合并字段或者跳过
          console.log(`Tab 已存在：${newTab.title} - ${newTab.url}`);
        }
      });
    }
  });
  return mergedData;
}
