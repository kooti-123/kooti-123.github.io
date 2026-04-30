/**
 * 点击粒子效果
 * 在页面点击时产生粒子爆炸效果
 * 性能优化版本：添加节流和优化动画循环
 */
(function() {
  'use strict';

  // 节流函数 - 限制函数执行频率
  function throttle(func, wait) {
    let timeout;
    return function(...args) {
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          func.apply(this, args);
        }, wait);
      }
    };
  }

  // 防抖函数 - 延迟执行，只执行最后一次
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // 粒子配置
  const config = {
    particleCount: 30,        // 每次点击产生的粒子数量
    particleSpeed: 5,         // 粒子速度
    particleSize: 3,          // 粒子大小
    colors: [                 // 粒子颜色数组
      '#ff5e57', '#f3a683', '#778beb', '#f8a5c2',
      '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7',
      '#a29bfe', '#fd79a8', '#fdcb6e', '#e17055'
    ],
    duration: 1000,           // 粒子持续时间（毫秒）
    gravity: 0.3,             // 重力效果
    throttleDelay: 100        // 节流延迟（毫秒）
  };

  // 创建画布
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;

  // 设置画布大小（使用防抖优化）
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  // 使用防抖优化窗口大小调整事件
  window.addEventListener('resize', debounce(resizeCanvas, 250));

  // 粒子类
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * config.particleSpeed * 2;
      this.vy = (Math.random() - 0.5) * config.particleSpeed * 2;
      this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
      this.size = Math.random() * config.particleSize + 1;
      this.life = 1.0;
      this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += config.gravity;
      this.life -= this.decay;
      return this.life > 0;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 创建粒子
  function createParticles(x, y) {
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle(x, y));
    }
  }

  // 动画循环（性能优化版本）
  function animate() {
    // 如果没有粒子，停止动画
    if (particles.length === 0) {
      animationId = null;
      return;
    }

    // 使用 clearRect 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 批量更新和绘制粒子
    const aliveParticles = [];
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      if (particle.update()) {
        particle.draw();
        aliveParticles.push(particle);
      }
    }
    particles = aliveParticles;

    // 继续动画循环
    if (particles.length > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      animationId = null;
    }
  }

  // 检查是否应该创建粒子（排除特定元素）
  function shouldCreateParticles(target) {
    if (!target) return false;
    
    // 排除列表
    const excludeSelectors = [
      'CODE', 'PRE', 'BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'
    ];
    
    // 检查标签名
    if (excludeSelectors.includes(target.tagName)) {
      return false;
    }
    
    // 检查是否在排除的容器内
    const excludeContainers = ['pre', 'code', 'button', '.copy-btn', 'a'];
    for (const selector of excludeContainers) {
      if (target.closest && target.closest(selector)) {
        return false;
      }
    }
    
    return true;
  }

  // 处理粒子创建（统一处理点击和触摸）
  function handleParticleCreation(x, y, target) {
    if (!shouldCreateParticles(target)) {
      return;
    }

    createParticles(x, y);
    
    // 启动动画循环（如果未运行）
    if (!animationId) {
      animationId = requestAnimationFrame(animate);
    }
  }

  // 点击事件处理（使用节流优化）
  document.addEventListener('click', throttle(function(e) {
    handleParticleCreation(e.clientX, e.clientY, e.target);
  }, config.throttleDelay), { passive: true });

  // 移动端触摸事件（使用节流优化）
  document.addEventListener('touchstart', throttle(function(e) {
    const touch = e.touches[0];
    if (touch) {
      handleParticleCreation(touch.clientX, touch.clientY, e.target);
    }
  }, config.throttleDelay), { passive: true });

  // 页面可见性优化：当页面不可见时暂停动画
  document.addEventListener('visibilitychange', function() {
    if (document.hidden && animationId) {
      // 页面隐藏时，可以暂停动画以节省资源
      // 但为了更好的用户体验，我们继续运行动画
      // 如果需要更激进的优化，可以取消注释下面的代码
      // cancelAnimationFrame(animationId);
      // animationId = null;
    }
  });
})();

