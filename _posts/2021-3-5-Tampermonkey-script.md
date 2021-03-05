---
key: Use-tampermonkey-script-to-import-syllabus
layout: article
title: 写一个插件从学校教务系统导入课程表
tags: Javascript Tampermonkey ICS
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
    src: /assets/images/2021-03-05-Tampermonkey-script/js.jpg
---

泻药，人在UESTC，选完课，刚下床。

<!--more-->

一学期一次的紧张刺激的玄学赌命选课和手速抢课终于结束了，又到了制作课程表的时候了。

但是弱智的教务系统对于课程表只有一个导出成pdf的选项，都1202年了哪还有人打印出来贴啊。

用课程表app吧，总觉得被学校和app厂商联合起来喂了一口💩️

不用app吧，就截图的那个伸缩性，**手机上能看，电脑上就小到看不了，电脑上能看，手机上就大到看不全**。一想到那个场景，我就觉得我的血压拉起来了。

> 但有句俗话说得好，“能坐着绝不站着，能躺着绝不坐着”。

本着能白嫖就白嫖的原则，不如先在网上有没有类似的改改能用。

在github上找了一圈，终于发现了一个本科生用的。。。

真实泪流满面，气抖冷，我研究生就不配拥有是吗。

于是只能自己动手丰衣足食，想办法把它导入到原生日历里，甚至还便于和其他事情的日程一起管理。

于是思来想去------

## 不如整一个插件吧

个人对于这种辅助性质的脚本体会颇深。

总是能看到一些不知道怎么想的作者，在页面上加载一个巨难看的按钮，然后实现功能。

作为一个对艺术还有一点点追求的人，我得整一个看的下去的。

### 先画一个按钮

看了一眼原来的页面，已经有俩按钮了，于是决定在中间加一个新的。

先点一下elements看一眼具体的style，然后进行一个js的抄。

![image-20210305163403239](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210305163403.png)

在Tampermonkey的用户脚本区随手写了一下，就可以在中间插一个类似的按钮。

![image-20210305163746276](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210305163746.png)

要我说，不能说完全一致，只能说一模一样😏️

![image-20210305163851892](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210305163851.png)

### 硬编码时间

由于学校课表里的课程信息格式是固定的，所以数据提取这一块就硬编码了。。

由于学校上课时间是一定的，所以时间这一块就硬编码了。。

总的来说，关于数据提取这块，硬编码永远的神（逃，要脸

### ICS事件生成

到网上看了一眼大家的ICS文件都是怎么生产的。

在经历了和CSDN复制粘贴怪和百家号的殊死搏斗之后，我发现------**大伙的文件都是字符串手动拼接出来的**

> 又有句俗话说的好，“程序员不能重复造轮子”。

既然大家都是缝合怪，那我相信万能的github一定有人写了ICS的库。

随后一搜，还真被我找到了，只能说感谢这位兄弟的库 [https://github.com/nwcell/ics.js](https://github.com/nwcell/ics.js)

把上面提取到的数据封装成ics事件，然后导出，一切都解决了。

### 最终代码

上述过程的全部代码可以看[这里](https://github.com/ygowill/uestc_graduate_syllabus/blob/main/ics_generation.js)

## Tampermonkey和Greasy Fork

代码的部分完成了，接下来就是插件的部分了。

众所周知，Chrome是一个很方便程序员整活的浏览器。

这一点不仅体现在他的控制台是所有浏览器里最好用的，也不仅体现在他的插件是所有浏览器里最丰富的。

而是体现在，他有一个可以让用户自由写js，在网页浏览的每一个流程都可以自定义脚本的插件，叫做Tampermonkey。

与github等代码托管平台类似，Tampermonkey也有很多可以托管用户脚本的平台，其中比较出名的就是这个Greasy Fork。

于是整个流程就非常的简单了。

### 发布脚本

点开Greasy Fork的控制台。

![image-20210305170248854](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210305170248.png)

把自己刚才在Tampermonkey里测试好的脚本复制进来。

设置脚本中的说明字段。其中用于匹配url的match字段一定要写对，否则进入网站的时候打不开就搞笑了。

![image-20210305170611804](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210305170611.png)

最后点击发布就一切就绪了。

### 设置源代码同步

对于Greasy Fork来说，他的版本控制的唯一字段就是你自己在 **@description** 字段里填的版本号，所以只要你在代码里手改了什么东西，没改版本号就点了更新，那里面的版本历史会被直接覆盖。。。

所以我们还是使用专业的版本控制来帮助我们比较好。

谈到版本控制和代码托管，那当然是用万能的github啦。

把代码上传到github之后，就可以在Greasy Fork的脚本管理页面里设置源代码同步，这边使用github的raw文件网址，就可以获取到原始文件。

![image-20210305171325617](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210305171325.png)

到此为止，插件发布就完成了。



## 插件使用

详见github的[项目readme](https://github.com/ygowill/uestc_graduate_syllabus)



