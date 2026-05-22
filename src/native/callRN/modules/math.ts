/**
 * math 模块 - 供原生调用的计算逻辑
 *
 * 演示原生调用 RN 纯逻辑方法的场景。
 * 实际项目中可能是：复杂的业务计算、数据格式化、规则引擎等。
 *
 * 原生调用方式：
 * CallRNModule.callRN("math", "add", { a: 1, b: 2 })
 */

interface CallParams {
  query: Record<string, any>;
  callback: (result: {type: string; data: any}) => void;
}

const mathModule = {
  /** 加法 */
  add: ({query, callback}: CallParams) => {
    const {a = 0, b = 0} = query;
    callback({
      type: 'success',
      data: {result: a + b, expression: `${a} + ${b} = ${a + b}`},
    });
  },

  /** 乘法 */
  multiply: ({query, callback}: CallParams) => {
    const {a = 0, b = 0} = query;
    callback({
      type: 'success',
      data: {result: a * b, expression: `${a} × ${b} = ${a * b}`},
    });
  },

  /** 阶乘（演示复杂计算） */
  factorial: ({query, callback}: CallParams) => {
    const {n = 0} = query;
    if (n < 0 || n > 20) {
      callback({
        type: 'error',
        data: {errCode: 'INVALID_INPUT', errMsg: 'n must be between 0 and 20'},
      });
      return;
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    callback({
      type: 'success',
      data: {result, expression: `${n}! = ${result}`},
    });
  },
};

export default mathModule;
