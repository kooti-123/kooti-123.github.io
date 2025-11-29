/**
 * 点击粒子效果
 * 在页面点击时产生粒子爆炸效果
 */
(function() {
  'use strict';

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
    gravity: 0.3              // 重力效果
  };

  // 创建画布
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;

  // 设置画布大小
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

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

  // 动画循环
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles = particles.filter(particle => {
      const alive = particle.update();
      if (alive) {
        particle.draw();
      }
      return alive;
    });

    if (particles.length > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      animationId = null;
    }
  }

  // 点击事件处理
  document.addEventListener('click', function(e) {
    // 排除在代码块、按钮等元素上的点击
    const target = e.target;
    if (target.tagName === 'CODE' || 
        target.tagName === 'PRE' || 
        target.closest('pre') ||
        target.closest('button') ||
        target.closest('.copy-btn')) {
      return;
    }

    createParticles(e.clientX, e.clientY);
    
    if (!animationId) {
      animationId = requestAnimationFrame(animate);
    }
  });

  // 移动端触摸事件
  document.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    if (touch) {
      const target = e.target;
      if (target.tagName === 'CODE' || 
          target.tagName === 'PRE' || 
          target.closest('pre') ||
          target.closest('button') ||
          target.closest('.copy-btn')) {
        return;
      }
      
      createParticles(touch.clientX, touch.clientY);
      
      if (!animationId) {
        animationId = requestAnimationFrame(animate);
      }
    }
  });
})();

