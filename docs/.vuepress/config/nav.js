module.exports = [
    {
        text: '本站指南', link: '/guide/', icon: 'reco-eye'
    },
    {
        text: '技术分享', link: '/技术文章/', icon: 'reco-api',
        items: [
            {
                text: 'Java',
                items: [
                    { text: 'JavaSE', link: '/技术文章/java/javase' },
                    { text: 'JavaEE', link: '/技术文章/java高级/javaee' },
                ]
            },
            {
                text: 'Go',
                items: [
                    { text: 'gin-web', link: '/技术文章/go/gin-web/gin' },
                    { text: 'go-其他', link: '/技术文章/go/go-其他/编译部署' },
                ]
            },
            {
                text: '前端',
                items: [
                    { text: '前端基础', link: '/技术文章/vue/vue01' },
                ]
            },
        ]
    },
    {
        text: '生活分享', link: '/生活分享/', icon: 'reco-faq',
        items: [
            { text: '生活分享', link: '/生活分享/life' },
        ]
    },
    // {
    //     text: '博客', icon: 'reco-blog',
    //     items: [
    //         {text: '腾讯', link: 'https://how.ke.qq.com/', icon: 'reco-blog'},
    // 		{text: 'B站', link: 'https://space.bilibili.com/394702492', icon: 'reco-bilibili'},
    //     ]
    // },/**/
    { text: '时间轴', link: '/timeline/', icon: 'reco-date' }
]