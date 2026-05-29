/**
 * 原生事件监听工具
 *
 * 参考 yp_rn_app/src/core/native/events/index.ts 的设计。
 * 提供统一的事件监听/取消监听接口，方便任何 RN 页面使用。
 *
 * 使用方式：
 *
 * // 方式1：在 useEffect 中使用
 * useEffect(() => {
 *   const unsubscribe = onNativeEvent('onLoginStateChanged', (data) => {
 *     console.log('登录状态:', data.isLoggedIn);
 *   });
 *   return unsubscribe; // 组件卸载时自动取消监听
 * }, []);
 *
 * // 方式2：使用 Hook
 * useNativeEvent('onRefreshData', (data) => {
 *   console.log('收到刷新通知:', data);
 * });
 */
import {useEffect, useRef} from 'react';
import {NativeModules, NativeEventEmitter, NativeModule} from 'react-native';

const {HybridBridge} = NativeModules;

/** 事件发射器单例 */
const eventEmitter = HybridBridge
  ? new NativeEventEmitter(HybridBridge as unknown as NativeModule)
  : null;

/**
 * 所有原生事件名称定义（避免魔法字符串）
 */
export enum NativeEvent {
  /** 原生页面返回数据 */
  PAGE_RESULT = 'onPageResult',
  /** 用户登录状态变化 */
  LOGIN_STATE_CHANGED = 'onLoginStateChanged',
  /** 数据刷新通知 */
  REFRESH_DATA = 'onRefreshData',
  /** 页面显示 */
  PAGE_SHOW = 'onPageShow',
  /** 页面隐藏 */
  PAGE_HIDE = 'onPageHide',
}

/**
 * 监听原生事件（函数式）
 *
 * @param eventName 事件名称
 * @param callback 回调函数
 * @returns 取消监听的函数
 *
 * @example
 * const unsubscribe = onNativeEvent('onLoginStateChanged', (data) => {
 *   console.log(data.isLoggedIn);
 * });
 * // 不再需要时取消监听
 * unsubscribe();
 */
export function onNativeEvent<T = any>(
  eventName: string | NativeEvent,
  callback: (data: T) => void,
): () => void {
  if (!eventEmitter) {
    console.warn(`[NativeEvent] eventEmitter 不可用，无法监听 "${eventName}"`);
    return () => {};
  }

  const subscription = eventEmitter.addListener(eventName, (data: T) => {
    console.log(`[NativeEvent] 收到事件 "${eventName}":`, JSON.stringify(data));
    callback(data);
  });

  // 返回取消监听函数
  return () => {
    subscription.remove();
  };
}

/**
 * 监听原生事件（React Hook）
 *
 * 自动在组件挂载时注册监听，卸载时取消监听。
 *
 * @param eventName 事件名称
 * @param callback 回调函数
 *
 * @example
 * const HomePage = () => {
 *   useNativeEvent('onLoginStateChanged', (data) => {
 *     setLoginState(data.isLoggedIn);
 *   });
 *   return <View>...</View>;
 * };
 */
export function useNativeEvent<T = any>(
  eventName: string | NativeEvent,
  callback: (data: T) => void,
): void {
  // 用 ref 缓存最新的 callback，避免 useEffect 依赖变化导致重复注册
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const unsubscribe = onNativeEvent<T>(eventName, (data) => {
      callbackRef.current(data);
    });
    return unsubscribe;
  }, [eventName]);
}

/**
 * 同时监听多个原生事件（React Hook）
 *
 * @param listeners 事件监听配置数组
 *
 * @example
 * useNativeEvents([
 *   { event: NativeEvent.LOGIN_STATE_CHANGED, handler: (data) => setLogin(data) },
 *   { event: NativeEvent.REFRESH_DATA, handler: (data) => refresh() },
 * ]);
 */
export function useNativeEvents(
  listeners: Array<{event: string | NativeEvent; handler: (data: any) => void}>,
): void {
  useEffect(() => {
    const unsubscribes = listeners.map(({event, handler}) =>
      onNativeEvent(event, handler),
    );
    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);
}

export default {onNativeEvent, useNativeEvent, useNativeEvents, NativeEvent};
