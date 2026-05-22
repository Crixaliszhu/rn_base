/**
 * data 模块 - 供原生调用的数据处理逻辑
 *
 * 演示原生调用 RN 进行数据格式化、过滤等操作。
 * 实际项目中可能是：列表数据处理、搜索过滤、数据聚合等。
 *
 * 原生调用方式：
 * CallRNModule.callRN("data", "formatPrice", { price: 12345 })
 */

interface CallParams {
  query: Record<string, any>;
  callback: (result: {type: string; data: any}) => void;
}

const dataModule = {
  /** 格式化价格 */
  formatPrice: ({query, callback}: CallParams) => {
    const {price = 0, currency = '¥'} = query;
    const formatted = `${currency}${(price / 100).toFixed(2)}`;
    callback({
      type: 'success',
      data: {formatted, original: price},
    });
  },

  /** 格式化时间戳 */
  formatTime: ({query, callback}: CallParams) => {
    const {timestamp} = query;
    if (!timestamp) {
      callback({
        type: 'error',
        data: {errCode: 'MISSING_PARAM', errMsg: 'timestamp is required'},
      });
      return;
    }
    const date = new Date(timestamp);
    const formatted = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(
      date.getHours(),
    ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    callback({
      type: 'success',
      data: {formatted, timestamp},
    });
  },

  /** 获取 RN 侧的版本信息 */
  getVersion: ({query, callback}: CallParams) => {
    callback({
      type: 'success',
      data: {
        rnVersion: '1.0.0',
        buildTime: '2025-05-21',
        features: ['页面跳转', '数据持久化', '事件通信', '热更新'],
      },
    });
  },
};

export default dataModule;
