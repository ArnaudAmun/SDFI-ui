import { createRouter, createWebHashHistory } from 'vue-router'

const Init = () => import("./init.vue")
const Update = () => import("./update.vue")

export default createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: "Init",
            path: "/",
            component: Init
        },
        {
            name: "Update",
            path: "/update",
            component: Update
        }
    ]
})
