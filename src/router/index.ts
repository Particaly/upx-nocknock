import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: 'home',
            path: '/',
            component: () => import('@/views/home/index.vue')
        },
        {
            name: 'clock',
            path: '/clock',
            component: () => import('@/views/clock/index.vue')
        },
    ]
});

(window as any).router = router;

router.beforeEach((to, from, next) => {
    console.log(to, from)
    next()
})

export {
    router
}
