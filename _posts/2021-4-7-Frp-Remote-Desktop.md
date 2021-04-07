---
key: Use-frp-to-connect-remote-desktop
layout: article
title: 如何用Frp连接remote desktop
tags: Frp Remote-Desktop
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
    src: /assets/images/2021-04-07-Remote-computer/remote-computer.png
---

用摸鱼时间写了一个用frp连接RD Client的教程<!--more-->---------应一些朋友的要求，只能说尽量做到便宜又好用。

## 引言

对于端口转发这件事，大家基本的印象基本还停留在转发ssh啥的低流量应用。但是吧，这都1202年了，国内的宽带基建虽然确实还有点拉，但是跑个RD客户端还是没啥问题的。接下来就给大家介绍一下要做的准备工作，选型原因以及操作步骤。

### 准备工作

1. [frp](https://github.com/fatedier/frp/releases) - 端口转发服务端和客户端
2. [NSSM](https://nssm.cc/) - 一个windows服务管理器
3. 一个有公网ip的服务器
4. 一个域名 - 可选
5. 一个不用很厚的钱包

## 服务器选型

很多类似的教程上面，都说用一个阿里云或者腾讯云的服务器就行。但是在这个场景中，上面两个其实都是不行的，因为带宽都太小了。就默认最便宜的云服务器配置来说，1M的带宽，只能编辑一下word和excel，其他动态多一点的任务基本别想。具体remote desktop的基本带宽占用可以参考这个[网址](https://docs.microsoft.com/en-us/azure/virtual-desktop/rdp-bandwidth)，微软在里面详细的展示了两种编码在各种不同条件下的表现。

然后有人就要问了，那么那个优惠的轻量应用服务器怎么样呢？答案还是否定的，5M的带宽只能说刚刚达到能用的线，想要舒适的使用，这点带宽还是远远不够的。面对一些动态多的场景，就算巨硬的压缩写的再好，流量需求也会暴增到十几兆每秒，这时候用这玩意，不客气的说，ppt都比这流畅。

纵观所有云服务器平台，提供轻量应用服务器的阿里和腾讯云基本已经很有性价比了，那我们能不能加一点带宽再用呢？腾讯和阿里说，当然可以，你只要充钱，就能变强。

![image-20210407165652003](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210407165652.png)

10M的带宽，带宽费一个月565。。。国内的商用带宽费用。。。只能说懂得都懂。。。

那又有人说了，如果我反手一个按量付费怎么说，流量一个g只要8毛，你还能一个月200块把我秒了？你能秒杀我？？200块你今天能秒杀我，我！当！场！把这个电脑屏幕吃掉！！！

别急，我们来算一笔帐嗷，每天用4小时远程，一个月30天，每秒5Mb不过分吧，那就是 $$ 4*60*60*30*5/8000*0.8=216 $$ ，一共用了270G的流量，光流量钱就要花掉整整216块。。。另外还有数据存储和服务器本身的钱，简直是坑中坑。

说来说去，我们的目标并不是一个完整的服务器，所谓服务器，在这里的用途不过是用端口转发流量的工具人罢了。

为了解决这个问题，请容我向各位隆重介绍共享经济时代由虚拟化技术发展出的新产物 **”nat服务器“**

所谓nat服务器，就是在同一个vps上通过共享ip的方式提供服务的服务器，用人话来说就是在同一台服务器上挤一挤。nat服务器一般都是通过打包端口的方式出售，比如10个端口+1c+2g这样的方式卖。秉承着能用就行的原则，为了少花点钱，也只能挤一挤了。

在这里，我将以[cloudiplc](https://www.cloudiplc.com)的nat服务器举一个例子，顺便吐槽一句，这网站日常不是上不去就是很慢，但是本身的服务器质量还是不错的。

![image-20210407171515561](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210407171515.png)

上面这玩意一个月30，包年还能优惠到300，每个月600G的双向流量，带宽足足有100Mbps啊！100Mbps这不得起飞喽啊（说来你们可能不信，我用remote desktop看过电影。。。），对于我们这个需求来说，这不比腾讯云和阿里云香到不知哪里去了。唯一的缺点就是只提供10个端口。不过对我们来说，这都不算事。

![叉腰](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210407171605.jpeg)

类似的nat服务器厂商还有很多，比如akkocloud之类的等等，具体都可以google查询资料然后购买，这边就不做推荐了。

由于我购买的是cloudiplc的，所以下面所有内容都会以cloudiplc的作为例子，其他厂商的操作也是类似的，可以举一反三。

## 服务器配置

服务器配置这一步是很简单的。在你购买完服务器之后，你会获得初始的root密码和服务器的ip。在你连上服务器，修改完初始root密码后，我们正式开始下面的配置教学。

> **关键点**：由于我们使用的是nat服务器，这就意味着ssh默认的22端口是**不可以直接访问**的，要用ssh连接，首先需要配置一下端口的映射规则，将22端口映射到你服务器所允许的端口号范围内，图示可以参考下面的[关于frps面板](#frps_panel)

首先，我们需要获取cpu的架构，防止装错包。输入 `arch` 即可查看。

![image-20210407174833252](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210407174833.png)

上面的结果说明cpu架构是x64的，因此我需要下载[frp](https://github.com/fatedier/frp/releases)的对应的linux_amd64包，找一个最新的符合你购买的服务器cpu架构的包，复制下载链接然后用`wget copied_url `就可以下载了。在解压了下载的包之后，可以看到里面包含了这些内容。

![image-20210407175254683](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210407175254.png)

其中frpc开头的都是给客户端用的，因此用`rm frpc*`来删除全部不需要的文件。

### frps.ini的配置

配置的重点在于frps.ini的配置，其中所有的配置项的含义都可以在**frps_full.ini**的文件中看到相应的注释。

在这里，我放一下我的大概的配置

```ini
[common]
# 绑定的地址，由于是本身，所以填0.0.0.0
bind_addr = 0.0.0.0
# 绑定的端口，后续客户端需要连接这个端口
bind_port = 5443
# kcp加速的端口，没有需求的可以不填
kcp_bind_port = 5443
# 管理面板端口
dashboard_port = 6443
# 管理面板用户名和密码，请自行修改
dashboard_user = aaaaa
dashboard_pwd = 11111
# 管理面板使用的http和https端口
vhost_http_port = 80
vhost_https_port = 443
# log文件地址
log_file = ./frps.log
# log等级以及存储的天数
log_level = info
log_max_days = 3
# 客户端连接时需要使用的token，请自行修改，客户端需要填写
token = xxxxxxxxx
# 最大连接数
max_pool_count = 50
```

在配好了上述的参数之后，就可以尝试运行一下，看一下效果了，使用`./frps -c ./frps.ini `来运行，在看到成功的日志之后，就可以`Ctrl+C`把它关掉了。

### 将frps作为服务启动

接下来就该去修改之前frp解压出来的`systemd/frps.service`文件了，把它修改成这样

```ini
[Unit]
Description=frp service
After=network.target syslog.target
Wants=network.target

[Service]
Type=simple
ExecStart=/root/frp/frps -c /root/frp/frps.ini
Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

其中的**ExecStart**字段，把里面的frps以及frps.ini修改为你实际的**绝对路径**。

然后，把这个文件不管是`mv`还是`cp`，总之丢到`/usr/lib/systemd/system`目录下，这个目录就是service的默认目录了。

接下来就可以检查服务是否存在了。运行`systemctl status frps`，可以看到这样的状态

![image-20210407200217948](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210407200218.png)

说明这个服务已经被载入了，只是还没有运行。然后执行`systemctl start frps`来启动服务，我们在用上面提到的status来查看状态，看到下面这样的就是运行成功了

![image-20210407202433513](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210407202433.png)

然后使用`systemctl enable frps`来将其加入启动目录，这样以后服务器意外重启它也可以自己启动。



### <span id=frps_panel>关于frps面板</span>

frps面板是用来查看流量使用以及客户端连接的，对于我们后面测试客户端的连接有很重要的作用。

理论上来说我们直接访问`http://ip:6443`就可以了，因为我们之前绑定的管理面板端口是6443，但是我们现在在用nat服务器，因此，我们首先需要配置一条端口映射规则，把6443映射到他允许的端口段中。

> 关于这些映射使用的协议，如果你不懂应该用什么协议，那就选择tcp。对于国内的vps来说，因为按照国内的法律法规来说没有备案是不允许建站的，所以http以及https协议一般都是禁用的，因此最好还是使用tcp协议。

下面的图片中就展示了我将ssh的22端口，用于绑定的5443端口以及管理面板的6443端口都映射了出来，这就意味着，你可以以`http://ip:公网端口`的方式，访问你相应的内网端口。

![image-20210407203224181](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210407203224.png)

按上面图片中的配置，我可以访问54444端口来查看我的frps的面板，大概就长下面这样。

![image-20210407204522679](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210407204522.png)

由于我们上面都是用的tcp协议，因此可以进入tcp的条目中查看已经连接的通道。具体会在后面的客户端配置中展示。



## 客户端配置

对于我们远程桌面的需求，客户端当然就是windows端啦，同样非常简单。还是像上面一样，把frp的包下载下来，然后解压找个地方放好。

随便用vscode或者别的什么编辑器打开`frpc.ini`，然后把里面的内容修改成下面这样

```ini
[common]
# 服务器地址，有ip就填ip，nat厂商提供了域名的话就填域名
server_addr = 111.222.333.444
# 服务器绑定端口，注意，这里是映射到外网的端口
server_port = 54443
# 用于连接的token，请务必和服务端的对应
token =  xxxxxxxx

# 这一条不能省略，是和服务端建立通道的通道名，如果有多条，请不要重复
[windows_remote_desktop]
# 类型和上面提到的一样，不知道填什么就填tcp
type = tcp
# 需要转发出去的ip，本机就填127.0.0.1，因此如果有一个openwrt的路由器的话，实际上是可以在路由器上部署frpc的，把下面的ip改成实际需要转发的ip即可
local_ip = 127.0.0.1
# 需要转发的端口，对于remote desktop来说，默认3389
local_port = 3389
# 这个是客户端指定的服务端端口，关键点看下面的解析
remote_port = 57777
```

