/**
 * RN 入口文件 - 单组件注册方式
 *
 * 只注册一个组件 "HybridDemoRN"，原生侧永远加载这一个组件名。
 * 通过 initialProperties 中的 viewName 参数决定渲染哪个页面。
 *
 * 这种方式的优势：
 * 1. 新增页面只需改 RN 代码，原生不需要知道新页面的存在
 * 2. App 组件统一处理公共逻辑（热更新、事件监听、全局初始化）
 * 3. 热更新友好，新增页面无需原生发版
 */
import {AppRegistry} from 'react-native';
import App from './src/App';
import {callRN} from './src/native/callRN';

// 初始化原生调 RN 的监听
callRN();

// 只注册一个组件，原生通过 viewName 参数控制显示哪个页面
AppRegistry.registerComponent('HybridDemoRN', () => App);

console.log('[HybridDemo] RN Module initialized (single component mode)');
