import { createRouter, createWebHashHistory } from 'vue-router';
import MallShippingPage from '@/pages/MallShippingPage.vue';
import MallUnboxPage from '@/pages/MallUnboxPage.vue';
import TrackingPage from '@/pages/TrackingPage.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', name: 'home', component: () => import('@/pages/HomePage.vue'), meta: { tab: 0, showTab: true } },
    { path: '/food', name: 'food', component: () => import('@/pages/FoodCategoryPage.vue'), meta: { tab: 0, showTab: true } },
    { path: '/mall', redirect: '/home?cat=mall' },
    { path: '/store/:id', name: 'store', component: () => import('@/pages/StorePage.vue'), meta: { showTab: false } },
    { path: '/product/:restId/:dishId', name: 'product', component: () => import('@/pages/ProductDetailPage.vue'), meta: { showTab: false } },
    { path: '/cart', name: 'cart', component: () => import('@/pages/CartPage.vue'), meta: { tab: 1, showTab: true } },
    { path: '/checkout', name: 'checkout', component: () => import('@/pages/CheckoutPage.vue'), meta: { showTab: false } },
    { path: '/tracking/:orderNo', name: 'tracking', component: TrackingPage, meta: { showTab: false } },
    { path: '/done/:orderNo', name: 'done', component: () => import('@/pages/DonePage.vue'), meta: { showTab: false } },
    { path: '/orders', name: 'orders', component: () => import('@/pages/OrdersPage.vue'), meta: { tab: 2, showTab: true } },
    { path: '/order/:orderNo', name: 'order-detail', component: () => import('@/pages/OrderDetailPage.vue'), meta: { showTab: false } },
    { path: '/profile', name: 'profile', component: () => import('@/pages/ProfilePage.vue'), meta: { tab: 3, showTab: true } },
    { path: '/coupons', name: 'coupons', component: () => import('@/pages/CouponsPage.vue'), meta: { showTab: false } },
    { path: '/my-coupons', name: 'my-coupons', component: () => import('@/pages/MyCouponsPage.vue'), meta: { showTab: false } },
    { path: '/addresses', name: 'addresses', component: () => import('@/pages/AddressesPage.vue'), meta: { showTab: false } },
    { path: '/daily', name: 'daily', component: () => import('@/pages/DailySpecialsPage.vue'), meta: { showTab: false } },
    { path: '/ticket-rush', name: 'ticket-rush', component: () => import('@/pages/TicketRushPage.vue'), meta: { showTab: false } },
    { path: '/movie-seat/:restId/:dishId', name: 'movie-seat', component: () => import('@/pages/MovieSeatPage.vue'), meta: { showTab: false } },
    { path: '/stats', name: 'stats', component: () => import('@/pages/StatsPage.vue'), meta: { showTab: false } },
    { path: '/mall-shipping/:orderNo', name: 'mall-shipping', component: MallShippingPage, meta: { showTab: false } },
    { path: '/mall-unbox/:orderNo', name: 'mall-unbox', component: MallUnboxPage, meta: { showTab: false } },
  ],
});

export default router;
