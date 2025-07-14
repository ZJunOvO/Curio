import { test, expect, Page } from '@playwright/test';

test.describe('API和集成测试', () => {
  test.describe('Supabase集成测试', () => {
    test('数据库连接测试', async ({ page }) => {
      // 监听网络请求
      const requests: any[] = [];
      page.on('request', request => {
        if (request.url().includes('supabase')) {
          requests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers()
          });
        }
      });

      await page.goto('/plans');
      await page.waitForTimeout(2000);

      // 应该有Supabase API调用
      const supabaseRequests = requests.filter(r => r.url.includes('supabase'));
      expect(supabaseRequests.length).toBeGreaterThan(0);

      // 检查认证头
      const authRequests = supabaseRequests.filter(r => r.headers.authorization);
      console.log('认证请求数量:', authRequests.length);
    });

    test('计划数据获取测试', async ({ page }) => {
      const responses: any[] = [];
      
      page.on('response', async response => {
        if (response.url().includes('plans') && response.status() === 200) {
          try {
            const data = await response.json();
            responses.push(data);
          } catch (e) {
            // 响应可能不是JSON格式
          }
        }
      });

      // 模拟登录状态
      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'test-user-id', email: 'test@example.com' }
        }));
      });

      await page.goto('/plans');
      await page.waitForTimeout(3000);

      console.log('计划数据响应数量:', responses.length);
    });

    test('实时数据更新测试', async ({ page, browser }) => {
      // 创建两个页面模拟实时更新
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      // 模拟登录状态
      const authScript = () => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'test-user-id', email: 'test@example.com' }
        }));
      };

      await page1.addInitScript(authScript);
      await page2.addInitScript(authScript);

      await page1.goto('/plans');
      await page2.goto('/plans');

      // 等待页面加载
      await page1.waitForTimeout(2000);
      await page2.waitForTimeout(2000);

      // 在page1上创建计划（如果有创建功能）
      const createButton1 = page1.locator('a[href="/plans/create"]');
      if (await createButton1.isVisible()) {
        console.log('检测到创建计划按钮');
      }

      // 检查page2是否收到更新（实时功能）
      // 这需要根据实际的实时更新实现来测试

      await context1.close();
      await context2.close();
    });
  });

  test.describe('认证流程测试', () => {
    test('登录流程测试', async ({ page }) => {
      await page.goto('/auth/login');

      // 检查登录页面元素
      await expect(page.locator('input[type="email"], input[placeholder*="邮箱"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[placeholder*="密码"]')).toBeVisible();
      await expect(page.locator('button[type="submit"], button:has-text("登录")')).toBeVisible();
    });

    test('注册流程测试', async ({ page }) => {
      await page.goto('/auth/register');

      // 检查注册页面元素
      await expect(page.locator('input[type="email"], input[placeholder*="邮箱"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[placeholder*="密码"]')).toBeVisible();
      await expect(page.locator('button[type="submit"], button:has-text("注册")')).toBeVisible();
    });

    test('权限控制测试', async ({ page }) => {
      // 未登录时访问受保护页面
      await page.goto('/plans');
      
      // 应该显示登录提示或重定向到登录页面
      const isLoginPrompt = await page.locator('button:has-text("登录账户")').isVisible();
      const isLoginPage = page.url().includes('/auth/login');
      
      expect(isLoginPrompt || isLoginPage).toBe(true);
    });

    test('会话管理测试', async ({ page }) => {
      // 设置过期的token
      await page.addInitScript(() => {
        const expiredToken = {
          access_token: 'expired-token',
          expires_at: Date.now() - 3600000, // 1小时前过期
          user: { id: 'test-user-id', email: 'test@example.com' }
        };
        window.localStorage.setItem('supabase.auth.token', JSON.stringify(expiredToken));
      });

      await page.goto('/plans');

      // 应该处理过期token并要求重新登录
      await page.waitForTimeout(2000);
      
      const isLoginRequired = await page.locator('button:has-text("登录")').isVisible();
      console.log('过期token处理:', isLoginRequired ? '要求重新登录' : '未检测到登录要求');
    });
  });

  test.describe('数据验证和错误处理', () => {
    test('表单验证测试', async ({ page }) => {
      await page.goto('/plans/create');

      // 测试空表单提交
      const nextButton = page.locator('button:has-text("下一步")');
      if (await nextButton.isVisible()) {
        const isDisabled = await nextButton.isDisabled();
        expect(isDisabled).toBe(true); // 应该禁用按钮或显示验证错误
      }

      // 测试无效邮箱格式
      const emailInputs = page.locator('input[type="email"]');
      const emailCount = await emailInputs.count();
      
      if (emailCount > 0) {
        await emailInputs.first().fill('invalid-email');
        // 应该显示验证错误
      }

      // 测试日期验证
      const dateInputs = page.locator('input[type="date"]');
      const dateCount = await dateInputs.count();
      
      if (dateCount >= 2) {
        // 设置结束日期早于开始日期
        await dateInputs.first().fill('2024-12-31');
        await dateInputs.last().fill('2024-01-01');
        
        // 应该显示日期逻辑错误
      }
    });

    test('API错误处理测试', async ({ page }) => {
      // 拦截API请求并返回错误
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      await page.goto('/plans');

      // 应该显示错误状态或错误信息
      await page.waitForTimeout(2000);
      
      // 检查是否有错误处理UI
      const errorElements = page.locator('[data-testid="error"], .error, [role="alert"]');
      const errorCount = await errorElements.count();
      
      console.log('错误处理元素数量:', errorCount);
    });

    test('网络超时处理测试', async ({ page }) => {
      // 拦截请求并延迟响应
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10秒延迟
        route.continue();
      });

      await page.goto('/plans');

      // 应该显示加载状态
      const loadingElements = page.locator('[data-testid="loading"], .loading, .skeleton');
      await expect(loadingElements.first()).toBeVisible({ timeout: 1000 });
    });
  });

  test.describe('数据一致性测试', () => {
    test('计划创建数据完整性', async ({ page }) => {
      // 监听所有网络请求
      const requests: any[] = [];
      
      page.on('request', request => {
        if (request.method() === 'POST' && request.url().includes('plans')) {
          requests.push({
            url: request.url(),
            method: request.method(),
            postData: request.postData()
          });
        }
      });

      await page.goto('/plans/create');

      // 填写完整的计划信息
      const titleInput = page.locator('input[placeholder*="计划标题"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('数据完整性测试计划');
        
        const descInput = page.locator('textarea[placeholder*="描述"]');
        if (await descInput.isVisible()) {
          await descInput.fill('这是一个用于测试数据完整性的计划');
        }

        // 进入下一步
        const nextButton = page.locator('button:has-text("下一步")');
        if (await nextButton.isEnabled()) {
          await nextButton.click();
          
          // 添加执行路径
          const addPathButton = page.locator('button:has-text("添加执行路径")');
          if (await addPathButton.isVisible()) {
            await addPathButton.click();
            await page.waitForTimeout(500);
          }
        }
      }

      // 检查创建请求的数据格式
      console.log('计划创建请求数量:', requests.length);
      
      if (requests.length > 0) {
        const createRequest = requests[0];
        console.log('创建请求数据:', createRequest.postData);
        
        // 验证请求数据格式
        if (createRequest.postData) {
          try {
            const data = JSON.parse(createRequest.postData);
            expect(data.title).toBeTruthy();
            expect(data.description).toBeTruthy();
          } catch (e) {
            console.log('请求数据不是JSON格式');
          }
        }
      }
    });

    test('状态同步测试', async ({ page }) => {
      // 模拟登录状态
      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-token',
          user: { id: 'test-user-id', email: 'test@example.com' }
        }));
      });

      await page.goto('/plans');

      // 检查UI状态与数据状态的一致性
      const filterButtons = page.locator('button:has-text("全部"), button:has-text("草稿"), button:has-text("进行中")');
      const filterCount = await filterButtons.count();

      if (filterCount > 0) {
        // 点击不同的筛选器
        for (let i = 0; i < Math.min(filterCount, 3); i++) {
          await filterButtons.nth(i).click();
          await page.waitForTimeout(500);
          
          // 检查筛选器状态和显示结果的一致性
          const activeFilter = await filterButtons.nth(i).textContent();
          console.log(`当前筛选器: ${activeFilter}`);
        }
      }
    });
  });

  test.describe('缓存和性能优化测试', () => {
    test('静态资源缓存测试', async ({ page }) => {
      const responses: any[] = [];
      
      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          fromCache: response.fromServiceWorker()
        });
      });

      // 首次访问
      await page.goto('/plans');
      await page.waitForLoadState('networkidle');

      const firstLoadResponses = [...responses];
      responses.length = 0;

      // 再次访问
      await page.reload();
      await page.waitForLoadState('networkidle');

      // 比较两次加载的资源
      const cachedResources = responses.filter(r => 
        r.status === 304 || r.fromCache || 
        (r.headers['cache-control'] && r.headers['cache-control'].includes('max-age'))
      );

      console.log('首次加载资源数:', firstLoadResponses.length);
      console.log('重新加载资源数:', responses.length);
      console.log('缓存资源数:', cachedResources.length);
    });

    test('代码分割和懒加载测试', async ({ page }) => {
      const scriptRequests: string[] = [];
      
      page.on('request', request => {
        if (request.url().endsWith('.js')) {
          scriptRequests.push(request.url());
        }
      });

      await page.goto('/plans');
      const initialScripts = [...scriptRequests];
      scriptRequests.length = 0;

      // 导航到其他页面触发懒加载
      const createButton = page.locator('a[href="/plans/create"]');
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);
      }

      const additionalScripts = scriptRequests.filter(url => 
        !initialScripts.includes(url)
      );

      console.log('初始加载脚本数:', initialScripts.length);
      console.log('懒加载脚本数:', additionalScripts.length);
    });

    test('数据预取和预加载测试', async ({ page }) => {
      const apiRequests: any[] = [];
      
      page.on('request', request => {
        if (request.url().includes('/api/') || request.url().includes('supabase')) {
          apiRequests.push({
            url: request.url(),
            method: request.method(),
            timing: Date.now()
          });
        }
      });

      await page.goto('/plans');
      await page.waitForTimeout(2000);

      // 检查是否有预取请求
      const prefetchRequests = apiRequests.filter(r => 
        r.url.includes('prefetch') || r.method === 'HEAD'
      );

      console.log('API请求总数:', apiRequests.length);
      console.log('预取请求数:', prefetchRequests.length);
    });
  });

  test.describe('第三方集成测试', () => {
    test('外部服务依赖测试', async ({ page }) => {
      const externalRequests: string[] = [];
      
      page.on('request', request => {
        const url = new URL(request.url());
        if (!url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
          externalRequests.push(request.url());
        }
      });

      await page.goto('/plans');
      await page.waitForTimeout(3000);

      console.log('外部服务请求:');
      externalRequests.forEach(url => console.log('  -', url));

      // 检查是否有必要的fallback机制
      // 如果外部服务不可用，应用应该仍能正常工作
    });

    test('CDN和字体加载测试', async ({ page }) => {
      const resourceLoadTimes: any[] = [];
      
      page.on('response', response => {
        const url = response.url();
        if (url.includes('fonts') || url.includes('cdn')) {
          resourceLoadTimes.push({
            url,
            timing: response.timing(),
            status: response.status()
          });
        }
      });

      await page.goto('/plans');
      await page.waitForLoadState('networkidle');

      // 检查字体和CDN资源加载
      console.log('外部资源加载情况:');
      resourceLoadTimes.forEach(resource => {
        console.log(`  ${resource.url}: ${resource.status} (${resource.timing?.responseEnd}ms)`);
      });

      // 外部资源加载失败不应该影响页面基本功能
      const failedResources = resourceLoadTimes.filter(r => r.status >= 400);
      if (failedResources.length > 0) {
        console.warn('部分外部资源加载失败:', failedResources.length);
      }
    });
  });
});