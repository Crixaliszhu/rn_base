/**
 * 第二个 RN 页面
 *
 * 原生通过 viewName="SecondPage" 加载此页面。
 * 演示：接收参数、返回数据、调用原生方法。
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
  title?: string;
  itemId?: string;
  instanceId?: string;
  viewName?: string;
}

const SecondPage: React.FC<Props> = ({title, itemId, instanceId, viewName}) => {
  const [inputText, setInputText] = useState('');

  const handleClose = () => {
    HybridBridge?.closePage();
  };

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

  const showNativeToast = () => {
    HybridBridge?.showToast('这是 RN 调用原生 Toast');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 SecondPage</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>原生传入的参数（通过 props）：</Text>
        <Text style={styles.infoText}>viewName: {viewName}</Text>
        <Text style={styles.infoText}>title: {title || '未传入'}</Text>
        <Text style={styles.infoText}>itemId: {itemId || '未传入'}</Text>
        <Text style={styles.infoText}>instanceId: {instanceId || '未传入'}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="输入要返回给上一页的数据"
        value={inputText}
        onChangeText={setInputText}
      />

      <TouchableOpacity style={styles.button} onPress={showNativeToast}>
        <Text style={styles.btnText}>调用原生 Toast</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleCloseWithResult}>
        <Text style={styles.btnText}>返回数据并关闭</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.closeBtn]} onPress={handleClose}>
        <Text style={[styles.btnText, {color: '#fff'}]}>关闭页面</Text>
      </TouchableOpacity>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>💡 单组件模式说明</Text>
        <Text style={styles.tipText}>
          原生加载的组件名始终是 "HybridDemoRN"，{'\n'}
          通过 viewName="SecondPage" 路由到此页面。{'\n'}
          App.tsx 中的 PAGE_REGISTRY 负责映射。
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#f5f5f5'},
  title: {fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#333'},
  infoBox: {backgroundColor: '#fff3e0', padding: 14, borderRadius: 8, marginBottom: 16},
  infoLabel: {fontSize: 13, color: '#e65100', fontWeight: '600', marginBottom: 6},
  infoText: {fontSize: 14, color: '#333', marginBottom: 3},
  input: {backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16},
  button: {backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10, elevation: 2},
  closeBtn: {backgroundColor: '#ff5722'},
  btnText: {fontSize: 15, fontWeight: '600', color: '#007AFF'},
  tipBox: {backgroundColor: '#e3f2fd', padding: 14, borderRadius: 8, marginTop: 16},
  tipTitle: {fontSize: 14, fontWeight: '600', color: '#1565c0', marginBottom: 8},
  tipText: {fontSize: 13, color: '#333', lineHeight: 20},
});

export default SecondPage;
