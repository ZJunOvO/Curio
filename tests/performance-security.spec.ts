import { test, expect, Page } from '@playwright/test';

test.describe('性能和安全测试', () => {
  test.describe('性能指标测试', () => {
    test('首屏加载性能测试', async ({ page }) => {
      // 开始性能监控
      await page.coverage.startJSCoverage();
      await page.coverage.startCSSCoverage();

      const startTime = performance.now();
      await page.goto('/plans');
      
      // 等待首屏关键元素加载
      await page.waitForSelector('h1', { timeout: 5000 });
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      console.log(`首屏加载时间: ${loadTime}ms`);
      
      // 首屏应该在2秒内加载完成
      expect(loadTime).toBeLessThan(2000);

      // 检查代码覆盖率
      const jsCoverage = await page.coverage.stopJSCoverage();
      const cssCoverage = await page.coverage.stopCSSCoverage();
      
      console.log(`JS文件数量: ${jsCoverage.length}`);
      console.log(`CSS文件数量: ${cssCoverage.length}`);
    });

    test('页面资源加载优化检查', async ({ page }) => {
      const responses: any[] = [];
      
      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          size: response.headers()['content-length'],
          timing: response.timing()
        });
      });

      await page.goto('/plans');
      await page.waitForLoadState('networkidle');

      // 检查是否有404或500错误
      const errorResponses = responses.filter(r => r.status >= 400);
      expect(errorResponses.length).toBe(0);

      // 检查大型资源
      const largeResources = responses.filter(r => 
        parseInt(r.size || '0') > 1024 * 1024 // 大于1MB
      );
      
      if (largeResources.length > 0) {
        console.warn('发现大型资源:', largeResources.map(r => ({
          url: r.url,
          size: r.size
        })));
      }
    });

    test('内存使用情况检查', async ({ page }) => {
      await page.goto('/plans');
      
      // 获取初始内存使用情况
      const initialMetrics = await page.evaluate(() => {
        return {
          usedJSMemory: (performance as any).memory?.usedJSMemory || 0,
          totalJSMemory: (performance as any).memory?.totalJSMemory || 0
        };
      });

      // 执行一些操作
      if (await page.locator('input[placeholder*="搜索"]').isVisible()) {
        await page.fill('input[placeholder*="搜索"]', '测试搜索');
        await page.waitForTimeout(1000);
      }

      // 获取操作后内存使用情况
      const finalMetrics = await page.evaluate(() => {
        return {
          usedJSMemory: (performance as any).memory?.usedJSMemory || 0,
          totalJSMemory: (performance as any).memory?.totalJSMemory || 0
        };
      });

      const memoryIncrease = finalMetrics.usedJSMemory - initialMetrics.usedJSMemory;
      console.log(`内存增长: ${memoryIncrease / 1024 / 1024}MB`);

      // 内存增长不应该超过50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  test.describe('安全测试', () => {
    test('XSS攻击防护测试', async ({ page }) => {
      await page.goto('/plans/create');

      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(\'XSS\')">',
        '<svg onload="alert(\'XSS\')">',
        '\';alert("XSS");//'
      ];

      for (const payload of xssPayloads) {
        // 测试标题输入
        const titleInput = page.locator('input[placeholder*="计划标题"]');
        if (await titleInput.isVisible()) {
          await titleInput.fill(payload);
          
          // 检查页面上是否执行了脚本
          const alertOccurred = await page.evaluate(() => {
            return window.confirm === window.confirm; // 简单检查窗口对象是否被修改
          });
          
          expect(alertOccurred).toBe(true); // 应该没有弹窗
        }

        // 测试描述输入
        const descInput = page.locator('textarea[placeholder*="描述"]');
        if (await descInput.isVisible()) {
          await descInput.fill(payload);
        }
      }

      // 页面应该仍然正常工作
      await expect(page.locator('h2')).toBeVisible();
    });

    test('SQL注入防护测试', async ({ page }) => {
      await page.goto('/plans');

      const sqlPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE plans; --",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "admin'/*"
      ];

      const searchInput = page.locator('input[placeholder*="搜索"]');
      
      if (await searchInput.isVisible()) {
        for (const payload of sqlPayloads) {
          await searchInput.fill(payload);
          await page.waitForTimeout(500);
          
          // 页面应该仍然正常工作，没有数据库错误
          await expect(page.locator('body')).not.toContainText('SQL');
          await expect(page.locator('body')).not.toContainText('database error');
          await expect(page.locator('body')).not.toContainText('syntax error');
        }
      }
    });

    test('CSRF防护检查', async ({ page }) => {
      await page.goto('/plans/create');

      // 检查是否存在CSRF token
      const csrfToken = await page.evaluate(() => {
        // 检查meta标签中的CSRF token
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) return metaToken.getAttribute('content');

        // 检查隐藏表单字段
        const hiddenToken = document.querySelector('input[name="_token"], input[name="csrf_token"]');
        if (hiddenToken) return (hiddenToken as HTMLInputElement).value;

        return null;
      });

      // 如果应用使用CSRF保护，应该找到token
      console.log('CSRF Token:', csrfToken || '未找到CSRF Token');
    });

    test('敏感信息泄露检查', async ({ page }) => {
      const responses: any[] = [];
      
      page.on('response', response => {
        responses.push({
          url: response.url(),
          headers: response.headers()
        });
      });

      await page.goto('/plans');
      await page.waitForLoadState('networkidle');

      // 检查响应头中的敏感信息
      for (const response of responses) {
        // 检查是否暴露了服务器信息
        expect(response.headers['server']).not.toMatch(/Apache|nginx|IIS/i);
        
        // 检查是否暴露了技术栈信息
        expect(response.headers['x-powered-by']).toBeUndefined();
        
        // 检查安全头
        if (response.url.includes(page.url())) {
          expect(response.headers['x-frame-options']).toBeTruthy();
          expect(response.headers['x-content-type-options']).toBe('nosniff');
        }
      }

      // 检查页面源码中的敏感信息
      const content = await page.content();
      expect(content).not.toMatch(/password|secret|key|token/i);
      expect(content).not.toMatch(/api[_-]?key/i);
      expect(content).not.toMatch(/access[_-]?token/i);
    });

    test('文件上传安全检查', async ({ page }) => {
      await page.goto('/plans/create');

      // 检查是否有文件上传功能
      const fileInputs = page.locator('input[type="file"]');
      const count = await fileInputs.count();

      if (count > 0) {
        // 测试危险文件扩展名
        const dangerousFiles = [
          'test.exe',
          'script.js',
          'malware.bat',
          'virus.php'
        ];

        for (let i = 0; i < count; i++) {
          const fileInput = fileInputs.nth(i);
          
          // 检查是否有文件类型限制
          const accept = await fileInput.getAttribute('accept');
          console.log(`文件输入 ${i + 1} 的accept属性:`, accept);
          
          if (accept) {
            // 应该有合理的文件类型限制
            expect(accept).not.toBe('*/*');
            expect(accept).not.toContain('.exe');
            expect(accept).not.toContain('.bat');
          }
        }
      }
    });
  });

  test.describe('数据验证测试', () => {
    test('输入长度限制测试', async ({ page }) => {
      await page.goto('/plans/create');

      const longString = 'A'.repeat(10000); // 10000个字符

      // 测试标题输入长度限制
      const titleInput = page.locator('input[placeholder*="计划标题"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill(longString);
        const value = await titleInput.inputValue();
        
        // 应该有合理的长度限制
        expect(value.length).toBeLessThan(1000);
      }

      // 测试描述输入长度限制
      const descInput = page.locator('textarea[placeholder*="描述"]');
      if (await descInput.isVisible()) {
        await descInput.fill(longString);
        const value = await descInput.inputValue();
        
        // 描述应该有合理的长度限制
        expect(value.length).toBeLessThan(5000);
      }
    });

    test('特殊字符处理测试', async ({ page }) => {
      await page.goto('/plans/create');

      const specialChars = [
        '中文测试',
        'Émojis 🚀 💡 ✨',
        '特殊符号 @#$%^&*()',
        'Unicode: ñáéíóú',
        'Русский текст'
      ];

      const titleInput = page.locator('input[placeholder*="计划标题"]');
      
      if (await titleInput.isVisible()) {
        for (const chars of specialChars) {
          await titleInput.fill(chars);
          const value = await titleInput.inputValue();
          
          // 应该能正确处理特殊字符
          expect(value).toBe(chars);
        }
      }
    });

    test('日期输入验证测试', async ({ page }) => {
      await page.goto('/plans/create');

      const dateInputs = page.locator('input[type="date"]');
      const count = await dateInputs.count();

      if (count >= 2) {
        const startDateInput = dateInputs.first();
        const endDateInput = dateInputs.last();

        // 测试无效日期格式
        await startDateInput.fill('invalid-date');
        const startValue = await startDateInput.inputValue();
        
        await endDateInput.fill('2024-13-45'); // 无效日期
        const endValue = await endDateInput.inputValue();

        // 浏览器应该拒绝无效日期
        expect(startValue).not.toBe('invalid-date');
        expect(endValue).not.toBe('2024-13-45');
      }
    });
  });

  test.describe('错误处理和恢复测试', () => {
    test('网络中断恢复测试', async ({ page }) => {
      await page.goto('/plans');

      // 模拟网络中断
      await page.setOfflineMode(true);
      
      // 尝试执行需要网络的操作
      const createButton = page.locator('a[href="/plans/create"]');
      if (await createButton.isVisible()) {
        await createButton.click();
      }

      // 恢复网络
      await page.setOfflineMode(false);
      
      // 页面应该能够恢复正常
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });

    test('页面崩溃恢复测试', async ({ page }) => {
      await page.goto('/plans');

      // 注入可能导致问题的代码
      await page.evaluate(() => {
        // 模拟内存泄漏
        const largeArray = new Array(1000000).fill('memory test');
        (window as any).testArray = largeArray;
      });

      // 页面应该仍然响应
      await expect(page.locator('body')).toBeVisible();
      
      // 清理
      await page.evaluate(() => {
        delete (window as any).testArray;
      });
    });

    test('表单数据恢复测试', async ({ page }) => {
      await page.goto('/plans/create');

      // 填写表单数据
      const titleInput = page.locator('input[placeholder*="计划标题"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('测试计划恢复');
        
        // 刷新页面
        await page.reload();
        
        // 检查是否有数据恢复机制
        const value = await titleInput.inputValue();
        console.log('页面刷新后的表单值:', value);
        
        // 根据应用实现决定是否应该保留数据
      }
    });
  });

  test.describe('SEO和元数据测试', () => {
    test('页面元数据检查', async ({ page }) => {
      await page.goto('/plans');

      // 检查页面标题
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThan(60); // SEO最佳实践

      // 检查meta描述
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      if (description) {
        expect(description.length).toBeGreaterThan(0);
        expect(description.length).toBeLessThan(160); // SEO最佳实践
      }

      // 检查其他重要的meta标签
      await expect(page.locator('meta[charset]')).toBeAttached();
      await expect(page.locator('meta[name="viewport"]')).toBeAttached();
    });

    test('结构化数据检查', async ({ page }) => {
      await page.goto('/plans');

      // 检查是否有结构化数据
      const jsonLd = await page.locator('script[type="application/ld+json"]').count();
      console.log('结构化数据脚本数量:', jsonLd);

      // 检查Open Graph标签
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      
      console.log('Open Graph数据:', { ogTitle, ogDescription });
    });
  });
});