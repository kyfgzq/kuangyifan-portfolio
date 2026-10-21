# 况益帆 · 游戏业务运营作品集

一个纯静态的个人作品集，面向 2027 届秋招的游戏业务运营 / 游戏内容运营岗位。
方向是「游戏 HUD + 玩家档案」：深色街机界面、像素头像、可交互的账号矩阵、AI 工作台和 Canva 文旅作品。

## 本地预览

直接双击 `index.html` 即可；如果浏览器限制本地字体，建议起一个本地静态服务器：

```powershell
cd portfolio
python -m http.server 8080
```

然后打开 `http://localhost:8080/`。

## 文件说明

- `index.html`：主页面（所有内容与账号数据）
- `resume.html`：一页纸简历的打印版（A4，浏览器打印为 PDF 的源文件）
- `assets/KuangYifan-Resume.pdf`：已生成的一页纸简历 PDF
- `assets/accounts/`：6 个抖音账号 + 1 个小红书账号主页截图（WebP）
- `assets/travel/`：文旅海报封面（WebP）
- `assets/ai/`：AI 工作台截图与 AI 设计输出（WebP）
- `assets/brand/`：头像、像素头像、分享图、favicon
- `assets/fonts/`：自托管的站酷庆科黄油体（按 unicode-range 分片）与 Press Start 2P
- `assets/css/style.css`、`assets/js/main.js`：样式与交互

## 部署

这是一个无构建步骤的静态站点。把整个 `portfolio` 文件夹上传到任意静态托管即可：

- Netlify Drop：拖拽文件夹
- Vercel：New Project → 选择该目录，Framework 选 Other
- GitHub Pages：把目录推到仓库，Settings → Pages 选择分支 / 根目录

部署后建议把 `index.html` 里的 `og:image` 改成完整域名地址，例如
`https://your-domain.com/assets/brand/og.jpg`，分享卡片才能稳定显示。

## 数据与链接说明

- 账号数据截取于 **2026.10.21**，来自账号主页公开信息。
- 6 个抖音账号：核心经营 3 个（游戏牛马仙女、我真的争7、游戏在逃海王），协助运营 3 个（传奇押镖人、海马濑人说是、二游兔）。
- 小红书账号：高浓度游戏菌雷电圈（单独统计，不并入抖音矩阵合计）。
- 抖音 / 小红书没有公开的稳定 `sec_uid` / `user_id`，所以卡片里的「打开平台搜索」使用的是平台内搜索深链，并在页面与弹窗里同时展示了账号 ID。若之后拿到直接主页链接，替换以下两处即可：
  - `index.html`：小红书 banner 的 `href`
  - `assets/js/main.js`：`searchUrl()` 函数返回值；以及 `accounts` 对象中每个账号的搜索入口
- 文旅作品的 Canva 链接为原始编辑链接，部分可能需要登录 Canva 才能查看。6 张封面已本地化，HR 不登录也能看到成品。

## 内容更新位置

- 首屏数据、账号卡片、文旅卡片、AI 模块：`index.html`
- 账号弹窗文案、运营笔记、搜索链接：`assets/js/main.js` 的 `accounts` 对象
- 简历内容：`resume.html`，改完后用 Edge / Chrome 打印为 A4 PDF：
  ```powershell
  msedge --headless --no-pdf-header-footer --print-to-pdf="assets/KuangYifan-Resume.pdf" "http://localhost:8080/resume.html"
  ```

## 交互清单

- 首屏像素头像 hover / tap 切换真实照片
- 账号筛选（全部 / 核心 / 协助 / 抖音）、账号详情弹窗、账号 ID 复制
- 游戏品类 tab、内容生产 6 步 pipeline、AI 工作台 3 个 tab
- AI 海报生成流程演示（本地模拟，非实时模型调用）
- 文旅海报 hover 打开 Canva、AI 设计图 lightbox
- 移动端全屏菜单、滚动进度、滚动 reveal、数字 count-up
- 键盘彩蛋：`↑ ↑ ↓ ↓ ← → ← → B A`

## 备注

- 页面中的「自评」属性条与技能条是自我评估，不是第三方测评。
- AI 工作台截图来自实习期间参与项目「喜聚创作台」的记录；AI 设计图标为项目产出示例。
- 账号截图与数据仅用于个人作品集展示，不作为商业宣传物料。
