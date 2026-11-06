import { chromium } from 'playwright';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:430,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///workspace/面试工作台-预览版.html');
await p.waitForTimeout(900);

console.log('版本:', await p.evaluate(()=>APP_VERSION));

// 导航切换
for(const t of ['resume','jd','qa','work']){
  await p.click(`#bottomNav .nav-item[data-tab="${t}"]`);
  await p.waitForTimeout(350);
  const ok = await p.evaluate((tk)=>{
    const a=document.querySelector('.content-area.active');
    return a && a.id==='tab-'+tk;
  }, t);
  console.log(`切到${t}:`, ok?'✅':'❌');
}

// 底部导航点击可用性（关键bug）
const navClickable = await p.evaluate(()=>{
  const n=document.querySelector('#bottomNav .nav-item[data-tab="jd"]');
  return n && n.onclick!==null || n.getClientRects().length>0;
});
console.log('导航可点:', navClickable);

// 空白检测
const layout = await p.evaluate(()=>{
  const a=document.querySelector('.content-area.active');
  const h=document.querySelector('.header').getBoundingClientRect().bottom;
  return {内容区顶部: Math.round(a.getBoundingClientRect().top), header底部: Math.round(h)};
});
console.log('布局:', JSON.stringify(layout));

// 版本按钮存在
console.log('版本按钮:', await p.evaluate(()=>!!document.querySelector('[onclick="showVersionInfo()"]')));
// 卡片编辑按钮
console.log('卡片编辑按钮数:', await p.evaluate(()=>document.querySelectorAll('.card-edit-btn').length));
console.log('错误:', errs.length?errs:'无');
await p.screenshot({path:'/tmp/preview.png'});
await b.close();
