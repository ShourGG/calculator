class CurrencyConverter {
  constructor(calculator) {
    this.calculator = calculator;
    this.input1 = document.getElementById('currencyInput1');
    this.input2 = document.getElementById('currencyInput2');
    this.unit1 = document.getElementById('currencyUnit1');
    this.unit2 = document.getElementById('currencyUnit2');
    
    // 初始化 miniCalculator
    this.miniCalc = new MiniCalculator(this.input1, document.getElementById('currencyCalculator'));
    
    // 复制单位选项
    this.unit2.innerHTML = this.unit1.innerHTML;
    
    // 绑定事件
    this.input1.addEventListener('input', () => {
      const value = this.input1.getAttribute('data-value') || this.input1.value;
      if (value) {
        const result = this.convert(value, this.unit1.value, this.unit2.value);
        this.input2.value = result;
        this.input2.setAttribute('data-value', result);
      }
    });

    this.input2.addEventListener('input', () => {
      const value = this.input2.getAttribute('data-value') || this.input2.value;
      if (value) {
        const result = this.convert(value, this.unit2.value, this.unit1.value);
        this.input1.value = result;
        this.input1.setAttribute('data-value', result);
      }
    });

    // 监听点击事件
    this.input2.addEventListener('click', () => {
      this.miniCalc.currentInput = this.input2;
      this.miniCalc.displayValue = this.input2.value;
      this.miniCalc.expression = this.input2.value;
    });

    // 监听单位变化
    [this.unit1, this.unit2].forEach(select => {
      select.addEventListener('change', () => {
        const value = this.input1.getAttribute('data-value') || this.input1.value;
        if (value) {
          const result = this.convert(value, this.unit1.value, this.unit2.value);
          this.input2.value = result;
          this.input2.setAttribute('data-value', result);
        }
      });
    });
  }

  convert(value, fromCurrency, toCurrency) {
    if (!value) return '';
    try {
      const rates = this.calculator.currency.rates;
      if (!rates) return 'Loading...';
      
      // 先转换为CNY
      const cny = parseFloat(value) / rates[fromCurrency];
      // 再从CNY转换为目标货币
      const result = cny * rates[toCurrency];
      
      return this.formatNumber(result);
    } catch(e) {
      console.error('Conversion error:', e);
      return 'Error';
    }
  }

  formatNumber(num) {
    if (Math.abs(num) >= 1e6 || Math.abs(num) < 0.001) {
      return num.toPrecision(6);
    } else {
      return num.toLocaleString('zh-CN', {
        maximumFractionDigits: 4,
        minimumFractionDigits: 0
      });
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new CurrencyConverter();
}); 