import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/home/index.vue'
import Clock from '../views/clock/index.vue'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: 'home',
            path: '/',
            component: Home
        },
        {
            name: 'clock',
            path: '/clock',
            component: Clock
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
