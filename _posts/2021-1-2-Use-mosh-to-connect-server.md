---
layout: article
title: 和broken-pipe说bye-bye，用mosh连接服务器
tags: SSH Server
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
    src: /assets/images/2021-1-2-Use-mosh-to-connect-server/terminal.png
---

最近基本一直呆在实验室，为了写我的linux实验的报告，免不了需要用到寝室电脑里的虚拟机环境。
<!--more-->
于是总是需要从手头的mac远程连接到寝室的虚拟机里，然后在上面跑实验。本来的想法是租个什么阿里云腾讯云的云服务器来搞端口转发，这样的话就可以访问位于内网中的寝室电脑。但是国内带宽的价格贵的不行，那些云服务器本身配置只有1M带宽，1核2G内存，就这配置即使算上学生优惠一年也得100块出头。回想了一下国外的云服务厂商的价格和配置，顿时感觉国内的网络基础建设还有待提升。。。

再仔细一想，自己的需求无非就是远程的命令行连接，那还花这钱干啥，直接用免费的frp就完事了。搜索了一波，看到一个[sakurafrp](https://www.natfrp.com/)，一个月5g流量，免费的五个端口转发，反正我对连接的速度没啥需求，流量需求也不高，只能说白嫖党狂喜。按部就班的在寝室电脑的ubuntu里配好frpc，把服务器地址端口啥的填一填，于是相当顺利的连到了寝室的电脑。

本来这个故事到这里应该就到头了。但正当我在实验室美滋滋的用着早已经配好的vim改寝室电脑上的代码的时候，我切出去查了一会资料。等我切回来的时候，敲了几下键盘发现冰冷的屏幕没有半点反应，然后就看到了一行broken pipe。。。爷的代码啊。。。

![被迫断开连接](/assets/images/2021-1-2-Use-mosh-to-connect-server/ssh-broken-pipe.png)

## 解决方案

之前基本上都是有事才会连，每次用完直接exit的我哪见过这场面，这奢侈的tcp长连接直接被老谋深算的server断开了。。

痛定思痛，我决定从根本上解决这个问题。先去看一眼iterm2的社区，我相信广大的mac使用者们一定会给我一个满意的答案。

### 方案1，让iterm2自己动

在iterm2的preferences里可以配置profile，其中有个配置项就是session，在最下面就有一个idle时的处理方法，简单的来说就是每xx秒就发送一个字符，让tcp连接保持活跃，不被server断开。。
这种配置实在是过于愚蠢，导致我连尝试的想法都没有。。大概这就是客户端能做到的极限了吧。

![奇怪的配置知识增加了](/assets/images/2021-1-2-Use-mosh-to-connect-server/iterm2-ssh-idle-action.png)

### 方案2，修改客户端的ssh配置

既然客户端没法解决这个问题，那就去看看ssh本身有没有解决的方法，随手一搜果然还是有的。

> 正确的做法是，通过配置 ServerAliveInterval 来实现，在 ~/.ssh/config 中加入： ServerAliveInterval=30
> ServerAliveInterval 30 #表示ssh客户端每隔30秒给远程主机发送一个no-op包，no-op是无任何操作的意思，这样远程主机就不会关闭这个SSH会话。

这个方案看起来就比方案1看起来靠谱多了，我只需要修改本地的ssh配置，就可以让我的连接多活一会。但是我总觉得这个方案依旧不够完美，手动设置一个超时时间，在ssh的配置文件里塞一个*magic number*总是让我心里有点不爽。。同时这也不是一个根本上解决问题的方案，tcp的连接该断还是会断。

既然tcp只能做到这一步，那。。。我不做人（tcp）啦

### 最终解决方案，Mosh

tcp总要面对连接保持的问题，但是我们的场景又不是需要稳定长连接的场景，不管是网络波动还是长久没有活动并不代表我们想要结束这个session，那我们为什么不用udp呢？

Mosh就是一个udp版的ssh，他有几个非常强大的特点，第一就是终端的终止不会终止当前的session，就好像开了一个screen的session一样；第二就是如果网络不佳，断开了连接，当网络恢复的时候他会自动连回去；第三是不同于ssh需要等待服务端的回应再显示输入，如果连接延迟很高，那么输入的延迟会让人无法忍受。但是mosh可以在本地完成输入，立刻显示内容，在连接不好的时候，提前输入的内容会以下划线的形式展示给用户。

安装也非常的简单，mac上直接`brew install mosh`, linux上直接`sudo apt install mosh`就完事了。然后把mosh的默认端口60001也转发一下，就完成了udp连接。

![直接开始一把梭](/assets/images/2021-1-2-Use-mosh-to-connect-server/code-yibasuo.png)
