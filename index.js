/**
 * RN 入口文件
 *
 * 在混合项目中，通过 AppRegistry 注册多个组件，
 * 原生侧通过组件名决定加载哪个 RN 页面。
 *
 * 这种设计参考了 yp_rn_app 的做法：
 * - 每个 RN 页面对应一个原生 Activity
 * - 原生通过 viewName 指定加载哪个 RN 组件
 */
import {AppRegistry} from 'react-native';
import App from './src/App';
import SecondPage from './src/pages/SecondPage';
import {callRN} from './src/native/callRN';

// 初始化原生调 RN 的监听
callRN();

// 注册主应用（包含导航逻辑的完整 RN 应用）
AppRegistry.registerComponent('MainApp', () => App);

// 注册独立页面（原生可直接加载，不经过 RN 导航栈）
AppRegistry.registerComponent('SecondPage', () => SecondPage);

console.log('[HybridDemo] RN Module initialized');
