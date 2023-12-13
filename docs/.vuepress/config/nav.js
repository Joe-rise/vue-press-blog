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
                    { text: 'springboot', link: '/技术文章/java/springboot' },
                ]
            },
            {
                text: '中间件',
                items: [
                    { text: 'xxl-job', link: '/技术文章/中间件/xxl-job' },
                    { text: 'RabbitMQ', link: '/技术文章/中间件/RabbitMQ常见问题' },
                    { text: 'ZincSearch', link: '/技术文章/中间件/ZincSearch' },
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
                    { text: 'vue3', link: '/技术文章/前端/vue01' },
                ]
            },
            {
                text: '运维',
                items: [
                    { text: 'centos7', link: '/技术文章/运维/centos7' }
                ]
            }
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