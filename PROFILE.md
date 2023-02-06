## 安装

链接: https://pan.baidu.com/s/1iMgvBR8XQpl1QxeWHqYC-A?pwd=7cj3 提取码: 7cj3

## 使用教程

bilibili时间管理插件-使用预览v0.1
链接：https://meeting.tencent.com/meetlog/detail/index.html?s=VsJmv2zPY4K7zv7RsXKJU5e1TErSeJ64Bphf6Bdtbfg

## 说明
Bilibili是一个类似于Youtube的视频网站，主要服务于中国用户，很多人花了大量时间在这个网站上，这个插件是用于帮助用户更加健康的使用B站, 拒绝沉迷, 良性使用。用户可以设置一个限额时间，到了时间限额后，用户将被禁止访问该网站。同时用户可以通过插件里的数据报表，查看到当前用户每天花在Bilibili的时间，复盘每周的使用情况。

本插件使用了content.js和popup.js，为了更加方便的进行数据通信，采用storage作为桥梁，来进行数据的交互。同时需要持久化存储今日使用的时间，防止刷新后数据消失。采用了chrome.storage.sync来进行数据的持久化存储。

Bilibili是一个类似于Youtube的视频网站，主要服务于中国用户. 由于本插件是针对"bilibili.com"使用的, 帮助用户不沉迷于刷B站上的短视频，将重心放在现实中的生活上,所以需要Host Permission来访问bilibili.com.同时为了保证数据能够跨设备同步, 需要对用户的数据进行保存到数据库中, 当两台电脑绑定同一个UID时,能够保证数据是同步的. 同时保证用户更换电脑, 该数据不丢失. 所以需要对服务器进行访问, 以便于将数据保存到数据库中. 也就是用到host permission（"https://fctest.appletest.cn/*"）的原因. 