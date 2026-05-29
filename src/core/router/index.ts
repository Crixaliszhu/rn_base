/**
 * 定义路由跳转函数比如：打开原生页面函数，打开 RN 页面函数，关闭页面函数，关闭弹窗；侧滑返回处理；
 */
import {Keyboard} from "react-native";
import {nativeComponents, pages} from "@/pages";
import {RNPageName} from "@/core/router/routeName";

const openNewActivityResult = (viewName: string, params = {}, type = 'push' as 'push' | 'replace') =>{

}

const openNewActivity  = (viewName: string, params = {}, type = 'push' as 'push' | 'replace') =>{}

export const viewName2PageCode = (viewName: string, params?: Record<string, any>) => {
    if (params == null) params = {} as Record<string, any>
    (params.key_page_code = viewNameFindPageCode(viewName))
    return params
}

/**
 * 根据viewName查找pageCode
 */
export const viewNameFindPageCode = (viewName: string) => {
    const findPage = pages.find((each) => each.name === viewName) || nativeComponents.find((each) => each.name === viewName)
    const codeV2 = findPage?.pageCode || ''
    return codeV2 || (findPage?.pageCode || '')
}

const pushAsync = async (name: string, params?: Record<string, any>) => {
    Keyboard.dismiss()
    return openNewActivityResult(name, viewName2PageCode(name, params), 'push')
}

const push = (name: RNPageName, params?: Record<string, any>) => {
    Keyboard.dismiss()
    return openNewActivity(name, viewName2PageCode(name, params), 'push')
}

/** 快捷路由跳转函数 */
const router = {
    push,
    pushAsync
}

export default router