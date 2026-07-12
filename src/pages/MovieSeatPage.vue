<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatMoney } from '@/core/money';
import {
  buildMovieSeatMap,
  buildMovieTicketPass,
  getMovieShowtimes,
  isCinemaStore,
  movieSeatLabels,
  MOVIE_MAX_SEATS,
  toggleMovieSeat,
  type MovieShowtime,
} from '@/services/movieSeatService';
import { findDishInStore, findStore } from '@/services/storeService';
import { useCartStore } from '@/stores/cart';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const ui = useUiStore();

const restId = computed(() => String(route.params.restId || ''));
const dishId = computed(() => String(route.params.dishId || ''));

const store = computed(() => findStore(restId.value));
const dish = computed(() => findDishInStore(restId.value, dishId.value));

const showtimes = computed(() => (dishId.value ? getMovieShowtimes(dishId.value) : []));
const selectedShowId = ref('');
const selectedSeatIds = ref<string[]>([]);

watch(
  showtimes,
  (list) => {
    if (!list.length) return;
    if (!list.some((s) => s.id === selectedShowId.value)) {
      selectedShowId.value = list[0].id;
      selectedSeatIds.value = [];
    }
  },
  { immediate: true },
);

const selectedShow = computed(
  () => showtimes.value.find((s) => s.id === selectedShowId.value) || null,
);

const seatMap = computed(() => {
  if (!dishId.value || !selectedShowId.value) return [];
  return buildMovieSeatMap(dishId.value, selectedShowId.value);
});

const rows = computed(() => {
  const map = new Map<number, typeof seatMap.value>();
  seatMap.value.forEach((seat) => {
    const row = map.get(seat.row) || [];
    row.push(seat);
    map.set(seat.row, row);
  });
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([row, seats]) => ({ row, seats: seats.sort((a, b) => a.col - b.col) }));
});

const seatLabels = computed(() => movieSeatLabels(seatMap.value, selectedSeatIds.value));
const totalPay = computed(() => (dish.value ? dish.value.price * selectedSeatIds.value.length : 0));

function pickShow(show: MovieShowtime) {
  selectedShowId.value = show.id;
  selectedSeatIds.value = [];
}

function pickSeat(seatId: string) {
  const seat = seatMap.value.find((s) => s.id === seatId);
  if (!seat || seat.status === 'sold') {
    ui.toast('这个位子已经被脑补卖掉了');
    return;
  }
  if (!selectedSeatIds.value.includes(seatId) && selectedSeatIds.value.length >= MOVIE_MAX_SEATS) {
    ui.toast(`一次最多选 ${MOVIE_MAX_SEATS} 个座位`);
    return;
  }
  selectedSeatIds.value = toggleMovieSeat(seatMap.value, seatId, selectedSeatIds.value);
}

function goBack() {
  router.push(`/store/${restId.value}`);
}

function confirmSeats() {
  if (!isCinemaStore(restId.value) || !store.value || !dish.value || !selectedShow.value) {
    ui.toast('场次走丢了，回影城再选一次');
    return;
  }
  if (!seatLabels.value.length) {
    ui.toast('先选个座位再付款呀');
    return;
  }
  const pass = buildMovieTicketPass({
    restId: restId.value,
    dishId: dishId.value,
    showtime: selectedShow.value,
    seatLabels: seatLabels.value,
  });
  const ok = cart.primeMovieTicket(
    restId.value,
    dishId.value,
    seatLabels.value.length,
    dish.value.price,
    pass,
  );
  if (!ok) return;
  if (!cart.prepareCheckout('leisure')) return;
  ui.toast(`已选 ${seatLabels.value.join('、')}`);
  router.push({ path: '/checkout', query: { from: 'movie-seat' } });
}
</script>

<template>
  <div v-if="store && dish" class="page active movie-seat-page">
    <header class="simple-header">
      <button class="back-btn" type="button" @click="goBack">‹</button>
      <span>选座购票</span>
    </header>

    <div class="movie-seat-body">
      <div class="movie-seat-hero">
        <div class="movie-seat-emoji">{{ dish.emoji }}</div>
        <div class="movie-seat-info">
          <div class="movie-seat-name">{{ dish.name }}</div>
          <div class="movie-seat-meta">{{ store.name }} · ¥{{ formatMoney(dish.price) }}/张</div>
        </div>
      </div>

      <div class="movie-panel">
        <div class="movie-panel-title">场次</div>
        <div class="movie-show-grid">
          <button
            v-for="show in showtimes"
            :key="show.id"
            type="button"
            class="movie-show-chip"
            :class="{ active: selectedShowId === show.id }"
            @click="pickShow(show)"
          >
            <span class="movie-show-time">{{ show.label }}</span>
            <span class="movie-show-hall">{{ show.hall }}</span>
          </button>
        </div>
      </div>

      <div class="movie-panel">
        <div class="movie-screen">银幕</div>
        <div class="movie-legend">
          <span><i class="seat-dot available" />可选</span>
          <span><i class="seat-dot sold" />已售</span>
          <span><i class="seat-dot selected" />已选</span>
        </div>
        <div class="movie-seat-map">
          <div v-for="row in rows" :key="row.row" class="movie-seat-row">
            <span class="movie-row-label">{{ row.row }}</span>
            <button
              v-for="seat in row.seats"
              :key="seat.id"
              type="button"
              class="movie-seat"
              :class="{
                sold: seat.status === 'sold',
                selected: selectedSeatIds.includes(seat.id),
              }"
              :disabled="seat.status === 'sold'"
              @click="pickSeat(seat.id)"
            >
              {{ seat.col }}
            </button>
          </div>
        </div>
      </div>

      <div class="movie-selected">
        <div v-if="seatLabels.length" class="movie-selected-seats">
          已选：{{ seatLabels.join('、') }}
        </div>
        <div v-else class="movie-selected-seats muted">点座位选座，最多 {{ MOVIE_MAX_SEATS }} 张</div>
      </div>
    </div>

    <div class="movie-seat-footer">
      <div class="movie-seat-total">
        合计 <b>¥{{ formatMoney(totalPay) }}</b>
        <span v-if="seatLabels.length"> · {{ seatLabels.length }}张</span>
      </div>
      <button
        class="pay-btn"
        type="button"
        :class="{ disabled: !seatLabels.length }"
        @click="confirmSeats"
      >
        确认选座
      </button>
    </div>
  </div>

  <div v-else class="page active">
    <div class="cart-empty" style="min-height:70vh">
      <div class="cart-empty-emoji">🎬</div>
      <div class="cart-empty-title">影片找不到了</div>
      <button class="cart-empty-btn" type="button" @click="router.push('/home?cat=leisure')">回玩了么 ›</button>
    </div>
  </div>
</template>
