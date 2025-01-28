let calculator = null;

class Calculator {
  constructor() {
    this.initializeElements();
    this.initializeButtons();
    this.bindEvents();
    this.initializeCustomCurrency();
    
    // 设置初始模式
    this.switchMode(this.modeSelect.value);
  }

  initializeElements() {
    this.display = document.getElementById('display');
    this.buttons = document.getElementById('buttons');
    this.modeSelect = document.getElementById('mode');
    this.calculatorContainer = document.getElementById('calculatorContainer');
    this.currencyContainer = document.getElementById('currencyContainer');
    
    // 汇率转换元素
    this.amountInput = document.getElementById('amount');
    this.fromCurrency = document.getElementById('fromCurrency');
    this.toCurrency = document.getElementById('toCurrency');
    this.convertBtn = document.getElementById('convertBtn');
    this.result = document.getElementById('result');
    
    // 自定义货币元素
    this.customSettings = document.getElementById('customCurrencySettings');
    this.customCode = document.getElementById('customCode');
    this.customRate = document.getElementById('customRate');
    this.saveCustomBtn = document.getElementById('saveCustomCurrency');
    
    // 添加长度转换元素
    this.lengthContainer = document.getElementById('lengthContainer');
    this.lengthInput = document.getElementById('lengthInput');
    this.fromLength = document.getElementById('fromLength');
    this.toLength = document.getElementById('toLength');
    this.convertLengthBtn = document.getElementById('convertLengthBtn');
    this.lengthResult = document.getElementById('lengthResult');
  }

  initializeButtons() {
    const buttons = [
      'C', '←', '%', '/',
      '7', '8', '9', '*',
      '4', '5', '6', '-',
      '1', '2', '3', '+',
      '00', '0', '.', '='
    ];

    this.buttons.innerHTML = buttons
      .map(btn => `<button data-value="${btn}">${btn}</button>`)
      .join('');
  }

  initializeCustomCurrency() {
    // 复制选项到 toCurrency
    this.toCurrency.innerHTML = this.fromCurrency.innerHTML;
    
    // 加载保存的自定义货币
    const savedCurrencies = JSON.parse(localStorage.getItem('customCurrencies') || '{}');
    Object.entries(savedCurrencies).forEach(([code, rate]) => {
      this.addCustomCurrencyOption(code, rate);
    });
  }

