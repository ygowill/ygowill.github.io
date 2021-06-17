---
key: Use-git-and-make-life-easier
layout: article
title: 用好Git，改善项目开发体验
tags: Git workflow
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
    src: /assets/images/2021-06-17-Git-practice/git-logo.jpg
---

## 引言

> A: “你那还有上个月开会的时候的代码吗？好像有点问题”
<!--more-->
>
> B: “没了，已经被我改了很多了”
>
> A: “啊这。。。local history里面还有吗”
>
> B: “改的东西太多，不知道是哪个版本了。。”
>
> B: “突然想起来我是一有改动就建一个新文件的，让我康康”
>
> ```shell
> $ ls data*
> dataset  dataprocessing.py  dataprocessing1.py  dataprocessing2.py
> dataprocessing3.py  dataprocessing4.py  dataprocessing5.py  ...
>
> ```
>
> A&B: “。。。。。。。。。。。。。”

​上面就是一个经典的小项目进行多人合作时候出现的情况，因为版本管理混乱，再加上开发周期短，上面这样的情况就很容易产生（~~或者一个文件里代码100行，注释400行~~）

​现在实验室做的项目越来越多了，同时参与进一个项目的人数也在不断增加，如何管理好一个工程项目，降低项目参与者之间的沟通成本是非常重要的一点，可能代码里一个小改动引入的bug就要消耗大量的时间去查找和修复。

​为了避免上面这种翻垃圾堆找代码的情况产生，版本管理的引入就相当重要了。

​对于版本管理来说，大家都知道要用git或者svn，但是往往对这二者不求甚解，使用方式的混乱会使得最终的结果从在一个垃圾堆里找代码变成在一堆垃圾堆里找代码。。。

​趁着这次实验室的gitlab搭好了的机会，写一篇教程性质的小短文，不严谨的地方敬请谅解（~~有看不懂或者有问题的地方请提issue或者pr，权当练习git使用了~~）

## 前置知识

### Git相关知识

