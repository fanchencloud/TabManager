/**
 *
 * @param fetchMethod
 * @returns {Promise<*>}
 */
export const handleFetchResponse = async (fetchMethod) => {
    try {
        const response = await fetchMethod();
        // console.debug("返回数据：", response)
        if (!response.ok) {
            // 如果状态码不是 200 OK，则抛出一个 Error
            throw new Error(`Fetch 请求失败，状态码: ${response.status}`);
        }
        // 如果一切正常，返回响应数据
        return await response.json(); // 直接返回响应的 JSON 数据
    } catch (error) {
        // 捕获错误并处理
        console.error('Fetch 请求出错:', error);
        throw error; // 可以选择抛出错误供调用方处理
    }
}
