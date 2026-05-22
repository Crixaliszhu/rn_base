/**
 * 原生调用 RN 的处理器
 *
 * 参考 yp_rn_app/src/core/native/callRN/index.ts 的设计：
 * 1. 原生通过 RCTDeviceEventEmitter 发送 "call_rn" 事件
 * 2. RN 监听事件，根据 module_name + method 分发到对应处理函数
 * 3. 处理完毕后通过 CallRNModule.receiveRNResult 回传结果
 *
 * 这种设计让原生可以主动调用 RN 的业务逻辑并获取返回值。
 */
import {NativeEventEmitter, NativeModules, NativeModule} from 'react-native';
import mathModule from './modules/math';
import dataModule from './modules/data';

const {CallRNModule} = NativeModules;

/** 事件结构 */
interface CallRNEvent {
  call_id: string;
  module_name: string;
  method: string;
}

/** 注册的 RN 模块 */
const registerRNModule: Record<string, Record<string, Function>> = {
  math: mathModule,
  data: dataModule,
};

/**
 * 初始化原生调 RN 的监听
 * 在 index.js 中调用一次即可
 */
export const callRN = () => {
  if (!CallRNModule) {
    console.warn('[callRN] CallRNModule not available');
    return;
  }

  const eventEmitter = new NativeEventEmitter(
    CallRNModule as unknown as NativeModule,
  );

  eventEmitter.addListener(
    'call_rn',
    ({event, query = '{}'}: {event: CallRNEvent; query: string}) => {
      try {
        const parsedQuery = JSON.parse(query);
        const module = registerRNModule[event.module_name];

        if (!module) {
          CallRNModule.receiveRNError(
            event,
            'MODULE_NOT_FOUND',
            `Module "${event.module_name}" is not registered`,
          );
          return;
        }

        const method = module[event.method];
        if (!method) {
          CallRNModule.receiveRNError(
            event,
            'METHOD_NOT_FOUND',
            `Method "${event.method}" not found in module "${event.module_name}"`,
          );
          return;
        }

        // 执行方法并回传结果
        method({
          query: parsedQuery,
          callback: ({type, data}: {type: string; data: any}) => {
            if (type === 'error') {
              CallRNModule.receiveRNError(
                event,
                data.errCode || 'UNKNOWN',
                data.errMsg || 'Unknown error',
              );
            } else {
              CallRNModule.receiveRNResult(event, JSON.stringify(data));
            }
          },
        });
      } catch (e: any) {
        console.warn('[callRN] Error:', e);
        CallRNModule.receiveRNError(
          event,
          'PARSE_ERROR',
          e.message || 'Failed to parse call_rn event',
        );
      }
    },
  );

  console.log('[callRN] Listener registered');
};