* [Git常用命令清单----阮一峰](http://www.ruanyifeng.com/blog/2015/12/git-cheat-sheet.html)
* [Git远程操作详解----阮一峰](http://www.ruanyifeng.com/blog/2014/06/git_remote.html)

### 什么是工作流？

​工作流，顾名思义就是工作的流程。在Git的语境下，工作流可以理解为git的提交，合并，分支的创建，管理等流程。

​用好工作流可以让一个项目的开发变的更加清晰，更容易找出问题所在。

### 有哪些工作流？

* 集中式工作流

  ![image-20210617154139805](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617154141.png)

  这是最原始也是最混乱的工作流，所有的开发都在同一条master分支上进行，一旦出现问题，如果是小问题还不要紧，可以像图中那样加一个bugfix的提交来解决，一旦是一个大问题，比如Feature2出现了问题，那么回滚到Feature1的提交，后面的Feature3，Feature4的提交就丢失了，重新合并又是一件很麻烦的事

* 功能分支工作流

  ![image-20210617155202005](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617155202.png)

  这是基于集中式的一种工作流，基础的开发工作还是在master上完成，当有新的功能需要加入时，新开一条分支，一般以功能名命名，在这条分支上进行开发，开发完成后再通过pr合并入master。这样的好处在于可以隔离不同的功能之间的影响，在pr的时候也能提供一个code review的机会，同时也可以让分支历史更加简介。

* Gitflow工作流

  ![image-20210617160750462](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617160750.png)

  Gitflow是一个按照开发阶段划分的严格工作流，主分支Master，开发分支Dev，功能分支Feature，版本发布分支Release，热修复分支Hotfix。

  这种方式虽然流程严格，可以大大降低出问题的机率，但是也有不少问题。

  * 过于繁琐，很难严格执行
  * master分支不干净，只能靠tag来标记哪些是可以部署的

* 个人推荐的工作流

  ![image-20210617162221960](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617162222.png)

  上图所示的工作流也就是俗称的双主干工作流。

  其中Master分支作为部署或者说版本发布的分支，Dev分支作为主开发分支。

  对于一些小的改动，可以直接在Dev上进行，如果改动比较大，或者说应当作为一个功能模块加入项目，那就需要开一个新的feature分支。

  当功能开发完成，feature分支应提交merge request合并入dev分支。

  当版本发布时，dev分支应提交pull request合并入master分支完成发布。

  master分支应保证任意一个节点都是可以直接部署的，而不是开发到一半的

## 实践中的工作流----一个例子

### 初始化

首先，我们先在本地创建一个用于测试的git目录并推送到gitlab上

```shell
mkdir workflow_test
cd workflow_test
# 初始化git目录
git init
# 添加远程路径
git remote add origin http://xxx/xxx/git_workflow_guide.git
# 随便创建一个文件
touch README.md
# 添加全部文件用于上传
git add .
# 创建commit并添加comment
git commit -m "Initial commit"
# 推送到远程分支
git push -u origin master
```

到这一步为止，就完成了本地文件推送到远程仓库的目的。

### 创建与删除分支

接下来，就可以创建一个用于开发的分支，比如Dev

```shell
# 方法1,新建一个分支并切换
git branch Dev
git checkout Dev
# 方法2，直接切换到新建的分支
git checkout -b Dev
```

如果你的命令行配置过的话应该直接就可以看到现在正位于Dev分支

![image-20210617164659420](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617164659.png)

如果没有配置也可以通过`git branch -vv`来查看当前的分支以及所有分支的情况

![image-20210617164800165](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617164800.png)

这个时候，可以看到我们当前位于Dev分支上，但这是一个本地分支，而下面的master分支已经和远程仓库建立起连接了。

我们可以使用`git push origin Dev:Dev`来将本地的Dev分支，推送到远程的Dev分支，命令后面的`Dev:Dev`中冒号前的就是本地分支名，后面的就是远程分支名，两个名字不一定要一致。（简便的方法可以看下面一小节）

如果我们推送一个空分支到远程分支，那么就相当于删除了远程分支。因此我们可以使用`git push origin :Dev`来删除一个远程分支。当然也可以使用更不容易混淆的写法`git push origin --delete Dev`来删除。

### 当有新的改动时

如果是一些小的改动，那么我们可以直接在Dev分支上修改，只需要正常的修改，然后推送就可以了。

比如我们把原来的`README.md`改成`readme_test.md`并给他加一些内容，使用`git status`就可以查看当前的变化。

![image-20210617170120962](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617170121.png)

然后将他推送到远程

![image-20210617170519484](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617170519.png)

如果每次都要在`git push`之后写`origin Dev:Dev`就比较麻烦，因此我们可以为当前分支设置上传的目的地来简化我们的操作，就和原来的master分支一样

```shell
git branch --set-upstream-to=origin/Dev
```

这个时候，Dev分支就和远程的Dev分支建立起连接，后面就可以直接push了。我们可以看一下当前的效果

![image-20210617171042280](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617171042.png)

### Feature分支合并回Dev

当我们遇到一些较大的改动或者有新的feature需要进行模块化的开发时，我们需要为其创建一个新分支，在新分支上进行开发，在开发完成后发起merge request，然后合并回Dev分支。具体流程可以看下面。

![image-20210617172152195](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617172152.png)

![image-20210617172524974](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617172525.png)

以上就完成了在feature1分支上的两次提交，由于在第一次提交后我们添加了upstream的目的地，因此第二次我们可以直接`git push`来进行提交。第二张图中的`gst`,`gaa`,`gca`均为自定义的alias，具体就是`status`，`commit all`之类的缩写。

![image-20210617173106586](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617173106.png)

这个时候我们去查看gitlab，可以看到上面提示我们可以进行分支的合并

![image-20210617173213027](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617173213.png)

当我们点进去可以看到默认是向master提交mr，但是按照我们的工作流，feature分支应当合并回Dev分支，因此我们需要修改分支

![image-20210617173426240](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617173426.png)

点击Compare branches and continue可以回到刚才的界面

![image-20210617173659976](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617173700.png)![image-20210617173722998](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617173723.png)

我们可以在下面看到本次共有两个commit，以及合并后的改动情况，在我们填完上面的title以及description之后，我们就可以创建mr了（实践中请在下面的审核选项中选择至少一位除自己以外的人进行code review，这里只是一个展示，因此就不进行code review了，逃

![image-20210617174200231](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617174200.png)

然后我们可以看到这样的界面，在这里所有项目的成员都可以进行评论和code review，通过后，可以点击批准和合并来进行分支的合并。可以注意到合并处有一个删除源分支，在这里为了演示就取消勾选了，实践中请自行决定。

![image-20210617174454536](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617174454.png)

到这一步，分支的合并就完成了。

![image-20210617174617410](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617174617.png)

从项目概览的分支图中可以以图形化的方式看到这样的改动合并情况。

### Dev分支合并回master

当我们在经过了一段时间的开发之后，决定发布一个完整的版本。那么这时候就该从Dev分支合并回master来完成版本发布了。具体的做法和上一小节是一样的，下面就不赘述了，放一张最终的分支图作为例子，图中绿色的线表示现在位于Dev分支，右边的commit是按照时间顺序排列的，和左边的节点一一对应。

![image-20210617194416259](https://gitee.com/ygowill/pic_bed/raw/master/blog/20210617194416.png)

当master分支有改动的时候，最好可以在上面打一个tag，来说明版本号，也可以加入一个版本改动说明文件，便于在项目复杂的时候可以用于搜索。

还有需要注意的一点是，当你在完成了分支的合并后，本地的分支是还没有更新的，因此给各位一个忠告

> 切换完分支后，啥都别干，先`git pull`拉取最新的改动！
>
> 切换完分支后，啥都别干，先`git pull`拉取最新的改动！
>
> 切换完分支后，啥都别干，先`git pull`拉取最新的改动！
>
> 重要的事情说三遍
>
> 如果你先改了一堆东西，准备提交，然后发现不同步，最后解决conflict的反正不是我。。
