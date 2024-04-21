import {handleFetchResponse} from "./requestUtils.js";

export const requestDataSync = async (tabData) => {
    // const res = await
    const res = await handleFetchResponse(() =>
        fetch("https://qqlykm.cn/api/free/ip/get", {
            method: "GET",
            mode: "cors", // no-cors, *cors, same-origin
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset:utf-8;"
            }
        }))
    console.debug('requestDataSync res: {}', res)
}
