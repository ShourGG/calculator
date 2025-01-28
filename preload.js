// 添加调试日志
console.log('preload.js loading...');

// 设置窗口大小
if (typeof utools !== 'undefined') {
  console.log('Setting window size...');
  utools.onPluginReady(() => {
    // 等待 DOM 加载完成后再获取尺寸
    setTimeout(() => {
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      console.log('Window width:', width);
      console.log('Window height:', height);
    }, 100);
    utools.setExpendHeight(565);
  });
}

// 添加错误日志收集
window.errorLogs = [];

// 捕获全局错误
window.onerror = function(message, source, lineno, colno, error) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: message,
    source: source,
    line: lineno,
    column: colno,
    stack: error?.stack,
    userAgent: navigator.userAgent
  };
  window.errorLogs.push(errorLog);
  return false;
};

// 捕获未处理的 Promise 错误
window.addEventListener('unhandledrejection', function(event) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    type: 'UnhandledPromiseRejection',
    message: event.reason?.message || event.reason,
    stack: event.reason?.stack,
    userAgent: navigator.userAgent
  };
  window.errorLogs.push(errorLog);
});

// 基础计算功能
window.calculator = {
  calculate(expression) {
    try {
      expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
      if (!expression) return '';
      let result = Function('return ' + expression)();
      return parseFloat(result.toFixed(8));
    } catch(e) {
      throw new Error('计算错误');
    }
  },

  // 恢复转换器组件
  converter: {
    // 长度转换
    length: {
      units: {
        // 公制单位
        'm': 1,          // 米（基准单位）
        'km': 0.001,     // 千米
        'dm': 10,        // 分米
        'cm': 100,       // 厘米
        'mm': 1000,      // 毫米
        'μm': 1000000,   // 微米
        'nm': 1e9,       // 纳米
        'pm': 1e12,      // 皮米
        
        // 英制单位
        'mile': 0.000621371, // 英里
        'yard': 1.09361,     // 码
        'foot': 3.28084,     // 英尺
        'inch': 39.3701,     // 英寸
        
        // 中国传统单位
        'li': 0.002,         // 里
        'zhang': 0.3,        // 丈
        'chi': 3,            // 尺
        'cun': 30,           // 寸
      }
    },
    // 重量转换
    weight: {
      units: {
        'g': 1,          // 克（基准单位）
        'kg': 0.001,     // 千克
        'mg': 1000,      // 毫克
        // ... 其他单位 ...
      }
    },
    // 面积转换
    area: {
      units: {
        'm2': 1,         // 平方米（基准单位）
        'km2': 0.000001, // 平方千米
        // ... 其他单位 ...
      }
    }
  },

  // 汇率转换
  currency: {
    rates: null,
    async updateRates() {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/CNY');
        const data = await response.json();
        this.rates = data.rates;
      } catch(e) {
        console.error('Failed to update rates:', e);
      }
    }
  }
};

// 初始化时更新汇率
window.calculator.currency.updateRates();

console.log('preload.js loaded, window.calculator initialized'); 