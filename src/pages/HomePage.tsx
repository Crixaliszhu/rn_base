/**
 * RN 首页
 *
 * 演示：页面跳转、原生通信、数据持久化、热更新状态展示。
 */
import React, {useEffect, useState} from 'react';
import {Alert, NativeModules, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {NativeEvent, useNativeEvent, useNativeEvents} from '@/native/events';

const {HybridBridge} = NativeModules;

interface Props {
    viewName?: string;
    instanceId?: string;
}

const HomePage: React.FC<Props> = (props) => {
    const [nativeMessage, setNativeMessage] = useState('等待原生消息...');
    const [deviceInfo, setDeviceInfo] = useState('');
    const [storageData, setStorageData] = useState('');
    const [bundleInfo, setBundleInfo] = useState('');

    useEffect(() => {
        getBundleInfo();
    }, []);

    // 使用公共事件 Hook 监听原生事件
    useNativeEvents([
        {
            event: NativeEvent.LOGIN_STATE_CHANGED,
            handler: (data) => {
                const msg = data.isLoggedIn ? `用户已登录: ${data.userId}` : '用户已登出';
                setNativeMessage(msg);
            },
        },
        {
            event: NativeEvent.REFRESH_DATA,
            handler: (data) => setNativeMessage(`收到刷新通知: ${data.reason || ''}`),
        },
    ]);

    useNativeEvent(
        NativeEvent.PAGE_RESULT,
        (data) => setNativeMessage(`收到原生返回: ${JSON.stringify(data)}`),
    )

    const goToNativePage = () => {
        HybridBridge?.openNativePage('NativeDetailPage', {
            title: '从RN跳转过来', id: '12345', timestamp: String(Date.now()),
        });
    };

    const goToNativeForResult = async () => {
        try {
            const result = await HybridBridge?.openNativePageForResult('NativeInputPage', {hint: '请输入内容'});
            setTimeout(() => Alert.alert('原生返回结果', JSON.stringify(result)), 300);
        } catch (e: any) {
            setTimeout(() => Alert.alert('取消', e.message || '用户取消操作'), 300);
        }
    };

    /** 打开新 RN 页面（不等待返回值） */
    const openNewRNPage = () => {
        HybridBridge?.openRNPage('SecondPage', {title: '从首页跳转', itemId: 'ITEM_002'});
    };

    /** 打开新 RN 页面并等待返回数据 */
    const openRNPageForResult = async () => {
        try {
            const result = await HybridBridge?.openRNPageForResult('SecondPage', {
                title: '等待返回数据', itemId: 'ITEM_003',
            });
            console.log('result =====>>>> ', result);
            setTimeout(() => Alert.alert('RN 页面返回结果', result || '(空)'), 300);
        } catch (e: any) {
            setTimeout(() => Alert.alert('取消', e.message || '页面取消'), 300);
        }
    };

    const fetchDeviceInfo = async () => {
        try {
            const info = await HybridBridge?.getDeviceInfo();
            setDeviceInfo(`型号: ${info.model}\n系统: ${info.systemVersion}\nApp: ${info.appVersion}`);
        } catch (e) {
            setDeviceInfo('获取失败');
        }
    };

    /** 测试：触发原生发送事件给当前 RN 页面 */
    const testNativeEvent = () => {
        console.log('[HomePage] 调用 triggerNativeEvent');
        HybridBridge?.triggerTestEvent('onLoginStateChanged');
    };

    const saveData = async () => {
        try {
            await HybridBridge?.saveData('rn_test_key', `RN写入_${Date.now()}`);
            Alert.alert('成功', '数据已保存到原生存储');
        } catch (e: any) {
            Alert.alert('失败', e.message);
        }
    };

    const readData = async () => {
        try {
            const value = await HybridBridge?.getData('rn_test_key');
            setStorageData(value || '(空)');
        } catch (e) {
            setStorageData('读取失败');
        }
    };

    const getBundleInfo = async () => {
        try {
            const info = await HybridBridge?.getBundleInfo();
            if (info) setBundleInfo(`版本: ${info.version}\n来源: ${info.source}\n更新: ${info.updateTime || '无'}`);
        } catch (e) {
            setBundleInfo('获取失败');
        }
    };

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
            <Text style={styles.header}>🚀 混合开发 Demo（单组件模式）</Text>
            <Text style={styles.subHeader}>viewName: {props.viewName} | instanceId: {props.instanceId || 'N/A'}</Text>

            <Text style={styles.sectionTitle}>📱 页面跳转</Text>
            <TouchableOpacity style={styles.button} onPress={goToNativePage}>
                <Text style={styles.btnText}>RN → 原生页面</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={goToNativeForResult}>
                <Text style={styles.btnText}>RN → 原生页面（等待返回值）</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={openNewRNPage}>
                <Text style={styles.btnText}>RN → 新 RN 页面</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={openRNPageForResult}>
                <Text style={styles.btnText}>RN → 新 RN 页面（等待返回值）</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>📡 原生 ↔ RN 通信</Text>
            <View style={styles.msgBox}>
                <Text style={styles.msgLabel}>原生事件消息：</Text>
                <Text style={styles.msgText}>{nativeMessage}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={testNativeEvent}>
                <Text style={styles.btnText}>测试：触发原生发送事件</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={fetchDeviceInfo}>
                <Text style={styles.btnText}>获取设备信息</Text>
            </TouchableOpacity>
            {deviceInfo ? <View style={styles.msgBox}><Text style={styles.msgText}>{deviceInfo}</Text></View> : null}

            <Text style={styles.sectionTitle}>💾 数据持久化</Text>
            <View style={styles.row}>
                <TouchableOpacity style={styles.halfBtn} onPress={saveData}><Text
                    style={styles.btnText}>写入</Text></TouchableOpacity>
                <TouchableOpacity style={styles.halfBtn} onPress={readData}><Text
                    style={styles.btnText}>读取</Text></TouchableOpacity>
            </View>
            {storageData ? <View style={styles.msgBox}><Text style={styles.msgText}>{storageData}</Text></View> : null}

            <Text style={styles.sectionTitle}>🔥 热更新</Text>
            {bundleInfo ? <View style={styles.msgBox}><Text style={styles.msgText}>{bundleInfo}</Text></View> : null}
            <TouchableOpacity style={styles.button} onPress={checkUpdate}>
                <Text style={styles.btnText}>检查热更新</Text>
            </TouchableOpacity>
            <View style={{height: 40}}/>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, padding: 16, backgroundColor: '#f5f5f5'},
    header: {fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4},
    subHeader: {fontSize: 11, color: '#999', marginBottom: 16},
    sectionTitle: {fontSize: 16, fontWeight: '600', marginTop: 18, marginBottom: 8, color: '#333'},
    button: {backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 8, elevation: 2},
    btnText: {fontSize: 15, fontWeight: '600', color: '#007AFF'},
    msgBox: {backgroundColor: '#e8f4fd', padding: 10, borderRadius: 8, marginBottom: 8},
    msgLabel: {fontSize: 11, color: '#666', marginBottom: 3},
    msgText: {fontSize: 13, color: '#333'},
    row: {flexDirection: 'row', gap: 10, marginBottom: 8},
    halfBtn: {flex: 1, backgroundColor: '#4CAF50', padding: 14, borderRadius: 8, alignItems: 'center'},
});

export default HomePage;
