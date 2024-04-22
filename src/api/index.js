import {handleFetchResponse} from "./requestUtils.js";

export const requestDataSync = async (tabData) => {
    // const res = await
    const res = await handleFetchResponse(() =>
        fetch("http://local.chen.cn:8080/api/dataSync", {
            method: "POST",
            mode: "cors", // no-cors, *cors, same-origin
            headers: {
                "Content-Type": "application/json"
                // "Content-Type": "application/x-www-form-urlencoded;charset:utf-8;"
            },
            body: JSON.stringify(tabData),
        }))
    // 拦截未登录等情况
    const {code} = res
    if (code === 401) {
        // 未登录
        console.debug('未登录')
        return
    }
    return res
}
