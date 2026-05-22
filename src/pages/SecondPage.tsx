/**
 * 独立注册的 RN 页面
 *
 * 通过 AppRegistry.registerComponent('SecondPage', ...) 独立注册。
 * 原生侧通过 componentName = "SecondPage" 直接加载，无需 RN 导航栈。
 *
 * 参数通过 initialProperties (Bundle) 传入，RN 通过 props 接收。
 * 参考 yp_rn_app 中每个 RN 页面对应一个原生 Activity 的设计。
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  NativeModules,
  Alert,
} from 'react-native';

const {HybridBridge} = NativeModules;

interface Props {
  /** 原生通过 initialProperties 传入的标题 */
  title?: string;
  /** 原生传入的业务 ID */
  itemId?: string;
  /** 页面实例 ID */
  instanceId?: string;
}

const SecondPage: React.FC<Props> = ({title, itemId, instanceId}) => {
  const [inputText, setInputText] = useState('');

  /** 关闭当前页面 */
  const handleClose = () => {
    HybridBridge?.closePage();
  };

  /** 关闭并返回数据给上一个页面 */
  const handleCloseWithResult = () => {
    if (!inputText.trim()) {
      Alert.alert('提示', '请输入内容');
      return;
    }
    HybridBridge?.closePageWithResult(JSON.stringify({
      input: inputText,
      from: 'SecondPage',
      timestamp: Date.now(),
    }));
  };

  /** 调用原生 Toast */
  const showNativeToast = () => {
    HybridBridge?.showToast('这是 RN 调用原生 Toast 的演示');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 独立 RN 页面</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>原生传入的参数（initialProperties）：</Text>
        <Text style={styles.infoText}>title: {title || '未传入'}</Text>
        <Text style={styles.infoText}>itemId: {itemId || '未传入'}</Text>
        <Text style={styles.infoText}>instanceId: {instanceId || '未传入'}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="输入要返回给原生的数据"
        value={inputText}
        onChangeText={setInputText}
      />

      <TouchableOpacity style={styles.button} onPress={showNativeToast}>
        <Text style={styles.btnText}>调用原生 Toast</Text>
        <Text style={styles.btnDesc}>RN → 原生方法调用</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleCloseWithResult}>
        <Text style={styles.btnText}>返回数据并关闭</Text>
        <Text style={styles.btnDesc}>setResult + finish（原生接收）</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.closeBtn]}
        onPress={handleClose}>
        <Text style={[styles.btnText, {color: '#fff'}]}>关闭页面</Text>
      </TouchableOpacity>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>💡 设计说明</Text>
        <Text style={styles.tipText}>
          1. 此页面通过 AppRegistry 独立注册，不依赖 React Navigation
        </Text>
        <Text style={styles.tipText}>
          2. 原生通过 RNContainerActivity.start("SecondPage", bundle) 加载
        </Text>
        <Text style={styles.tipText}>
          3. 参数通过 Bundle → initialProperties → props 传递
        </Text>
        <Text style={styles.tipText}>
          4. 每个 RN 页面 = 一个原生 Activity，生命周期由原生管理
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#f5f5f5'},
  title: {fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#333'},
  infoBox: {
    backgroundColor: '#fff3e0',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoLabel: {fontSize: 13, color: '#e65100', fontWeight: '600', marginBottom: 6},
  infoText: {fontSize: 14, color: '#333', marginBottom: 3},
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
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
  closeBtn: {backgroundColor: '#ff5722'},
  btnText: {fontSize: 15, fontWeight: '600', color: '#007AFF'},
  btnDesc: {fontSize: 12, color: '#999', marginTop: 3},
  tipBox: {
    backgroundColor: '#e3f2fd',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  tipTitle: {fontSize: 14, fontWeight: '600', color: '#1565c0', marginBottom: 8},
  tipText: {fontSize: 13, color: '#333', marginBottom: 4, lineHeight: 18},
});

export default SecondPage;
