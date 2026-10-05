# 键盘车神教圈速榜

### DEMO

[键盘车神教圈速榜](http://speed.bytegeek.icu/)
<img width="2450" height="1447" alt="image" src="https://github.com/user-attachments/assets/0f3397f2-9cae-4f17-94b5-c2f7fd40b9a0" />

2026.3.12
fix:解决了跨域请求资源的问题

2026.3.17
add:添加了按车型、马力、圈速、气温、尾速、0-100、价格、改装程度排序

现在可以不部署服务即可本地预览数据

index.html 里新增了 3 个本地数据脚本（js/data/speed.js、js/data/goldport.js、js/data/bigV.js），在 js/index.js 前加载。这样 file:// 打开时不再走 XHR 读取 JSON，自然不会再触发 CORS。.

重构了数据加载逻辑：

file:// 下直接读取 window.__KBRACER_LOCAL_DATA__（来自上面 3 个脚本）并渲染表格；

http(s):// 下继续沿用原来的 $.ajax 读取 *.json。
这样部署到静态服务器后，后续只更新 JSON 也仍然生效。.

新增了本地数据脚本文件，分别把当前三份 JSON 映射到全局对象字段（speed/goldport/bigV），用于 file:// 场景兜底。

* 已为三个榜单表头增加可排序字段标记（`data-sort-key` + `sortable`），支持按车型、马力、圈速、气温、尾速、0-100、改装程度排序；大V榜还支持按车手排序。.
* 在前端逻辑中新增了统一排序状态与排序流程：为每个表维护独立排序状态（默认按圈速升序），并把“筛选/搜索/数据加载”与排序整合，确保筛选后仍按当前排序规则展示。.
* 新增了可视化排序指示样式（↕/↑/↓）与可点击表头交互样式，便于用户识别当前排序方向
* 

![1773714104337](images/README/1773714104337.png)

