/**
 * RN 主应用入口
 *
 * 原生加载 "MainApp" 组件时进入此页面。
 * 演示：页面跳转、原生通信、数据持久化、热更新状态展示。
 */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

// 获取原生模块
const {HybridBridge, CallRNModule} = NativeModules;
const eventEmitter = HybridBridge
  ? new NativeEventEmitter(HybridBridge)
  : null;

const App: React.FC<{instanceId?: string; viewName?: string}> = (props) => {
  const [nativeMessage, setNativeMessage] = useState('等待原生消息...');
  const [deviceInfo, setDeviceInfo] = useState('');
  const [storageData, setStorageData] = useState('');
  const [bundleInfo, setBundleInfo] = useState('');

  useEffect(() => {
    // 监听原生事件
    const listeners: any[] = [];

    if (eventEmitter) {
      // 监听原生页面返回结果
      listeners.push(
        eventEmitter.addListener('onPageResult', (data: any) => {
          setNativeMessage(`收到原生返回: ${JSON.stringify(data)}`);
        }),
      );

      // 监听登录状态变化
      listeners.push(
        eventEmitter.addListener('onLoginStateChanged', (data: any) => {
          const msg = data.isLoggedIn
            ? `用户已登录: ${data.userId}`
            : '用户已登出';
          setNativeMessage(msg);
        }),
      );

      // 监听数据刷新通知
      listeners.push(
        eventEmitter.addListener('onRefreshData', (data: any) => {
          setNativeMessage(`收到刷新通知: ${data.reason || ''}`);
        }),
      );
    }

    // 获取 Bundle 信息（演示热更新状态）
    getBundleInfo();

    return () => {
      listeners.forEach(l => l.remove());
    };
  }, []);

  /** 跳转到原生详情页 */
  const goToNativePage = () => {
    HybridBridge?.openNativePage('NativeDetailPage', {
      title: '从RN跳转过来',
      id: '12345',
      timestamp: String(Date.now()),
    });
  };

  /** 跳转到原生页面并等待返回结果 */
  const goToNativeForResult = async () => {
    try {
      const result = await HybridBridge?.openNativePageForResult(
        'NativeInputPage',
        {hint: '请输入内容'},
      );
      Alert.alert('原生返回结果', JSON.stringify(result));
    } catch (e: any) {
      Alert.alert('取消', e.message || '用户取消操作');
    }
  };

  /** 打开新的 RN 页面（原生新开 Activity 承载） */
  const openNewRNPage = () => {
    HybridBridge?.openRNPage('SecondPage', {
      title: '从RN首页跳转',
      itemId: 'ITEM_002',
    });
  };

  /** 打开新的 RN 页面并等待返回数据 */
  const openRNPageForResult = async () => {
    try {
      const result = await HybridBridge?.openRNPageForResult('SecondPage', {
        title: '等待返回数据',
        itemId: 'ITEM_003',
      });
      console.log('result =====>>>> ', result);
      // 延迟弹窗，等待 Activity 完全恢复前台后再显示 Alert
      setTimeout(() => {
        Alert.alert('RN 页面返回结果', result || '(空)');
      }, 300);
    } catch (e: any) {
      setTimeout(() => {
        Alert.alert('取消', e.message || '页面取消');
      }, 300);
    }
  };

  /** 获取设备信息 */
  const fetchDeviceInfo = async () => {
    try {
      const info = await HybridBridge?.getDeviceInfo();
      setDeviceInfo(
        `型号: ${info.model}\n系统: ${info.systemVersion}\nApp: ${info.appVersion}`,
      );
    } catch (e) {
      setDeviceInfo('获取失败');
    }
  };

  /** 保存数据到原生存储 */
  const saveData = async () => {
    try {
      await HybridBridge?.saveData('rn_test_key', `RN写入_${Date.now()}`);
      Alert.alert('成功', '数据已保存到原生 MMKV/SharedPreferences');
    } catch (e: any) {
      Alert.alert('失败', e.message);
    }
  };

  /** 从原生存储读取数据 */
  const readData = async () => {
    try {
      const value = await HybridBridge?.getData('rn_test_key');
      setStorageData(value || '(空)');
    } catch (e) {
      setStorageData('读取失败');
    }
  };

  /** 获取 Bundle 信息 */
  const getBundleInfo = async () => {
    try {
      const info = await HybridBridge?.getBundleInfo();
      if (info) {
        setBundleInfo(
          `版本: ${info.version}\n来源: ${info.source}\n更新时间: ${info.updateTime || '无'}`,
        );
      }
    } catch (e) {
      setBundleInfo('获取失败');
    }
  };

  /** 检查热更新 */
  const checkUpdate = async () => {
    try {
      const result = await HybridBridge?.checkHotUpdate();
      Alert.alert('热更新检查', result?.message || '当前已是最新版本');
    } catch (e: any) {
      Alert.alert('检查失败', e.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🚀 混合开发 Demo</Text>
      <Text style={styles.subHeader}>
        instanceId: {props.instanceId || 'N/A'}
      </Text>

      {/* 页面跳转 */}
      <Text style={styles.sectionTitle}>📱 页面跳转</Text>

      <TouchableOpacity style={styles.button} onPress={goToNativePage}>
        <Text style={styles.btnText}>RN → 原生页面</Text>
        <Text style={styles.btnDesc}>通过 NativeModule 调用原生路由</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={goToNativeForResult}>
        <Text style={styles.btnText}>RN → 原生页面（等待返回值）</Text>
        <Text style={styles.btnDesc}>类似 startActivityForResult</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={openNewRNPage}>
        <Text style={styles.btnText}>RN → 新 RN 页面</Text>
        <Text style={styles.btnDesc}>原生新开 Activity 承载另一个 RN 组件</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={openRNPageForResult}>
        <Text style={styles.btnText}>RN → 新 RN 页面（等待返回值）</Text>
        <Text style={styles.btnDesc}>startActivityForResult + Promise，await 获取结果</Text>
      </TouchableOpacity>

      {/* 原生通信 */}
      <Text style={styles.sectionTitle}>📡 原生 ↔ RN 通信</Text>

      <View style={styles.msgBox}>
        <Text style={styles.msgLabel}>原生事件消息：</Text>
        <Text style={styles.msgText}>{nativeMessage}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={fetchDeviceInfo}>
        <Text style={styles.btnText}>RN 调用原生方法</Text>
        <Text style={styles.btnDesc}>获取设备信息（Promise 返回）</Text>
      </TouchableOpacity>

      {deviceInfo ? (
        <View style={styles.msgBox}>
          <Text style={styles.msgText}>{deviceInfo}</Text>
        </View>
      ) : null}

      {/* 数据持久化 */}
      <Text style={styles.sectionTitle}>💾 数据持久化</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.halfBtn} onPress={saveData}>
          <Text style={styles.btnText}>写入</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.halfBtn} onPress={readData}>
          <Text style={styles.btnText}>读取</Text>
        </TouchableOpacity>
      </View>

      {storageData ? (
        <View style={styles.msgBox}>
          <Text style={styles.msgLabel}>存储数据：</Text>
          <Text style={styles.msgText}>{storageData}</Text>
        </View>
      ) : null}

      {/* 热更新 */}
      <Text style={styles.sectionTitle}>🔥 热更新</Text>

      {bundleInfo ? (
        <View style={styles.msgBox}>
          <Text style={styles.msgLabel}>当前 Bundle 信息：</Text>
          <Text style={styles.msgText}>{bundleInfo}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={checkUpdate}>
        <Text style={styles.btnText}>检查热更新</Text>
        <Text style={styles.btnDesc}>模拟 CodePush 检查更新流程</Text>
      </TouchableOpacity>

      <View style={{height: 40}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#f5f5f5'},
  header: {fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4},
  subHeader: {fontSize: 12, color: '#999', marginBottom: 16},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  btnText: {fontSize: 15, fontWeight: '600', color: '#007AFF'},
  btnDesc: {fontSize: 12, color: '#999', marginTop: 3},
  msgBox: {
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  msgLabel: {fontSize: 12, color: '#666', marginBottom: 4},
  msgText: {fontSize: 14, color: '#333'},
  row: {flexDirection: 'row', gap: 10, marginBottom: 10},
  halfBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default App;
