---
key: Cryptid-web-assistant
layout: article
title: 诡影寻踪网页小助手（测试版）
tags: JS Canvas Cryptid
articles:
  excerpt_type: html
  mathjax: true
header:
  theme: dark
  background: 'linear-gradient(135deg, rgb(34, 139, 87), rgb(139, 34, 139))'
article_header:
  type: overlay
  theme: dark
  background_color: '#203028'
  background_image:
    gradient: 'linear-gradient(135deg, rgba(34, 139, 87 , .4), rgba(139, 34, 139, .4))'
    src: /assets/images/2021-11-10-Web-Cryptid/cryptid-urban-shadows-artwork.jpg
---

本项目旨在帮助提升诡影寻踪的线下游戏体验。
<!--more-->

整个小助手的demo在这里，目前功能仍在开发中
[demo](/assets/vue_proj/cryptid/index.html)

### 特性描述

1. 全自动生成地图和代码
2. 手动编辑地图排布和旋转
3. 线索checklist帮助记忆
4. 地图可点击进行遮蔽和显示，减少思考量
5. 代码可以进行复制粘贴以帮助每个玩家得到一样的地图，节约手动排布时间

### 后续计划

1. 添加小屋和石柱的手动编辑
2. 根据线索自动遮蔽不可能区域
3. 添加地图和线索自动生成，完全摆脱play cryptid那个网站的依赖
4. 根据每个玩家的已有线索制作独立的地图展示，并自动计算可能的线索（纯挖坑，不一定填，逃