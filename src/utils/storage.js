/**
 *  本地存储封装模块
 */
export const getItem = name => {
   const data = window.localStorage.getItem(name)
   // 为什么把JSON.parse 放到try-catch中?
   // 因为data 可能不是JSON 格式字符串
    try{
        // 尝试把data 转为JavaScript 对象
        return JSON.parse(data)
    } catch (err){
        // data 不是JSON 格式字符串，直接原样返回
        return data
    }
}
export const setItem = (name, value) => {
    // 如果value 是对象, 就把value 转为 JSON格式字符串再存储
    if (typeof value === 'object'){
        value = JSON.stringify
    }
    window.localStorage.setItem(name, value)
}
export const removeItem = name => {
    window.localStorage.removeItem(name)
}