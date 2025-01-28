class AreaConverter {
  constructor(calculator) {
    this.calculator = calculator;
    this.input1 = document.getElementById('areaInput1');
    this.input2 = document.getElementById('areaInput2');
    this.unit1 = document.getElementById('areaUnit1');
    this.unit2 = document.getElementById('areaUnit2');
    
    // 初始化 miniCalculator
    this.miniCalc = new MiniCalculator(this.input1, document.getElementById('areaCalculator'));
    
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
      // 定义单位换算关系（以平方米为基准）
      const units = {
        // 公制单位
        'km2': 0.000001,     // 平方千米
        'ha': 0.0001,        // 公顷
        'are': 0.01,         // 公亩
        'm2': 1,             // 平方米（基准单位）
        'dm2': 100,          // 平方分米
        'cm2': 10000,        // 平方厘米
        'mm2': 1000000,      // 平方毫米

        // 英制单位
        'acre': 0.000247105, // 英亩
        'sqmi': 3.861e-7,    // 平方英里
        'sqyd': 1.19599,     // 平方码
        'sqft': 10.7639,     // 平方英尺
        'sqin': 1550.0031,   // 平方英寸

        // 中国传统单位
        'qing': 0.00001500,  // 顷
        'mu': 0.0015,        // 亩
        'sqchi': 9,          // 平方尺
        'sqcun': 900         // 平方寸
      };

      // 先转换为平方米
      const sqMeters = parseFloat(value) / units[fromUnit];
      // 再从平方米转换为目标单位
      const result = sqMeters * units[toUnit];
      
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