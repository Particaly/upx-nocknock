import { createApp } from 'vue'
import './style.css'
import 'virtual:uno.css'
import App from './App.vue'
import naive from 'naive-ui'
import { router } from '@/router'

function main() {
    const app = createApp(App)

    app.use(naive)
    app.use(router)

    app.mount('#app')
}

try{
    main()
} catch(e) {
    (window as any).utools.showNotification(e)
}
