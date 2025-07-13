import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { type Plan } from './mock-plans';

// 创建计划的HTML内容用于导出
export const createPlanExportHTML = (plan: Plan, shareUrl?: string): string => {
  const completedTasks = plan.metrics.completedTasks;
  const totalTasks = plan.metrics.totalTasks;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${plan.title} - 计划详情</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .title {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 10px;
          color: #1a1a1a;
        }
        .description {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 20px;
        }
        .meta-info {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
          font-size: 0.9rem;
          color: #888;
        }
        .progress-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          border-radius: 20px;
          margin: 40px 0;
          text-align: center;
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
          backdrop-filter: blur(20px);
        }
        .progress-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(#4ade80 ${progressPercentage * 3.6}deg, rgba(255,255,255,0.3) 0deg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          position: relative;
        }
        .progress-circle::before {
          content: '';
          width: 80px;
          height: 80px;
          background: #667eea;
          border-radius: 50%;
          position: absolute;
        }
        .progress-text {
          position: relative;
          z-index: 1;
          font-size: 1.5rem;
          font-weight: bold;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .metric-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          padding: 25px;
          border-radius: 16px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .metric-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #495057;
          margin-bottom: 5px;
        }
        .metric-label {
          color: #6c757d;
          font-size: 0.9rem;
        }
        .paths-section {
          margin: 40px 0;
        }
        .section-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 30px 0 20px 0;
          color: #1a1a1a;
          background: linear-gradient(135deg, #667eea, #764ba2);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
          padding-left: 20px;
        }
        .section-title::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 2px;
        }
        .path {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
        .path-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .path-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #1a1a1a;
        }
        .path-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-completed { background: #d4edda; color: #155724; }
        .status-in-progress { background: #cce7ff; color: #004085; }
        .status-planning { background: #fff3cd; color: #856404; }
        .status-paused { background: #f8d7da; color: #721c24; }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin: 10px 0;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: width 0.3s ease;
        }
        .milestones {
          margin-top: 15px;
        }
        .milestone {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .milestone:last-child {
          margin-bottom: 0;
        }
        .milestone-status {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .milestone-completed {
          background: #28a745;
        }
        .milestone-pending {
          border: 2px solid #6c757d;
          background: transparent;
        }
        .milestone-title {
          flex: 1;
          font-weight: 500;
        }
        .milestone-date {
          font-size: 0.8rem;
          color: #6c757d;
        }
        .team-section, .tags-section {
          margin: 30px 0;
        }
        .team-members {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        .member {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          padding: 10px 16px;
          border-radius: 25px;
          font-size: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .member-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #667eea;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: bold;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .tag {
          background: rgba(102, 126, 234, 0.15);
          color: #667eea;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }
        .footer {
          margin-top: 60px;
          padding: 30px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          text-align: center;
          color: #6c757d;
          font-size: 0.9rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
        }
        .qr-section {
          text-align: center;
          margin: 40px 0;
          padding: 30px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .qr-section { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${plan.title}</h1>
        <p class="description">${plan.description}</p>
        <div class="meta-info">
          <span>📅 开始日期：${new Date(plan.startDate).toLocaleDateString('zh-CN')}</span>
          <span>🎯 目标日期：${new Date(plan.targetDate).toLocaleDateString('zh-CN')}</span>
          <span>👥 团队成员：${plan.members.length}人</span>
          <span>📊 分类：${plan.category}</span>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-circle">
          <div class="progress-text">${plan.progress}%</div>
        </div>
        <h3>整体进度</h3>
        <p>已完成 ${completedTasks} / ${totalTasks} 项任务</p>
      </div>

      <div class="metrics">
        <div class="metric-card">
          <div class="metric-value">${completedTasks}/${totalTasks}</div>
          <div class="metric-label">任务完成情况</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${plan.progress}%</div>
          <div class="metric-label">整体进度</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${plan.paths.length}</div>
          <div class="metric-label">执行路径</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${plan.members.length}</div>
          <div class="metric-label">团队成员</div>
        </div>
      </div>

      <div class="paths-section">
        <h2 class="section-title">执行路径</h2>
        ${plan.paths.map(path => `
          <div class="path">
            <div class="path-header">
              <div class="path-title">${path.title}</div>
              <span class="path-status status-${path.status}">
                ${path.status === 'completed' ? '已完成' :
                  path.status === 'in_progress' ? '进行中' :
                  path.status === 'paused' ? '已暂停' : '计划中'}
              </span>
            </div>
            <p style="color: #666; margin-bottom: 15px;">${path.description}</p>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${path.progress}%"></div>
            </div>
            <div style="text-align: right; font-size: 0.9rem; color: #666; margin-bottom: 15px;">
              进度：${path.progress}%
            </div>
            <div class="milestones">
              <h4 style="margin-bottom: 10px; color: #495057;">里程碑</h4>
              ${path.milestones.map(milestone => `
                <div class="milestone">
                  <div class="milestone-status ${milestone.completed ? 'milestone-completed' : 'milestone-pending'}"></div>
                  <div class="milestone-title">${milestone.title}</div>
                  <div class="milestone-date">${new Date(milestone.date).toLocaleDateString('zh-CN')}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="team-section">
        <h2 class="section-title">团队成员</h2>
        <div class="team-members">
          ${plan.members.map(member => `
            <div class="member">
              <div class="member-avatar">${member.name.charAt(0)}</div>
              <span>${member.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="tags-section">
        <h2 class="section-title">标签</h2>
        <div class="tags">
          ${plan.tags.map(tag => `
            <span class="tag">${tag}</span>
          `).join('')}
        </div>
      </div>

      ${shareUrl ? `
        <div class="qr-section">
          <h3>扫码查看在线版本</h3>
          <div id="qr-code" style="margin: 20px auto; width: 150px; height: 150px;"></div>
          <p style="font-size: 0.8rem; color: #666;">
            扫描二维码或访问：<br>
            <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">${shareUrl}</code>
          </p>
        </div>
      ` : ''}

      <div class="footer">
        <p>由 <strong>品镜 (Curio)</strong> 生成 • ${new Date().toLocaleString('zh-CN')}</p>
        <p>这份报告展示了计划的当前状态和进度信息</p>
      </div>
    </body>
    </html>
  `;
};

// 生成二维码
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('生成二维码失败:', error);
    throw new Error('生成二维码失败');
  }
};

// 导出为PDF
export const exportToPDF = async (plan: Plan, shareUrl?: string): Promise<void> => {
  try {
    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.innerHTML = createPlanExportHTML(plan, shareUrl);
    document.body.appendChild(tempContainer);

    // 如果有分享链接，生成二维码
    if (shareUrl) {
      const qrCodeImg = document.createElement('img');
      qrCodeImg.src = await generateQRCode(shareUrl);
      qrCodeImg.style.width = '150px';
      qrCodeImg.style.height = '150px';
      const qrContainer = tempContainer.querySelector('#qr-code');
      if (qrContainer) {
        qrContainer.appendChild(qrCodeImg);
      }
    }

    // 等待图片加载完成
    await new Promise(resolve => setTimeout(resolve, 500));

    // 使用html2canvas生成canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // 创建PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4宽度
    const pageHeight = 295; // A4高度
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // 添加第一页
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 如果内容超过一页，添加更多页面
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 下载PDF
    const fileName = `${plan.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_计划详情.pdf`;
    pdf.save(fileName);

    // 清理临时容器
    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error('PDF导出失败:', error);
    throw new Error('PDF导出失败');
  }
};

// 导出为图片
export const exportToImage = async (plan: Plan, format: 'png' | 'jpeg', shareUrl?: string): Promise<void> => {
  try {
    // 创建临时容器
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.innerHTML = createPlanExportHTML(plan, shareUrl);
    document.body.appendChild(tempContainer);

    // 如果有分享链接，生成二维码
    if (shareUrl) {
      const qrCodeImg = document.createElement('img');
      qrCodeImg.src = await generateQRCode(shareUrl);
      qrCodeImg.style.width = '150px';
      qrCodeImg.style.height = '150px';
      const qrContainer = tempContainer.querySelector('#qr-code');
      if (qrContainer) {
        qrContainer.appendChild(qrCodeImg);
      }
    }

    // 等待图片加载完成
    await new Promise(resolve => setTimeout(resolve, 500));

    // 使用html2canvas生成canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // 创建下载链接
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${plan.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_计划详情.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, `image/${format}`, format === 'jpeg' ? 0.9 : 1.0);

    // 清理临时容器
    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error(`${format.toUpperCase()}导出失败:`, error);
    throw new Error(`${format.toUpperCase()}导出失败`);
  }
};

// 生成分享链接
export const generateShareLink = async (plan: Plan): Promise<string> => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 生成唯一的分享ID
    const shareId = `${plan.id}-${Date.now()}`;
    const shareLink = `${window.location.origin}/share/${shareId}`;
    
    // 在实际应用中，这里应该调用后端API保存分享记录
    // const response = await fetch('/api/shares', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ planId: plan.id, shareId })
    // });
    
    return shareLink;
  } catch (error) {
    console.error('生成分享链接失败:', error);
    throw new Error('生成分享链接失败');
  }
}; 