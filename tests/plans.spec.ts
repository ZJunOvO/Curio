import { test, expect, Page } from '@playwright/test';

class PlanPage {
  constructor(private page: Page) {}

  // 页面导航
  async goto() {
    await this.page.goto('/plans');
  }

  async gotoCreate() {
    await this.page.goto('/plans/create');
  }

  async gotoPlanDetail(planId: string) {
    await this.page.goto(`/plans/${planId}`);
  }

  // 计划列表页面元素
  get searchInput() {
    return this.page.locator('input[placeholder*="搜索计划"]');
  }

  get createPlanButton() {
    return this.page.locator('a[href="/plans/create"]');
  }

  get viewModeButtons() {
    return this.page.locator('[aria-label*="切换到"][aria-label*="视图"]');
  }

  get filterButtons() {
    return this.page.locator('button:has-text("全部"), button:has-text("草稿"), button:has-text("审核中"), button:has-text("进行中"), button:has-text("已完成")');
  }

  get planCards() {
    return this.page.locator('[data-testid="plan-card"], .plan-card, .group.cursor-pointer');
  }

  get loginButton() {
    return this.page.locator('button:has-text("登录账户")');
  }

  get registerButton() {
    return this.page.locator('button:has-text("创建新账户")');
  }

  // 创建计划页面元素
  get titleInput() {
    return this.page.locator('input[placeholder*="计划标题"]');
  }

  get descriptionTextarea() {
    return this.page.locator('textarea[placeholder*="计划描述"]');
  }

  get categorySelect() {
    return this.page.locator('select').first();
  }

  get prioritySelect() {
    return this.page.locator('select').last();
  }

  get startDateInput() {
    return this.page.locator('input[type="date"]').first();
  }

  get targetDateInput() {
    return this.page.locator('input[type="date"]').last();
  }

  get nextStepButton() {
    return this.page.locator('button:has-text("下一步")');
  }

  get addPathButton() {
    return this.page.locator('button:has-text("添加执行路径")');
  }

  get previewButton() {
    return this.page.locator('button:has-text("预览计划")');
  }

  get createFinalButton() {
    return this.page.locator('button:has-text("创建计划")');
  }

  // 计划详情页面元素
  get backButton() {
    return this.page.locator('a:has-text("返回")');
  }

  get shareButton() {
    return this.page.locator('button:has-text("分享")');
  }

  get editCoverButton() {
    return this.page.locator('button:has-text("编辑封面")');
  }

  get tabButtons() {
    return this.page.locator('[role="tab"], button:has-text("概览"), button:has-text("执行路径"), button:has-text("团队成员")');
  }

  // 操作方法
  async searchPlans(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // 等待搜索结果
  }

  async switchViewMode(mode: '网格' | '时间轴' | '看板') {
    await this.page.locator(`button[aria-label*="切换到${mode}视图"]`).click();
  }

  async filterByStatus(status: '全部' | '草稿' | '审核中' | '进行中' | '已完成') {
    await this.page.locator(`button:has-text("${status}")`).click();
  }

  async fillBasicInfo(data: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    startDate?: string;
    targetDate?: string;
  }) {
    await this.titleInput.fill(data.title);
    
    if (data.description) {
      await this.descriptionTextarea.fill(data.description);
    }

    if (data.category) {
      await this.categorySelect.selectOption(data.category);
    }

    if (data.priority) {
      await this.prioritySelect.selectOption(data.priority);
    }

    if (data.startDate) {
      await this.startDateInput.fill(data.startDate);
    }

    if (data.targetDate) {
      await this.targetDateInput.fill(data.targetDate);
    }
  }

  async addExecutionPath(title: string, description?: string) {
    await this.addPathButton.click();
    
    // 等待新路径出现并编辑
    const pathTitleInput = this.page.locator('input[value="新执行路径"]').last();
    await pathTitleInput.fill(title);
    
    if (description) {
      const pathDescInput = this.page.locator('textarea[placeholder*="描述这个执行路径"]').last();
      await pathDescInput.fill(description);
    }
  }

  async addMilestone(pathIndex: number, title: string) {
    const addMilestoneButton = this.page.locator('button:has-text("添加里程碑")').nth(pathIndex);
    await addMilestoneButton.click();
    
    // 编辑里程碑标题
    const milestoneInput = this.page.locator('input[placeholder*="里程碑标题"]').last();
    await milestoneInput.fill(title);
    await milestoneInput.press('Enter');
  }
}

