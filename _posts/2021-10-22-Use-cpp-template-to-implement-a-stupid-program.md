---
key: Use-cpp-template-to-implement-a-stupid-program
layout: article
title: 用C++的模板还原一个沙雕图中的代码
subtitle: 如何用模板写点正儿八经的东西
tags: C++ Template
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
    src: /assets/images/2021-10-22-Use-cpp-template-to-implement-a-stupid-program/titleShadow.png
---

## 引言

整件事情的起因是最近在做项目摸鱼逛群的时候看到了一个沙雕图

<!--more-->

，内容大概是这样的

![425361634696417_.pic](https://ygowill-pic-bed.oss-cn-chengdu.aliyuncs.com/blog/20211022141309.JPG)

由于内容实在是过于好笑，以至于在接下来的两个小时内我时不时就在脑海里回味一下。最终决定用模板实现一个功能上完全等价的代码出来，正好由于项目的关系好久没写博文了，正好顺便传授一点C++的模hei板mofa入门（逃

## 目标分解

仔细想一想，我们可以把上一个任务分解成以下几个步骤

1. 生成[1, 100000)的整数序列
2. 为上面序列中的每一项都计算作业中的要求
3. 将2中的每一个计算过程都存储到一个`array`或者`map`中，以此来模拟`switch-case`的效果
4. 添加一个简单的查询功能，来对上述存储的结果进行访问

## 模板实现

纵观上面的任务，2是这个“作业”的关键点，那我们就从2入手。

从上面的截图中我们可以知道，这个作业一共有三个要求：

1. 求出一个数字有几位
2. 输出这个数字的每一位，并带上是哪一位的信息
3. 逆序输出这个数字



### 展开数字

想要做到上面的3个要求，首先需要做到的就是展开一个数字，对于基本的任务来说，展开的过程是很简单的，下面就写点python大概讲一下过程

```python
def calc(digits):
    result = []
    while digits:
        result.append(digits % 10) # 求余数
        digits = digits // 10 # 获取到倒数第二位的数字
    return result
```

想要将上面这个过程用模板实现，我们就需要用模板的方式展开数字，整个过程从原理上来说是差不多的

```c++
template<unsigned rem, unsigned... digits>
struct explode : explode<rem / 10, rem % 10, digits...> {};

template<unsigned... digits>
struct explode<0, digits...>{
  static void get_output() {
    ......
  }
};

template<unsigned num>
struct process_single : explode<num / 10, num % 10> {};

```

上面的`process_single`就完成了对一个数字的拆解和处理，接下来我们可以一步步看整个拆解的过程。

首先可以看到`process_single`接受一个`unsigned num`作为模板参数，也就是我们需要处理的数字，将其拆成两部分传给`explode`继续处理。

然后就是这个`explode`有意思的地方了，从上面的模板定义可以看到，`explode`可以接受2个或者以上的参数，下面的特化是以0开头，也就是递归的结束条件。我们以**234**作为一个例子，在传入`explode`的时候会被解析为 `<23,4>`这样一个参数包，`digits`此时是空的，由于参数包开头不是0，因此仍会被一直递归解析，直到参数包开头是0，每次都会解析参数包中的第一个数字。易知**234**最终被解析为`<0，2，3，4>`，符合`<0, digits...>`这个参数包，这个时候特化的`explode`中的`digits...`就是我们需要的数字序列`<2,3,4>`。

### 计算参数包中参数个数

我们可以通过`get_output`这个函数来处理上面得到的参数包，比如要求这个数字有多少位，其实就是求这个参数包里有多少个参数。C++从11开始就提供了`sizeof...()`这个函数，可以帮我们解析参数包中的函数数量，这样一来第一个任务就完成了。

### 递归打印参数包

模板的递归写起来是很自然的，和一般的递归唯一的区别在于递归的结束条件一般函数就写在函数体里了，而模板则需要多写一个特化的模板来实现。

下面就来写解析参数包然后递归打印的模板。由于这个作业里还需要打印个十百千万这样的信息，因此这个模板还需要多加点参数。

```c++
constexpr const char* index_name[] = {"个", "十", "百", "千", "万"};

template<class... Ts>
void print_all(int index, unsigned const& head) {
  std::cout << index_name[index-1] << "位数是：" << std::to_string(head) << std::endl;
}

template<class... Ts>
void print_all(int index, unsigned const& head, Ts const&... args) { 
  print_all(index - 1, args...);
  std::cout << index_name[index-1] << "位数是：" << std::to_string(head) << std::endl;
}

```

由于我们有参数包个数的信息，因此我们可以直接将其传入模板来打印位数信息，上面的特化模板指明除了index只有一个参数，下面的模板则会递归调用自己，直到参数包符合特化的条件。

而输出数字的逆序也是完全同理，由于采用的是递归，我们只需要安排递归调用和打印的顺序，即可实现正序，逆序。

到这一步为止，我们只需要将上面的内容加入`get_output`中，步骤2就完成了，代码如下

```c++
template<unsigned... digits>
struct explode<0, digits...>{
  static void get_output() {
    std::cout << "是" << std::to_string(sizeof...(digits)) << "位数" << std::endl; 
    print_all<unsigned>(sizeof...(digits), digits...);
    std::cout << "倒过来是: ";
    print_reverse(digits...);
    std::cout << std::endl;
  }
};
```

## 模拟switch-case

模拟的思想非常简单，我们只需要建一个`std::function`的数组就可以了，在里面把[1,100000)的每一个数字传入上面的`get_output`即可，这也是上面写成static方法的原因。代码如下

```c++
template<typename T, T... digits>
struct simulate_switch<std::integer_sequence<T, digits...>> {
  static void get(int i) {
    static const std::function<void()> simulate_switch[] = {(process_single<digits>::get_output)...};
    simulate_switch[i]();
  }
};

void print_result(unsigned c) {
  if (c > size) return;
  simulate_switch<std::make_integer_sequence<unsigned, size>>::get(c);
}
```

在上面的`get`方法中，采用C++17引入的`fold expression`来用`integer_sequence`参数的包对`simulate_switch`数组进行初始化。

在上面的`print_result`中，我们使用`make_integer_sequence`来生成[0,size)的整数序列传入上面的static方法，因此会在程序运行前就生成完毕。

到此，步骤1，3，4就全部解决了。

## 模板的弊端

从上面的代码中可以看出，我们的99999个打印函数在一开始就会被初始化，和原作里那个巨大的`switch case`是一样的，这也引出了模板的一个弊端，尽管模板可以帮我们在编译期解决很多问题，但是也会带来代码体积的快速膨胀之类的问题，我们可以看一下最终的代码

![430251634796600_.pic_hd](https://ygowill-pic-bed.oss-cn-chengdu.aliyuncs.com/blog/20211022161543.JPG)

代码共计67行，让我们编译一下。。。

![image-20211022161730862](https://ygowill-pic-bed.oss-cn-chengdu.aliyuncs.com/blog/20211022161731.png)

再看一眼体积，67行代码编出了88M的可执行文件。。。

![image-20211022161808292](https://ygowill-pic-bed.oss-cn-chengdu.aliyuncs.com/blog/20211022161808.png)

我顿时就理解了88W行代码的来历了。。。如果要修改更多的数字，修改size的配置就行了，模板可以全自动的生成打印函数，而不必像原作一样手动写一堆`switch case`，这也是为什么我把这个项目作为模板的一个例子的原因。

再试试功能

![image-20211022162104845](https://ygowill-pic-bed.oss-cn-chengdu.aliyuncs.com/blog/20211022162104.png)

至少功能是正常的，那这模仿大赛，我可以说不仅还原了原作，甚至超越了原作（毕竟原作编译不出来，逃

完结撒花~