  bindEvents() {
    this.buttons.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        this.handleButtonClick(e.target.dataset.value);
      }
    });

    // 修改键盘支持，只在计算器模式下生效
    document.addEventListener('keydown', (e) => {
      if (this.modeSelect.value === 'calculator') {  // 只在计算器模式下处理键盘事件
        const key = e.key;
        if (/[\d+\-*/.%]|Enter|Backspace|Delete|=/.test(key)) {
          e.preventDefault();
          let value = key;
          if (key === 'Enter' || key === '=') value = '=';
          if (key === 'Backspace' || key === 'Delete') value = '←';
          this.handleButtonClick(value);
        }
      }
    });

    // 添加模式切换事件
    this.modeSelect.addEventListener('change', () => {
      this.switchMode(this.modeSelect.value);
    });

    // 修改汇率转换事件
    this.amountInput.addEventListener('keypress', (e) => {
      // 只允许数字和小数点
      if (!/[\d.]/.test(e.key)) {
        e.preventDefault();
      }
      
      // 防止多个小数点
      if (e.key === '.' && e.target.value.includes('.')) {
        e.preventDefault();
      }
    });

    this.amountInput.addEventListener('paste', (e) => {
      e.preventDefault();
      // 获取剪贴板数据
      const text = (e.clipboardData || window.clipboardData).getData('text');
      // 只保留数字和第一个小数点
      const cleaned = text.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
      // 插入清理后的数据
      this.amountInput.value = cleaned;
      this.convertCurrency();
    });

    this.amountInput.addEventListener('input', () => {
      // 清理非法字符
      let value = this.amountInput.value;
      value = value.replace(/[^\d.]/g, '');
      value = value.replace(/(\..*)\./g, '$1');
      this.amountInput.value = value;
      
      if (value) {
        this.convertCurrency();
      }
    });

    this.fromCurrency.addEventListener('change', () => {
      this.customSettings.style.display = 
        this.fromCurrency.value === 'custom' ? 'block' : 'none';
      this.convertCurrency();
    });

    this.toCurrency.addEventListener('change', () => {
      this.convertCurrency();
    });

    this.convertBtn.addEventListener('click', () => {
      this.convertCurrency();
    });

    // 自定义货币相关事件
    this.saveCustomBtn.addEventListener('click', () => {
      this.saveCustomCurrency();
    });

    // 添加长度转换事件
    this.lengthInput.addEventListener('keypress', (e) => {
      // 只允许数字和小数点
      if (!/[\d.]/.test(e.key)) {
        e.preventDefault();
      }
      
      // 防止多个小数点
      if (e.key === '.' && e.target.value.includes('.')) {
        e.preventDefault();
      }
    });

    this.lengthInput.addEventListener('input', () => {
      // 清理非法字符
      let value = this.lengthInput.value;
      value = value.replace(/[^\d.]/g, '');
      value = value.replace(/(\..*)\./g, '$1');
      this.lengthInput.value = value;
      
      if (value) {
        this.convertLength();
      }
    });

    this.fromLength.addEventListener('change', () => {
      this.convertLength();
    });

    this.toLength.addEventListener('change', () => {
      this.convertLength();
    });

    this.convertLengthBtn.addEventListener('click', () => {
      this.convertLength();
    });
  }

  handleButtonClick(value) {
    switch(value) {
      case 'C':
        this.display.value = '';
        break;
      case '←':
        this.display.value = this.display.value.slice(0, -1);
        break;
      case '=':
        try {
          this.display.value = window.calculator.calculate(this.display.value);
        } catch(e) {
          this.display.value = 'Error';
        }
        break;
      case '%':
        try {
          const currentValue = parseFloat(this.display.value);
          this.display.value = currentValue / 100;
        } catch(e) {
          this.display.value = 'Error';
        }
        break;
      default:
        this.display.value += value;
    }
  }

  switchMode(mode) {
    this.calculatorContainer.style.display = 'none';
    this.currencyContainer.style.display = 'none';
    this.lengthContainer.style.display = 'none';

    switch(mode) {
      case 'calculator':
        this.calculatorContainer.style.display = 'block';
        break;
      case 'currency':
        this.currencyContainer.style.display = 'block';
        this.amountInput.value = '';
        this.result.textContent = '';
        break;
      case 'length':
        this.lengthContainer.style.display = 'block';
        this.lengthInput.value = '';
        this.lengthResult.textContent = '';
        break;
    }
  }

  async convertCurrency() {
    const amount = parseFloat(this.amountInput.value) || 0;
    const from = this.fromCurrency.value;
    const to = this.toCurrency.value;

    try {
      const result = await window.calculator.currency.convert(amount, from, to);
      const lastUpdate = window.calculator.currency.getLastUpdateTime();
      
      // 格式化数字：添加千分位并保留4位小数
      const formatNumber = (num) => {
        return num.toLocaleString('zh-CN', {
          minimumFractionDigits: 4,
          maximumFractionDigits: 4
        });
      };

      this.result.innerHTML = `
        ${formatNumber(amount)} ${from} = ${formatNumber(result)} ${to}
        <div style="font-size: 12px; color: #666; margin-top: 5px;">
          汇率更新时间: ${lastUpdate}
        </div>
      `;
    } catch (error) {
      this.result.textContent = '转换失败';
    }
  }

  saveCustomCurrency() {
    const code = this.customCode.value.toUpperCase();
    const rate = parseFloat(this.customRate.value);

    if (!code || !rate) {
      alert('请输入有效的货币代码和汇率');
      return;
    }

    // 保存到 localStorage
    const savedCurrencies = JSON.parse(localStorage.getItem('customCurrencies') || '{}');
    savedCurrencies[code] = rate;
    localStorage.setItem('customCurrencies', JSON.stringify(savedCurrencies));

    // 添加到选项列表
    this.addCustomCurrencyOption(code, rate);

    // 清空输入
    this.customCode.value = '';
    this.customRate.value = '';
    this.customSettings.style.display = 'none';
    this.fromCurrency.value = code;

    // 更新汇率数据
    window.calculator.currency.addCustomRate(code, rate);
  }

  addCustomCurrencyOption(code, rate) {
    const option = `<option value="${code}">${code} (自定义)</option>`;
    
    // 添加到两个选择框
    if (!this.fromCurrency.querySelector(`option[value="${code}"]`)) {
      this.fromCurrency.insertAdjacentHTML('beforeend', option);
      this.toCurrency.insertAdjacentHTML('beforeend', option);
    }
  }

  convertLength() {
    const value = parseFloat(this.lengthInput.value) || 0;
    const from = this.fromLength.value;
    const to = this.toLength.value;

    try {
      const result = window.calculator.converter.length.convert(value, from, to);
      
      // 格式化数字：添加千分位，保留有效数字
      const formatNumber = (num) => {
        // 如果是整数，直接返回
        if (Number.isInteger(num)) {
          return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        // 对于小数，保留输入值的有效位数
        const inputDecimals = (value.toString().split('.')[1] || '').length;
        const formatted = num.toFixed(inputDecimals);
        const [integer, decimal] = formatted.split('.');
        
        // 给整数部分添加千分位
        const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        // 如果有小数部分，则添加回去
        return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
      };

      this.lengthResult.textContent = `${formatNumber(value)} ${from} = ${formatNumber(result)} ${to}`;
    } catch (error) {
      this.lengthResult.textContent = '转换失败';
    }
  }
}

// 直接初始化计算器
document.addEventListener('DOMContentLoaded', () => {
  calculator = new Calculator();
}); 