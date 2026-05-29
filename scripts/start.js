#!/usr/bin/env node
/**
 * RN 开发工具菜单
 *
 * 执行 yarn start 触发交互式菜单，提供：
 * 1. 调试：开启 Metro 服务（可自定义端口）
 * 2. 端口映射：执行 adb reverse 命令
 * 3. 打包 bundle：生成离线 bundle 并复制到原生 assets
 */
const { execSync, spawn } = require('child_process');
const readline = require('readline');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ANDROID_ASSETS_PATH = path.resolve(__dirname, '../../android_host/app/src/main/assets');
const OUTPUT_PATH = path.resolve(__dirname, '../output');
const DEFAULT_PORT = 8081;

/**
 * 获取本机局域网 IP 地址
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过 IPv6 和回环地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// 颜色输出
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

function createRL() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function main() {
  const rl = createRL();

  console.log('');
  console.log(colors.bold('═══════════════════════════════════════'));
  console.log(colors.bold('   🚀 RN 开发工具菜单'));
  console.log(colors.bold('═══════════════════════════════════════'));
  console.log('');
  console.log(`  ${colors.cyan('1.')} 调试 - 开启 Metro 服务`);
  console.log(`  ${colors.cyan('2.')} 端口映射 - adb reverse`);
  console.log(`  ${colors.cyan('3.')} 打包 bundle`);
  console.log(`  ${colors.cyan('4.')} 打包并部署到原生 assets`);
  console.log(`  ${colors.cyan('0.')} 退出`);
  console.log('');

  const choice = await ask(rl, colors.yellow('请选择功能 [1-4]: '));

  switch (choice) {
    case '1':
      await startMetro(rl);
      break;
    case '2':
      await adbReverse(rl);
      break;
    case '3':
      await bundleOnly(rl);
      break;
    case '4':
      await bundleAndDeploy(rl);
      break;
    case '0':
      console.log('👋 再见');
      break;
    default:
      console.log(colors.red('无效选择'));
  }

  rl.close();
}

/**
 * 功能1：开启 Metro 服务
 */
async function startMetro(rl) {
  const portInput = await ask(rl, colors.yellow(`请输入端口号 (默认 ${DEFAULT_PORT}): `));
  const port = portInput ? parseInt(portInput, 10) : DEFAULT_PORT;

  if (isNaN(port) || port < 1024 || port > 65535) {
    console.log(colors.red('❌ 无效端口号，请输入 1024-65535 之间的数字'));
    return;
  }

  const localIP = getLocalIP();

  console.log('');
  console.log(colors.green('═══════════════════════════════════════'));
  console.log(colors.green(`  ✅ Metro 服务即将启动`));
  console.log(colors.green(`  📡 调试地址: ${localIP}:${port}`));
  console.log(colors.green(`  📡 本机地址: localhost:${port}`));
  console.log(colors.green('═══════════════════════════════════════'));
  console.log('');
  console.log(colors.cyan('  连接方式:'));
  console.log(`  • 模拟器: 自动连接 localhost:${port}`);
  console.log(`  • 真机USB: adb reverse tcp:${port} tcp:${port}`);
  console.log(`  • 真机WiFi: Dev Menu → Settings → 输入 ${localIP}:${port}`);
  console.log('');
  console.log(colors.yellow('  按 Ctrl+C 停止服务'));
  console.log('');

  rl.close();

  // 启动 Metro（替换当前进程）
  const metro = spawn('npx', ['react-native', 'start', '--port', String(port)], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });

  metro.on('error', (err) => {
    console.log(colors.red(`❌ 启动失败: ${err.message}`));
  });
}

/**
 * 功能2：端口映射
 */
async function adbReverse(rl) {
  const port = DEFAULT_PORT;

  console.log('');
  console.log(colors.cyan(`  执行: adb reverse tcp:${port} tcp:${port}`));

  try {
    execSync(`adb reverse tcp:${port} tcp:${port}`, { encoding: 'utf-8' });
    console.log(colors.green(`  ✅ 端口映射成功！设备 localhost:${port} → 电脑 localhost:${port}`));
    console.log('');

    // 显示当前所有映射
    console.log(colors.cyan('  当前所有端口映射:'));
    const list = execSync('adb reverse --list', { encoding: 'utf-8' });
    console.log(`  ${list || '(无)'}`);
  } catch (err) {
    console.log(colors.red(`  ❌ 执行失败: ${err.message}`));
    console.log(colors.yellow('  请确保:'));
    console.log('  • adb 已安装并在 PATH 中');
    console.log('  • 设备已通过 USB 连接并开启调试模式');
  }
}

/**
 * 功能3：打包 bundle
 */
async function bundleOnly(rl) {
  console.log('');
  console.log(colors.cyan('  📦 开始打包 Android Bundle...'));
  console.log('');

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }

  try {
    execSync(
      'npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output ./output/index.android.bundle --assets-dest ./output/res --reset-cache',
      { stdio: 'inherit', cwd: path.resolve(__dirname, '..') }
    );

    const bundlePath = path.resolve(OUTPUT_PATH, 'index.android.bundle');
    const stats = fs.statSync(bundlePath);
    const sizeKB = (stats.size / 1024).toFixed(1);

    console.log('');
    console.log(colors.green('  ✅ 打包成功！'));
    console.log(`  📄 输出: ${bundlePath}`);
    console.log(`  📏 大小: ${sizeKB} KB`);
  } catch (err) {
    console.log(colors.red('  ❌ 打包失败'));
  }
}

/**
 * 功能4：打包并部署到原生 assets
 */
async function bundleAndDeploy(rl) {
  await bundleOnly(rl);

  console.log('');
  console.log(colors.cyan('  🚀 部署到原生 assets...'));

  // 确保 assets 目录存在
  if (!fs.existsSync(ANDROID_ASSETS_PATH)) {
    fs.mkdirSync(ANDROID_ASSETS_PATH, { recursive: true });
  }

  const src = path.resolve(OUTPUT_PATH, 'index.android.bundle');
  const dest = path.resolve(ANDROID_ASSETS_PATH, 'index.android.bundle');

  if (!fs.existsSync(src)) {
    console.log(colors.red('  ❌ Bundle 文件不存在，打包可能失败'));
    return;
  }

  fs.copyFileSync(src, dest);
  console.log(colors.green(`  ✅ 已部署到: ${dest}`));
  console.log('');
  console.log(colors.yellow('  下一步: 在 Android Studio 中重新运行 App'));
}

main().catch((err) => {
  console.error(colors.red(`错误: ${err.message}`));
  process.exit(1);
});
