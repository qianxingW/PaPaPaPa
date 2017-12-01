/*
 * @Author: Marte
 * @Date:   2017-01-05 19:13:06
 * @Last Modified by:   Marte
 * @Last Modified time: 2017-01-06 16:50:11
 */

const http = require('http'); // http 网路
const https = require('https')// https 网路  如爬取的网站是https协议 用https
const fs = require("fs"); // 流
const cheerio = require('cheerio'); // html 解析
const request = require('request')

// 设置被查询的目标网址
let queryHref = "https://www.haha.mx/topic/1/new/";
// 设置分页位置
let querySearch = 1;
// 设置获取页数
let pagemax = 10;
//图片路径数组
let Urls = [];


/**
 * 根据url和参数获取分页内容
 * @param {String}： url
 * @param {int}： serach
 *
 *
 */
function getHtml(href, serach) {
    let pageData = ""; //储存html页面

    http.get( href + serach , (res)=>{

        res.setEncoding('utf-8'); //设置编码

        //开始接收数据，将接收到的html拼接起来
        res.on('data' , (chunk) => {
            pageData += chunk;
        })

        //接收完成后
        res.on('end' , (err) => {
            if(err){
                console.log(err)
            }else{

                //通过Cheerio模块,解析HTML
                //具体功能可去查看Cheerio
                const $ = cheerio.load(pageData);

                //获取本页面下 $(".joke-list-item .joke-main-content a img") 路径下的搜有图片
                //其他网站可自行查看其图片的结构
                let ImgHtml = $(".joke-list-item .joke-main-content a img");

                for (let i = 0; i < ImgHtml.length; i++) {
                    let src = ImgHtml[i].attribs.src;
                    // 筛选部分广告，不是真的图片
                    // "http://image.haha.mx"  可自行修改
                    if (src.indexOf("//image.haha.mx/") > -1) {
                        Urls.push(ImgHtml[i].attribs.src)
                    }
                }

                //获取页数完成后开始下载
                if (serach == pagemax) {
                    console.log("图片链接获取完毕！" + Urls.length);
                    console.log("链接总数量：" + Urls.length);
                    if (Urls.length > 0) {                        
                        downImg(Urls.shift());
                    } else {
                        console.log("下载完毕");
                    }
                }

            }
        })
    })
}  


/**
 * 下载图片
 * @param {String} imgurl：图片地址
 */
function downImg(imgurl) {

    let narr = imgurl.replace("//image.haha.mx/", "").split("/")

    // 'https:'+imgurl  图片路径
    http.get('https:'+imgurl, (res) => {

        let imgData = "";

        //一定要设置response的编码为binary否则会下载下来的图片打不开
        res.setEncoding("binary");

        res.on("data", (chunk) => {
            imgData += chunk;
        });

        res.on("end", ()=> {

            // 图片保存路径
            var savePath = "./upload/" + narr[0] + narr[1] + narr[2] + "_" + narr[4];

            //保存图片
            fs.writeFile(savePath, imgData, "binary", (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(narr[0] + narr[1] + narr[2] + "_" + narr[4]);
                    if (Urls.length > 0) {
                        downImg(Urls.shift());
                    } else {
                        console.log("下载完毕");
                    }
                }
            });
        });
    });
}


function start() {
    console.log("开始获取图片连接");
    for (var i = 1; i <= pagemax; i++) {
        getHtml(queryHref, i);
    }
}

start();