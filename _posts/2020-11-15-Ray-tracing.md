---
key: use-webgl-to-implement-a-ray-tracing-demo
title: 用WebGL手写一个光线追踪demo
tags: WebGL CG
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
    src: /assets/images/2020-11-15-Ray-tracing/minecraft-ray-tracing.jpg
---

这个项目的最初也是最终的目的是应付计算机图形学的大作业，时间有限，各种参考，仅用于学习（逃
<!--more-->
## 最终的效果

![demo](/assets/images/2020-11-15-Ray-tracing/webgl_demo.png)

也可进入这个在线demo体验一下，体验移动的时候最原始的路径追踪算法带来的马赛克：[demo](/assets/html/ray-tracing-demo.html)

实现细节暂时留坑，以后慢慢填（逃

## References

* [Writing a ray tracer for the web](https://oktomus.com/posts/2020/ray-tracer-with-webgl-compute/)
* [Wolfenstein: Ray Tracing On using WebGL1](https://reindernijhoff.net/2019/03/wolfenstein-raytracing-on-using-webgl1/)
* [evanw/webgl-path-tracing](https://github.com/evanw/webgl-path-tracing)
* [LightTracer, the first WebGL path tracer for photorealistic rendering of complex scenes in the browser](http://raytracey.blogspot.com/2019/06/lighttracer-first-webgl-path-tracer-for.html)
* [hoxxep/webgl-ray-tracing-demo](https://github.com/hoxxep/webgl-ray-tracing-demo)
* [sschoenholz/WebGL-Raytracer](https://github.com/sschoenholz/WebGL-Raytracer)
