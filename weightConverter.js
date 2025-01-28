class WeightConverter {
  constructor(calculator) {
    this.calculator = calculator;
    this.input1 = document.getElementById('weightInput1');
    this.input2 = document.getElementById('weightInput2');
    this.unit1 = document.getElementById('weightUnit1');
    this.unit2 = document.getElementById('weightUnit2');
    
    // 初始化 miniCalculator
    this.miniCalc = new MiniCalculator(this.input1, document.getElementById('weightCalculator'));
    
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

  convert(value, fromUnit, toUnit) {
    if (!value) return '';
    try {
      // 定义单位换算关系（以克为基准）
      const units = {
        // 公制单位
        'g': 1,          // 克（基准单位）
        't': 0.000001,   // 吨 (1吨 = 1000000克)
        'kg': 0.001,     // 千克 (1千克 = 1000克)
        'mg': 1000,      // 毫克 (1克 = 1000毫克)
        'μg': 1000000,   // 微克 (1克 = 1000000微克)
        
        // 英制单位
        'lb': 0.00220462,  // 磅 (1克 = 0.00220462磅)
        'oz': 0.035274,    // 盎司 (1克 = 0.035274盎司)
        'st': 0.000157473, // 英石 (1克 = 0.000157473英石)
        'dr': 0.5643833,   // 打兰 (1克 = 0.5643833打兰)
        
        // 中国传统单位
        'dan': 0.00002,    // 担 (1克 = 0.00002担)
        'jin': 0.002,      // 市斤 (1克 = 0.002斤)
        'liang': 0.02,     // 两 (1克 = 0.02两)
        'qian': 0.2        // 钱 (1克 = 0.2钱)
      };

      // 先转换为克
      const grams = parseFloat(value) / units[fromUnit];
      // 再从克转换为目标单位
      const result = grams * units[toUnit];
      
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