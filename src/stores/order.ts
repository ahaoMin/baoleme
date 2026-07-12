import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { formatMoney, toMoney } from '@/core/money';
import { getOrders } from '@/repositories/userRepo';
import { analyzeOrders, getOrderCategory, orderItemCount, splitOrdersByCategory } from '@/services/orderService';
import { useUserStore } from '@/stores/user';

export const useOrderStore = defineStore('order', () => {
  const userStore = useUserStore();
  const refreshTick = ref(0);

  const orders = computed(() => {
    refreshTick.value;
    return getOrders(userStore.ownerId);
  });
  const stats = computed(() => {
    const list = orders.value;
    const { dining, shopping } = splitOrdersByCategory(list);
    const diningMoney = toMoney(dining.reduce((s, o) => s + toMoney(o.pay), 0));
    const shoppingMoney = toMoney(shopping.reduce((s, o) => s + toMoney(o.pay), 0));
    const diningKcal = dining
      .filter((o) => getOrderCategory(o) === 'food')
      .reduce((s, o) => s + (o.kcal || 0), 0);
    const diningItems = dining.reduce((s, o) => s + orderItemCount(o), 0);
    return {
      totalMoney: formatMoney(diningMoney + shoppingMoney),
      diningCount: dining.length,
      shoppingCount: shopping.length,
      orderCount: list.length,
      kcal: diningKcal,
      itemCount: diningItems,
      kcalLabel: diningKcal > 0 ? '千卡没吃' : '件商品',
      kcalValue: diningKcal > 0 ? diningKcal : diningItems,
      analysis: analyzeOrders(list),
    };
  });

  function refresh() {
    refreshTick.value++;
  }

  return { orders, stats, refresh };
});