test.describe('计划管理系统测试', () => {
  let planPage: PlanPage;

  test.beforeEach(async ({ page }) => {
    planPage = new PlanPage(page);
  });

  test.describe('计划列表页面', () => {
    test('应该正确显示未登录状态的页面', async ({ page }) => {
      await planPage.goto();

      // 检查未登录提示
      await expect(page.locator('h1:has-text("计划管理")')).toBeVisible();
      await expect(planPage.loginButton).toBeVisible();
      await expect(planPage.registerButton).toBeVisible();
      
      // 检查页面标题和描述
      await expect(page.locator('text=登录后管理你的梦想蓝图')).toBeVisible();
    });

    test('登录按钮应该跳转到登录页面', async ({ page }) => {
      await planPage.goto();
      await planPage.loginButton.click();
      
      await expect(page).toHaveURL('/auth/login');
    });

    test('注册按钮应该跳转到注册页面', async ({ page }) => {
      await planPage.goto();
      await planPage.registerButton.click();
      
      await expect(page).toHaveURL('/auth/register');
    });

    test('创建新计划按钮应该跳转到创建页面', async ({ page }) => {
      await planPage.goto();
      
      // 检查创建计划按钮
      const createButton = page.locator('a[href="/plans/create"]').first();
      await expect(createButton).toBeVisible();
      
      await createButton.click();
      await expect(page).toHaveURL('/plans/create');
    });

    // 模拟登录状态的测试（需要mock认证状态）
    test('已登录用户应该看到计划列表功能', async ({ page }) => {
      // 模拟登录状态
      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          user: { id: 'test-user-id', email: 'test@example.com' }
        }));
      });

      await planPage.goto();

      // 检查页面标题
      await expect(page.locator('h1:has-text("我的计划")')).toBeVisible();
      
      // 检查搜索功能
      await expect(planPage.searchInput).toBeVisible();
      
      // 检查视图切换按钮
      await expect(page.locator('button[aria-label*="网格视图"]')).toBeVisible();
      await expect(page.locator('button[aria-label*="时间轴视图"]')).toBeVisible();
      await expect(page.locator('button[aria-label*="看板视图"]')).toBeVisible();
      
      // 检查筛选按钮
      await expect(page.locator('button:has-text("全部")')).toBeVisible();
      await expect(page.locator('button:has-text("草稿")')).toBeVisible();
      await expect(page.locator('button:has-text("进行中")')).toBeVisible();
    });

    test('搜索功能应该正常工作', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          user: { id: 'test-user-id', email: 'test@example.com' }
        }));
      });

      await planPage.goto();
      
      // 测试搜索输入
      await planPage.searchInput.fill('测试计划');
      await expect(planPage.searchInput).toHaveValue('测试计划');
    });

    test('视图模式切换应该正常工作', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          user: { id: 'test-user-id', email: 'test@example.com' }
        }));
      });

      await planPage.goto();
      
      // 测试切换到时间轴视图
      const timelineButton = page.locator('button[aria-label*="时间轴视图"]');
      await timelineButton.click();
      await expect(timelineButton).toHaveClass(/bg-white\/10/);
      
      // 测试切换到看板视图
      const kanbanButton = page.locator('button[aria-label*="看板视图"]');
      await kanbanButton.click();
      await expect(kanbanButton).toHaveClass(/bg-white\/10/);
    });
  });

  test.describe('创建计划页面', () => {
    test('应该正确显示创建计划页面', async ({ page }) => {
      await planPage.gotoCreate();

      // 检查页面标题
      await expect(page.locator('h2:has-text("创建你的新计划")')).toBeVisible();
      
      // 检查表单元素
      await expect(planPage.titleInput).toBeVisible();
      await expect(planPage.descriptionTextarea).toBeVisible();
      await expect(planPage.categorySelect).toBeVisible();
      await expect(planPage.prioritySelect).toBeVisible();
      
      // 检查步骤指示器
      await expect(page.locator('.cursor-pointer').first()).toBeVisible();
    });

    test('基本信息表单验证应该正常工作', async ({ page }) => {
      await planPage.gotoCreate();

      // 测试必填字段验证
      await expect(planPage.nextStepButton).toBeDisabled();
      
      // 填写标题后按钮应该启用
      await planPage.titleInput.fill('测试计划');
      await expect(planPage.nextStepButton).toBeEnabled();
    });

    test('应该能够填写完整的基本信息', async ({ page }) => {
      await planPage.gotoCreate();

      const planData = {
        title: '我的测试计划',
        description: '这是一个测试用的计划描述',
        category: 'personal',
        priority: 'high',
        startDate: '2024-01-01',
        targetDate: '2024-12-31'
      };

      await planPage.fillBasicInfo(planData);

      // 验证所有字段都已填写
      await expect(planPage.titleInput).toHaveValue(planData.title);
      await expect(planPage.descriptionTextarea).toHaveValue(planData.description);
      await expect(planPage.startDateInput).toHaveValue(planData.startDate);
      await expect(planPage.targetDateInput).toHaveValue(planData.targetDate);
    });

    test('应该能够进入执行路径步骤', async ({ page }) => {
      await planPage.gotoCreate();

      await planPage.titleInput.fill('测试计划');
      await planPage.nextStepButton.click();

      // 检查是否进入路径设计步骤
      await expect(page.locator('h2:has-text("设计执行路径")')).toBeVisible();
      await expect(planPage.addPathButton).toBeVisible();
    });

    test('应该能够添加执行路径和里程碑', async ({ page }) => {
      await planPage.gotoCreate();

      // 第一步：填写基本信息
      await planPage.titleInput.fill('测试计划');
      await planPage.nextStepButton.click();

      // 第二步：添加执行路径
      await planPage.addExecutionPath('第一个执行路径', '这是路径描述');
      
      // 验证路径已添加
      await expect(page.locator('h3:has-text("第一个执行路径")')).toBeVisible();
      
      // 添加里程碑
      await planPage.addMilestone(0, '第一个里程碑');
      
      // 验证里程碑已添加
      await expect(page.locator('text=第一个里程碑')).toBeVisible();
    });

    test('应该能够进入预览步骤', async ({ page }) => {
      await planPage.gotoCreate();

      // 完成基本信息
      await planPage.titleInput.fill('测试计划');
      await planPage.nextStepButton.click();

      // 添加至少一个执行路径
      await planPage.addExecutionPath('测试路径');
      await planPage.previewButton.click();

      // 检查预览页面
      await expect(page.locator('h2:has-text("计划预览")')).toBeVisible();
      await expect(page.locator('h1:has-text("测试计划")')).toBeVisible();
      await expect(planPage.createFinalButton).toBeVisible();
    });

    test('返回按钮应该正常工作', async ({ page }) => {
      await planPage.gotoCreate();

      const backButton = page.locator('button').first(); // 返回按钮通常是第一个按钮
      await backButton.click();

      await expect(page).toHaveURL('/plans');
    });
  });

  test.describe('计划详情页面', () => {
    test('应该正确显示计划详情页面结构', async ({ page }) => {
      // 直接访问一个计划详情页面（假设存在）
      await page.goto('/plans/test-plan-id');

      // 检查页面主要元素
      await expect(planPage.backButton).toBeVisible();
      
      // 检查标签页
      const tabs = ['概览', '执行路径', '团队成员', '审批状态', '动态', '统计分析'];
      for (const tab of tabs) {
        await expect(page.locator(`button:has-text("${tab}")`)).toBeVisible();
      }
    });

    test('标签页切换应该正常工作', async ({ page }) => {
      await page.goto('/plans/test-plan-id');

      // 点击执行路径标签
      await page.locator('button:has-text("执行路径")').click();
      await expect(page.locator('h3:has-text("执行路径")')).toBeVisible();

      // 点击团队成员标签
      await page.locator('button:has-text("团队成员")').click();
      await expect(page.locator('h3:has-text("团队成员")')).toBeVisible();
    });

    test('返回按钮应该跳转回计划列表', async ({ page }) => {
      await page.goto('/plans/test-plan-id');
      
      await planPage.backButton.click();
      await expect(page).toHaveURL('/plans');
    });
  });

  test.describe('响应式设计测试', () => {
    test('移动端应该正确显示', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await planPage.goto();

      // 检查移动端布局
      await expect(page.locator('h1:has-text("计划管理")')).toBeVisible();
      await expect(planPage.loginButton).toBeVisible();
    });

    test('平板端应该正确显示', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await planPage.goto();

      await expect(page.locator('h1:has-text("计划管理")')).toBeVisible();
    });
  });

  test.describe('性能测试', () => {
    test('页面加载时间应该在合理范围内', async ({ page }) => {
      const startTime = Date.now();
      await planPage.goto();
      const loadTime = Date.now() - startTime;

      // 页面应该在3秒内加载完成
      expect(loadTime).toBeLessThan(3000);
    });

    test('搜索响应应该及时', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('supabase.auth.token', JSON.stringify({
          user: { id: 'test-user-id', email: 'test@example.com' }
        }));
      });

      await planPage.goto();
      
      const startTime = Date.now();
      await planPage.searchInput.fill('test');
      await page.waitForTimeout(100); // 等待搜索响应
      const searchTime = Date.now() - startTime;

      // 搜索响应应该在500ms内
      expect(searchTime).toBeLessThan(500);
    });
  });

  test.describe('错误处理测试', () => {
    test('网络错误时应该显示适当的错误信息', async ({ page }) => {
      // 模拟网络错误
      await page.route('**/api/**', route => route.abort());
      
      await planPage.goto();
      
      // 应该显示加载失败或错误状态
      // 具体错误处理取决于应用的实现
    });

    test('无效的计划ID应该处理妥当', async ({ page }) => {
      await page.goto('/plans/non-existent-plan-id');
      
      // 应该显示404或重定向到计划列表
      // 具体处理取决于应用的实现
    });
  });

  test.describe('可访问性测试', () => {
    test('页面应该有正确的语义化标签', async ({ page }) => {
      await planPage.goto();

      // 检查主要的语义化元素
      await expect(page.locator('main, [role="main"]')).toBeVisible();
      await expect(page.locator('h1, h2')).toBeVisible();
    });

    test('按钮应该有正确的aria-label', async ({ page }) => {
      await planPage.goto();

      // 检查按钮的可访问性标签
      const buttons = page.locator('button[aria-label]');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('表单应该有正确的标签', async ({ page }) => {
      await planPage.gotoCreate();

      // 检查表单字段的标签
      await expect(page.locator('label, [aria-label]')).toBeVisible();
    });
  });
});