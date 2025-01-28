class Calculator {
  constructor() {
    if (!window.calculator) {
      throw new Error('window.calculator not initialized');
    }
    
    this.calculator = window.calculator;
    
    // 确保转换器组件存在
    if (!this.calculator.converter || !this.calculator.currency) {
      throw new Error('Required calculator components not initialized');
    }
    
    this.converter = this.calculator.converter;
    this.currency = this.calculator.currency;
    
    // 确保只初始化一次
    if (window.calculatorInstance) {
      return window.calculatorInstance;
    }
    window.calculatorInstance = this;
    
    this.history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
    
    // 先获取所有需要的DOM元素
    this.initializeElements();
    // 初始化按钮
    this.initializeButtons();
    // 绑定所有事件（包括历史记录按钮）
    this.bindEvents();
    // 最后加载默认模式
    this.loadLastMode();

    // 绑定版本号点击事件
    const versionInfo = document.querySelector('.version-info');
    const changelog = document.querySelector('.changelog');
    
    versionInfo.addEventListener('click', (e) => {
      e.stopPropagation();
      changelog.classList.toggle('show');
    });

    // 点击其他地方关闭更新日志
    document.addEventListener('click', () => {
      changelog.classList.remove('show');
    });

    changelog.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 绑定错误日志下载事件
    const errorLogBtn = document.querySelector('.error-log-btn');
    errorLogBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.downloadErrorLogs();
    });

    // 检查是否首次使用
    if (!localStorage.getItem('calculatorFirstUse')) {
      this.showWelcome();
    }

    // 绑定反馈按钮事件
    const feedbackBtn = document.querySelector('.feedback-btn');
    const feedbackOverlay = document.querySelector('.feedback-overlay');
    const closeBtn = document.querySelector('.close-btn');
    const submitBtn = document.querySelector('.submit-btn');
    const feedbackInput = document.querySelector('.feedback-input');
    const charCount = document.querySelector('.char-count');

    feedbackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      feedbackOverlay.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
      feedbackOverlay.classList.remove('show');
    });

    feedbackInput.addEventListener('input', () => {
      const length = feedbackInput.value.length;
      charCount.textContent = `${length}/500`;
      submitBtn.disabled = length < 10;
    });

    submitBtn.addEventListener('click', () => {
      this.submitFeedback();
    });
  }

  initializeElements() {
    this.display = document.getElementById('display');
    this.buttons = document.getElementById('buttons');
    this.calculatorContainer = document.getElementById('calculatorContainer');
    // 添加历史按钮和容器的引用
    this.historyBtn = document.querySelector('.history-btn');
    this.calculatorWrapper = document.querySelector('.calculator-container');
  }

  initializeButtons() {
    const buttons = [
      ['C', '←', '%', '/'],
      ['7', '8', '9', '*'],
      ['4', '5', '6', '-'],
      ['1', '2', '3', '+'],
      ['00', '0', '.', '=']
    ];

    this.buttons.innerHTML = buttons
      .map(row => row
        .map(btn => `<button data-value="${btn}">${btn}</button>`)
        .join('')
      )
      .join('');
  }

  bindEvents() {
    // 数字按钮事件 - 使用事件委托
    this.buttons.removeEventListener('click', this.handleButtonsClick);  // 先移除可能存在的事件监听
    this.handleButtonsClick = (e) => {
      if (e.target.tagName === 'BUTTON') {
        this.handleButtonClick(e.target.dataset.value);
      }
    };
    this.buttons.addEventListener('click', this.handleButtonsClick);

    // 键盘事件
    document.removeEventListener('keydown', this.handleKeyDown);
    this.handleKeyDown = (e) => {
      // 如果当前焦点在反馈输入框内，不处理按键事件
      if (document.activeElement.classList.contains('feedback-input')) {
        return;
      }
      
      const key = e.key;
      if (/[\d+\-*/.%]|Enter|Backspace|Delete|=/.test(key)) {
        e.preventDefault();
        let value = key;
        if (key === 'Enter' || key === '=') value = '=';
        if (key === 'Backspace' || key === 'Delete') value = '←';
        this.handleButtonClick(value);
      }
    };
    document.addEventListener('keydown', this.handleKeyDown);

    // 标签页切换事件
    document.querySelectorAll('.tab-item').forEach((tab, index) => {
      tab.addEventListener('click', () => {
        this.handleTabChange(index);
      });
    });

    // 图标点击事件
    document.querySelectorAll('.icon-item').forEach(icon => {
      icon.addEventListener('click', () => {
        this.switchMode(icon.dataset.mode);
      });
    });

    // 历史记录按钮事件
    if (this.historyBtn) {
      this.historyBtn.removeEventListener('click', this.handleHistoryClick);  // 先移除可能存在的事件监听
      this.historyBtn.addEventListener('click', this.handleHistoryClick.bind(this));
    }

    // 初始渲染历史记录
    this.renderHistory();
  }

  handleHistoryClick(e) {
    e.stopPropagation();
    this.calculatorWrapper.classList.toggle('history-active');
  }

  renderHistory() {
    const historyList = document.querySelector('.history-list');
    historyList.innerHTML = this.history
      .map(item => `
        <div class="history-item">
          <div class="history-expression">${item.expression}</div>
          <div class="history-result">${item.result}</div>
        </div>
      `)
      .join('');
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
          const expression = this.display.value;
          const result = window.calculator.calculate(expression);
          this.display.value = result;
          
          // 添加到历史记录
          this.history.unshift({
            expression: expression,
            result: result
          });
          
          // 限制历史记录数量
          if (this.history.length > 50) {
            this.history.pop();
          }
          
          // 保存到本地存储
          localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
          
          // 更新历史记录显示
          this.renderHistory();
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

  loadLastMode() {
    // 默认显示计算器
    document.querySelector('.tab-item').click();
  }

  switchMode(mode) {
    // 获取所有需要切换的元素
    const converterIcons = document.querySelector('.converter-icons');
    const calculatorContainer = document.getElementById('calculatorContainer');
    const converterContainers = document.querySelectorAll('.converter-container');
    const backBtns = document.querySelectorAll('.back-btn');
    
    if (mode === 'calculator') {
      // 切换到计算器
      converterIcons.classList.add('hide');
      converterContainers.forEach(container => {
        container.classList.remove('active');
      });
      backBtns.forEach(btn => btn.classList.remove('show'));
      
      // 延迟显示计算器
      setTimeout(() => {
        calculatorContainer.style.display = 'block';
        converterIcons.style.display = 'none';
        void calculatorContainer.offsetWidth;
        calculatorContainer.classList.remove('hide');
      }, 300);
    } else {
      // 处理具体的转换器显示
      calculatorContainer.classList.add('hide');
      converterIcons.classList.add('hide');
      
      // 延迟显示选中的转换器
      setTimeout(() => {
        calculatorContainer.style.display = 'none';
        converterIcons.style.display = 'none';
        
        // 显示对应的转换器
        const targetContainer = document.getElementById(`${mode}Container`);
        if (targetContainer) {
          converterContainers.forEach(container => {
            container.style.display = 'none';
            container.classList.remove('active');
          });
          targetContainer.style.display = 'block';
          void targetContainer.offsetWidth;
          targetContainer.classList.add('active');
          
          // 显示返回按钮
          const backBtn = targetContainer.querySelector('.back-btn');
          if (backBtn) {
            backBtn.classList.add('show');
          }
        }
      }, 300);
    }
  }

  handleTabChange(index) {
    // 移除所有 active 类
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    // 添加 active 类到当前标签
    document.querySelectorAll('.tab-item')[index].classList.add('active');
    
    // 获取所有需要切换的元素
    const converterIcons = document.querySelector('.converter-icons');
    const calculatorContainer = document.getElementById('calculatorContainer');
    const converterContainers = document.querySelectorAll('.converter-container');
    
    // 关闭历史面板
    this.calculatorWrapper.classList.remove('history-active');

    if (index === 0) { // 切换到计算器
      // 先隐藏转换器
      converterIcons.classList.add('hide');
      
      // 隐藏所有转换器界面
      converterContainers.forEach(container => {
        container.classList.remove('active');
        // 延迟后完全隐藏
        setTimeout(() => {
          container.style.display = 'none';
        }, 300);
      });
      
      // 延迟显示计算器
      setTimeout(() => {
        calculatorContainer.style.display = 'block';
        converterIcons.style.display = 'none';
        void calculatorContainer.offsetWidth;
        calculatorContainer.classList.remove('hide');
      }, 300);
    } else { // 切换到换算
      // 先隐藏计算器
      calculatorContainer.classList.add('hide');
      
      // 隐藏所有转换器界面
      converterContainers.forEach(container => {
        container.classList.remove('active');
        container.style.display = 'none';
      });
      
      // 延迟显示转换器图标
      setTimeout(() => {
        calculatorContainer.style.display = 'none';
        converterIcons.style.display = 'grid';
        void converterIcons.offsetWidth;
        converterIcons.classList.remove('hide');
      }, 300);
    }
  }

  // 添加下载错误日志方法
  downloadErrorLogs() {
    const logs = window.errorLogs || [];
    if (logs.length === 0) {
      alert('目前没有错误日志');
      return;
    }

    const content = JSON.stringify(logs, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculator-error-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showWelcome() {
    const welcomeOverlay = document.querySelector('.welcome-overlay');
    const welcomeBtn = document.querySelector('.welcome-btn');

    // 显示欢迎界面
    setTimeout(() => {
      welcomeOverlay.classList.add('show');
    }, 500);

    // 绑定按钮事件
    welcomeBtn.addEventListener('click', () => {
      welcomeOverlay.classList.remove('show');
      localStorage.setItem('calculatorFirstUse', 'false');
    });
  }

  // 添加提交反馈方法
  async submitFeedback() {
    const type = document.querySelector('input[name="type"]:checked').value;
    const content = document.querySelector('.feedback-input').value;
    
    if (content.length < 10) {
      alert('请至少输入10个字的描述');
      return;
    }

    try {
      // 构建反馈内容
      const feedback = {
        type,
        content,
        version: '1.6.0',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      // 构建 GitHub Issues URL
      const issueTitle = encodeURIComponent(`[${type === 'bug' ? '问题反馈' : '功能建议'}] ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`);
      const issueBody = encodeURIComponent(
        `### 反馈内容\n${content}\n\n### 系统信息\n` +
        `- 版本：${feedback.version}\n` +
        `- 时间：${new Date(feedback.timestamp).toLocaleString()}\n` +
        `- 浏览器：${feedback.userAgent}\n`
      );
      const githubIssueUrl = `https://github.com/ShourGG/calculator/issues/new?title=${issueTitle}&body=${issueBody}&labels=${type}`;

      // 打开 GitHub Issues 页面
      if (typeof utools !== 'undefined') {
        utools.shellOpenExternal(githubIssueUrl);
      } else {
        window.open(githubIssueUrl, '_blank');
      }

      // 保存到本地
      const feedbacks = JSON.parse(localStorage.getItem('calculatorFeedbacks') || '[]');
      feedbacks.push(feedback);
      localStorage.setItem('calculatorFeedbacks', JSON.stringify(feedbacks));

      alert('感谢您的反馈！已打开 GitHub Issues 页面，请确认提交。');
      document.querySelector('.feedback-overlay').classList.remove('show');
      document.querySelector('.feedback-input').value = '';
      document.querySelector('.char-count').textContent = '0/500';
    } catch (error) {
      alert('提交失败，请稍后重试');
      console.error('Feedback submission error:', error);
    }
  }
} 