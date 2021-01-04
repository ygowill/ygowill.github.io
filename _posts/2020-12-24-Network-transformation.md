---
title: 实验室网络改造计划
tags: Network Router
layout: article
articles:
  excerpt_type: html
header:
  theme: dark
  background: 'linear-gradient(135deg, rgb(34, 139, 87), rgb(139, 34, 139))'
article_header:
  type: overlay
  theme: dark
  background_color: '#203028'
  background_image:
    gradient: 'linear-gradient(135deg, rgba(34, 139, 87 , .4), rgba(139, 34, 139, .4))'
    src: /assets/images/2020-12-24-Network-transformation/RGB-LED-Fiber-Optic-Light-LED-Weave-Net-Lights.jpg
---

## 前言
来到实验室已经一个学期了，然而到目前为止实验室wifi一直处于瘫痪状态。。。
<!--more-->

于是总是秉承“又不是不能用”的精神，勉为其难的用学校的uestc-wifi。对于时不时有些需要用到打印机的场合，切换wifi又很麻烦，对于希望把论文打印出来慢慢看的同学们来说，切换wifi这个微不足道的门槛就成为了科研路上的一个绊脚石，是阻碍同学们搞科研的重要原因之一（逃

另外，值得一提的是，对于大部分使用有线的机器来说，尽管使用的是有线，但是网络体验依旧不佳，时不时就会有丢包导致资源加载不出来的情况发生，碰到想打开的网页加载了半天才能打开，打开之后有可能还有资源加载不出来，导致应该有图片的地方变成一个X的情况发生。每次这种情况发生的时候，我就感觉我的血压拉高了，一天的好心情也没了。

终于有一天我忍无可忍的看了一眼实验室路由器的后台，只能感慨说一句，“路由器君，你已经很努力了”。

一台小小的rt-ac53承受了他这个价格不应该承受的压力，用一片单核580MHz的MT7620A和紧巴巴的64MB的内存承担了二十来号人的网络需求。。

根据我的观察在实验室人不多的时候，路由器后台显示的连接数就已经来到了25，cpu压力拉满，内存压力也到了80%左右。这也就是实验室网络问题的源头。

![路由器压力](/assets/images/2020-12-24-Network-transformation/router_pressure.png)

要是人再多上一些，或者点开了什么kdd的论文介绍视频之类的，路由器就更加承受不了了。表现出来的就是丢包，再具体一些就是有的时候视频播放一半直接断流。

为了大伙的科研着想，我决定为改善大家的网络体验出一分力。正好手边实验室配的电脑我平时不怎么用，不如去买一块性价比合适的网卡装上，把电脑改造成软路由，让可怜的rt-ac53老老实实当一根天线，用它的天线履行他作为ap的职责，继续为实验室发光发热。这个方案的好处在于整体的支出只有一块新四口千兆网卡的钱，预计300元左右，若是从闲鱼上捡垃圾，价格估计能压到200以内。相比于买一个新路由器动辄四位数的价格来说，已经是相当具有性价比的方案了。同时，实验室电脑的是i5的cpu，性能不知道比那些低能耗的soc高到哪里去，就是估计有点费电。。

## 改造计划概述

对于目前实验室的网络环境来说，网络拓扑图大概长得像下面这张图一样。

![网络拓扑图](/assets/images/2020-12-24-Network-transformation/network-topo.jpg)

当rt-ac53退休去当天线工具人之后，新员工软路由可以接过他路由器的职责，预计改造后的网络拓扑图应该长这样。

![新网络拓扑图](/assets/images/2020-12-24-Network-transformation/new_network_topo.png)

### 关于软路由的一个极其简略的介绍

路由器说到底就是一个运行在定制硬件（此处指计算平台）上，跑着定制嵌入式系统的一个设备罢了。对于使用定制硬件的专用路由器，有着从硬件到软件的一整套方案，我们可以称为硬路由，而使用通用硬件的平台包括但不限于一般pc，树莓派等，我们称为软路由。对于软件而言，秉承着linux的开源精神，路由器也有很多开源的系统，包括但不限于OpenWRT，RouterOS等等，对于国内的大部分号称智能路由器的系统而言，基本上都是OpenWRT的进一步定制，他们之间的关系就好像android和国内的EMui，MiUI的关系，在此不多做介绍。

另外值得一提的是，由于软路由本身是一个系统，使用通用的硬件平台，因此他甚至可以跑在虚拟机里，只需把网卡直通给他，就可以获得和正常系统一样的性能表现，实验室电脑的内存虽说不多，但是就算实验室的设备加到六七十，想来也是绰绰有余的。

相比于硬路由，由于其嵌入式系统的特殊性，没法为他增加很多定制的功能，但是软路由不同，我们可以给软路由增加各种插件来轻松的增加功能，包括流量控制，广告过滤，负载均衡等等。

### 暂时的想法

* 网卡：intel的I350-T4-V2
* 机器：那台闲置的PC
* 系统：OpenWRT
* 是否虚拟化：还没想好

Pros：

* 价格低廉
* 网络体验进步

Cons：

* 实验室电脑-1
* 需要长期维护
* 原有的存在的一些静态ip无法直接迁移，需要手动分配
* **现在的网络“又不是不能用”**

### 如果觉得这个计划靠谱，就在评论区投一票，攒够了就随机抽一个幸运观众去和邵老师对线批预算（逃