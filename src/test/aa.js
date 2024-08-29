// //通过正则表达式从字符串中提取图片后缀或视频后缀

// function extractExtension(str) {
//     var pattern = '(\\.jpg)|(\\.mp4)';

//     const regex = new RegExp(pattern);
//     const match = str.match(regex);
//     if (match) {
//         return match[0];
//     }
//     return null;
// }

// //测试用例
// console.log(
//     extractExtension(
//         'https://cloud.video.taobao.com/play/u/2930255252/p/2/e/6/t/1/345969019746.mp4?appKey=38829'
//     )
// ); //输出jpg
// console.log(
//     extractExtension(
//         'https://gw.alicdn.com/imgextra/i3/2930255252/O1CN01fKlC6a1ofSvv34k4b_!!2930255252.jpg_Q75.jpg_.webp'
//     )
// );
