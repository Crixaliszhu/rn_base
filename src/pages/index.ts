import {ComponentType, lazy, LazyExoticComponent} from "react";
import {RNPageCode, RNPageName} from "@/core/router/routeName";

/** 定义路由配置 */
interface Page {
    /** 路由页面名称 */
    name: RNPageName,
    /** 页面code 业务端唯一标识 */
    pageCode: RNPageCode,
    /** 页面 */
    render: LazyExoticComponent<ComponentType<any>>
}

/** RN路由注册 */
export const pages: Page[] = [
    {
        name: 'HomePage',
        pageCode: RNPageCode.HomePage,
        render: lazy(() => import('@/pages/HomePage')),
    },
    {
        name: 'SecondPage',
        pageCode: RNPageCode.SecondPage,
        render: lazy(() => import('@/pages/SecondPage')),
    },
]

/** 供原生直接使用的组件 */
export const nativeComponents: Page[] = []