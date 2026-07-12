import type { TicketPassInfo } from '@/services/ticketRushService';
import { findDishInStore, findStore } from '@/services/storeService';

export const CINEMA_STORE_ID = 'l1';
export const MOVIE_MAX_SEATS = 4;

export type MovieShowtime = {
  id: string;
  label: string;
  hall: string;
  time: string;
};

export type MovieSeatStatus = 'available' | 'sold' | 'selected';

export type MovieSeat = {
  id: string;
  row: number;
  col: number;
  label: string;
  status: MovieSeatStatus;
};

function hashSeed(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export function isCinemaStore(restId?: string | null) {
  return restId === CINEMA_STORE_ID;
}

export function getMovieShowtimes(dishId: string): MovieShowtime[] {
  const seed = hashSeed(dishId);
  const halls = ['1号激光厅', '2号IMAX厅', '3号杜比厅', '4号巨幕厅'];
  const slots = [
    { day: '今天', times: ['13:20', '15:50', '19:40', '22:10'] },
    { day: '明天', times: ['10:30', '14:00', '18:20', '21:00'] },
  ];
  const out: MovieShowtime[] = [];
  slots.forEach((slot, si) => {
    slot.times.forEach((t, ti) => {
      const hall = halls[(seed + si * 3 + ti) % halls.length];
      out.push({
        id: `${dishId}-${si}-${ti}`,
        label: `${slot.day} ${t}`,
        hall,
        time: `${slot.day} ${t}`,
      });
    });
  });
  return out.slice(0, 6);
}

/** 生成影厅座位图：部分座位已售 */
export function buildMovieSeatMap(dishId: string, showtimeId: string, rows = 8, cols = 10): MovieSeat[] {
  const seed = hashSeed(`${dishId}|${showtimeId}`);
  const seats: MovieSeat[] = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const n = (seed + r * 17 + c * 31) % 100;
      const sold = n < 28 || (r === 1 && c >= 4 && c <= 7); // 前排中间常卖完
      seats.push({
        id: `${r}-${c}`,
        row: r,
        col: c,
        label: `${r}排${c}座`,
        status: sold ? 'sold' : 'available',
      });
    }
  }
  return seats;
}

export function toggleMovieSeat(seats: MovieSeat[], seatId: string, selectedIds: string[]): string[] {
  const seat = seats.find((s) => s.id === seatId);
  if (!seat || seat.status === 'sold') return selectedIds;
  if (selectedIds.includes(seatId)) return selectedIds.filter((id) => id !== seatId);
  if (selectedIds.length >= MOVIE_MAX_SEATS) return selectedIds;
  return [...selectedIds, seatId];
}

export function movieSeatLabels(seats: MovieSeat[], selectedIds: string[]) {
  return selectedIds
    .map((id) => seats.find((s) => s.id === id)?.label)
    .filter(Boolean) as string[];
}

export function buildMovieTicketPass(opts: {
  restId: string;
  dishId: string;
  showtime: MovieShowtime;
  seatLabels: string[];
}): TicketPassInfo | null {
  const store = findStore(opts.restId);
  const dish = findDishInStore(opts.restId, opts.dishId);
  if (!store || !dish || !opts.seatLabels.length) return null;
  const title = dish.name.replace(/票$/, '') || dish.name;
  return {
    artist: title,
    title: `${dish.name} · ${opts.showtime.hall}`,
    venue: opts.showtime.hall,
    showTime: opts.showtime.time,
    seat: opts.seatLabels.join('、'),
    city: store.name,
    emoji: dish.emoji || '🎬',
    count: opts.seatLabels.length,
  };
}
