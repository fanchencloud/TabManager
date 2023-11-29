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
    console.debug("saveData key:" , key + " data:" , data)
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