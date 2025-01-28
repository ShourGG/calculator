class LengthConverter {
  constructor(calculator) {
    this.calculator = calculator;
    this.input1 = document.getElementById('lengthInput1');
    this.input2 = document.getElementById('lengthInput2');
    this.unit1 = document.getElementById('lengthUnit1');
    this.unit2 = document.getElementById('lengthUnit2');
    
    // 初始化 miniCalculator
    this.miniCalc = new MiniCalculator(this.input1, document.getElementById('lengthCalculator'));
    
    // 复制单位选项
    this.unit2.innerHTML = this.unit1.innerHTML;
    
    // 绑定事件
    this.input1.addEventListener('input', () => {
      // 获取实际的计算结果
      const value = this.input1.getAttribute('data-value') || this.input1.value;
      if (value) {
        // 转换单位并设置 data-value 属性
        const result = this.convert(value, this.unit1.value, this.unit2.value);
        this.input2.value = result;
        this.input2.setAttribute('data-value', result);
      }
    });

    this.input2.addEventListener('input', () => {
      // 获取实际的计算结果
      const value = this.input2.getAttribute('data-value') || this.input2.value;
      if (value) {
        // 反向转换单位并设置 data-value 属性
        const result = this.convert(value, this.unit2.value, this.unit1.value);
        this.input1.value = result;
        this.input1.setAttribute('data-value', result);
      }
    });
    
    this.unit1.addEventListener('change', () => {
      const value = this.input1.getAttribute('data-value') || this.input1.value;
      if (value) {
        const result = this.convert(value, this.unit1.value, this.unit2.value);
        this.input2.value = result;
        this.input2.setAttribute('data-value', result);
      }
    });
    
    this.unit2.addEventListener('change', () => {
      const value = this.input2.getAttribute('data-value') || this.input2.value;
      if (value) {
        const result = this.convert(value, this.unit2.value, this.unit1.value);
        this.input1.value = result;
        this.input1.setAttribute('data-value', result);
      }
    });

    // 监听第二个输入框的点击事件
    this.input2.addEventListener('click', () => {
      // 将第二个输入框的值设置为当前计算器的输入
      this.miniCalc.currentInput = this.input2;
      // 设置初始值为转换后的结果
      this.miniCalc.displayValue = this.input2.value;
      this.miniCalc.expression = this.input2.value;
    });
  }
  
  convert(value, fromUnit, toUnit) {
    if (!value) {
      return '';
    }
    
    try {
      // 定义单位换算关系（以米为基准）
      const units = {
        'm': 1,      // 米（基准单位）
        'km': 0.001  // 千米 (1千米 = 1000米)
      };

      // 先转换为米
      const meters = parseFloat(value) / units[fromUnit];
      // 再从米转换为目标单位
      const result = meters * units[toUnit];
      
      return this.formatNumber(result);
    } catch(e) {
      console.error('Conversion error:', e);
      return 'Error';
    }
  }

  formatNumber(num) {
    if (Math.abs(num) >= 1e6 || Math.abs(num) < 0.001) {
      // 使用科学计数法，保留6位有效数字
      return num.toPrecision(6);
    } else {
      // 常规数字保留4位小数
      return num.toLocaleString('zh-CN', {
        maximumFractionDigits: 4,
        minimumFractionDigits: 0
      });
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new LengthConverter();
}); 