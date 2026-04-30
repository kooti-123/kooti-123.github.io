/**
 * 视觉动态效果
 * - 滚动渐入动画 (Scroll Reveal)
 * - 阅读进度条 (Reading Progress)
 */
(function() {
  'use strict';

  var isIndex = document.body.classList.contains('index');

  // =============================================
  // 1. 滚动渐入动画
  // =============================================
  function initScrollReveal() {
    var selector;
    if (isIndex) {
      selector = '.post-block, .pagination';
    } else {
      selector = '.post-block, .post-header, .post-body p, ' +
        '.post-body h1, .post-body h2, .post-body h3, ' +
        '.post-body blockquote, .post-body ul, .post-body ol, ' +
        '.post-body img, .post-body .image-grid, ' +
        '.post-button, .post-tags, ' +
        '.about-hero, .game-item, .skill-tags, .about-contact';
    }

    var targets = document.querySelectorAll(selector);

    targets.forEach(function(el, index) {
      el.classList.add('reveal');
      el.style.transitionDelay = (index % 5) * 0.05 + 's';
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      document.querySelectorAll('.reveal').forEach(function(el) {
        observer.observe(el);
      });
    } else {
      document.querySelectorAll('.reveal').forEach(function(el) {
        el.classList.add('visible');
      });
    }
  }

  // =============================================
  // 2. 阅读进度条
  // =============================================
  function initReadingProgress() {
    if (isIndex) return;
    if (!document.querySelector('.post-block .post-body')) return;

    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.prepend(bar);

    window.addEventListener('scroll', function() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        bar.style.width = (scrollTop / docHeight) * 100 + '%';
      }
    }, { passive: true });
  }

  // =============================================
  // 初始化
  // =============================================
  function init() {
    initReadingProgress();

    if (document.readyState === 'complete') {
      initScrollReveal();
    } else {
      window.addEventListener('load', initScrollReveal);
    }

    document.addEventListener('pjax:complete', function() {
      document.querySelectorAll('.reveal.visible').forEach(function(el) {
        el.classList.remove('visible');
      });
      setTimeout(initScrollReveal, 100);
    });
  }

  init();
})();
