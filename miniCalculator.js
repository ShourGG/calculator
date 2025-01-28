class MiniCalculator {
  constructor(defaultInput, buttons) {
    this.currentInput = defaultInput;  // 默认输入框
    this.buttons = buttons;
    this.displayValue = '';  // 显示的表达式
    this.expression = '';    // 计算用的表达式
    this.bindEvents();
    console.log('MiniCalculator initialized');  // 添加调试日志
  }

  bindEvents() {
    // 监听按钮点击
    this.buttons.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const op = e.target.getAttribute('data-op');
        if (op) {
          console.log('Button clicked:', op);
          this.handleButtonClick(op);
          // 在点击按钮后保持输入框焦点
          this.currentInput.focus();
        }
      }
    });

    // 监听输入框获得焦点和键盘输入
    document.querySelectorAll('.amount-input').forEach(input => {
      // 焦点事件
      input.addEventListener('focus', () => {
        console.log('Input focused:', input.id);
        if (this.currentInput !== input) {
          this.displayValue = input.value || '';
          this.expression = input.value || '';
        }
        this.currentInput = input;
      });

      // 键盘输入事件
      input.addEventListener('keyup', (e) => {
        // 更新显示值和表达式
        const inputValue = input.value;
        
        // 将显示符号转换为表达式符号
        this.displayValue = inputValue;
        this.expression = inputValue.replace(/×/g, '*').replace(/÷/g, '/');
        
        // 尝试计算结果
        try {
          // 如果是纯数字，直接使用
          if (/^\d*\.?\d*$/.test(this.expression)) {
            this.calculateAndUpdate();
          } 
          // 如果是表达式，检查是否可以计算
          else if (/[\d.]+[*/+-][\d.]+/.test(this.expression)) {
            this.calculateAndUpdate();
          }
        } catch(e) {
          console.error('Keyboard input calculation error:', e);
        }
      });
    });
  }

  calculateAndUpdate() {
    // 计算表达式的结果
    try {
      // 如果只是纯数字，直接使用
      if (/^\d*\.?\d*$/.test(this.expression)) {
        this.currentInput.setAttribute('data-value', this.expression);
        this.currentInput.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      // 如果是表达式，计算结果
      let result = window.calculator.calculate(this.expression);
      if (result !== undefined) {
        const resultStr = result.toString();
        this.currentInput.setAttribute('data-value', resultStr);
        this.currentInput.dispatchEvent(new Event('input', { bubbles: true }));
        return resultStr; // 返回计算结果字符串
      }
    } catch(e) {
      console.error('Calculation error:', e);
    }
    return null;
  }

  handleButtonClick(op) {
    // 处理不同的按钮操作
    switch(op) {
      case 'C':
        this.displayValue = '';
        this.expression = '';
        this.currentInput.value = '';
        this.currentInput.setAttribute('data-value', '');
        // 触发 input 事件清空转换结果
        this.currentInput.dispatchEvent(new Event('input', { bubbles: true }));
        break;
        
      case '←':
        this.displayValue = this.displayValue.slice(0, -1);
        this.expression = this.expression.slice(0, -1);
        this.currentInput.value = this.displayValue;
        // 如果还有数字，重新计算并转换
        if (this.expression) {
          this.calculateAndUpdate();
        } else {
          // 如果已经清空，触发 input 事件清空转换结果
          this.currentInput.setAttribute('data-value', '');
          this.currentInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        break;
        
      case '=':
        if (this.expression) {
          const result = this.calculateAndUpdate();
          if (result) {
            // 更新显示值和表达式为计算结果
            this.displayValue = result;
            this.expression = result;
            this.currentInput.value = result;
          }
        }
        break;
        
      default:
        // 更新显示值和表达式
        if ('0123456789.'.includes(op)) {
          this.displayValue += op;
          this.expression += op;
          this.currentInput.value = this.displayValue;
          this.calculateAndUpdate();  // 输入数字时就实时计算
        } else {
          this.displayValue += op === '*' ? '×' : op === '/' ? '÷' : op;
          this.expression += op;
          this.currentInput.value = this.displayValue;
          // 对于运算符，也需要计算并转换
          if (this.expression.match(/^\d+$/)) {
            this.calculateAndUpdate();
          }
        }
    }
    
    console.log('Display value:', this.displayValue);
    console.log('Expression:', this.expression);
    
    // 更新光标位置到末尾
    this.currentInput.setSelectionRange(this.displayValue.length, this.displayValue.length);
  }
} 