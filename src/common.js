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
