/**
 * RN 主入口 - 单组件路由模式
 *
 * 原生侧永远加载 "HybridDemoRN" 组件，通过 props.viewName 决定渲染哪个页面。
 * 这是参考 yp_rn_app 的设计：所有 RN 页面共享一个 App 入口。
 *
 * 原生调用方式：
 * reactRootView.startReactApplication(manager, "HybridDemoRN", bundleOf(
 *     "viewName" to "HomePage",
 *     "instanceId" to "rn_1_xxx",
 *     // 其他业务参数...
 * ))
 */
import {Suspense, useEffect} from 'react';
import {ActivityIndicator, NativeEventEmitter, NativeModules, View} from 'react-native';
import {nativeComponents, pages} from "@/pages";

const {HybridBridge, CallRNModule} = NativeModules;
const eventEmitter = HybridBridge
    ? new NativeEventEmitter(HybridBridge)
    : null;

/**
 * 默认页面（viewName 为空或未匹配时显示）
 */
const DEFAULT_VIEW_NAME = 'HomePage';

interface AppProps {
    /** 页面标识，由原生通过 initialProperties 传入 */
    viewName?: string;
    /** 页面实例 ID，用于页面生命周期管理 */
    instanceId?: string;

    /** 其他业务参数（原生通过 Bundle 传入，RN 通过 props 接收） */
    [key: string]: any;
}

const App = (props: any) => {
    const {viewName = DEFAULT_VIEW_NAME, instanceId, ...pageProps} = props;

    useEffect(() => {
        initGlobalListeners();
    }, []);

    const initialRouteName = viewName || 'HomePage'
    const nativeIndex = nativeComponents.findIndex((item) => item.name === initialRouteName)

    let PageComponent: any = null;

    if (nativeIndex !== -1) {
        PageComponent = nativeComponents[nativeIndex].render;
    } else {
        const pageIndex = pages.findIndex((item) => item.name === initialRouteName)
        PageComponent = pageIndex !== -1 ? pages[pageIndex].render : pages[0].render;
    }

    // Suspense 包裹 lazy 组件，提供加载中的 fallback UI
    return (
        <Suspense fallback={
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        }>
            <PageComponent {...pageProps} viewName={viewName} instanceId={instanceId} />
        </Suspense>
    );
};

/**
 * 全局事件监听初始化
 * 只在 App 首次加载时执行一次，所有页面共享
 */
let globalInitialized = false;

function initGlobalListeners() {
    if (globalInitialized) return;
    globalInitialized = true;

    // 可以在这里做：
    // 1. CodePush 热更新检查
    // 2. 全局配置拉取
    // 3. 公共事件监听
    console.log('[App] Global listeners initialized-App 首次加载时执行一次，所有页面共享');
}

export default App;
