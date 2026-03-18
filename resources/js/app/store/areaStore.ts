import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Area {
  id: string;
  name: string;
  zone: string;
  neighborhood: string;
  lat: number;
  lng: number;
  storeIds: string[];
  color: string;
}

interface AreaState {
  selectedArea: Area | null;
  userLat: number | null;
  userLng: number | null;
  gpsActive: boolean;
  setArea: (area: Area) => void;
  setUserCoords: (lat: number, lng: number) => void;
  setGpsActive: (v: boolean) => void;
  clearArea: () => void;
}

export const MOCK_AREAS: Area[] = [
  {
    id: 'area-1',
    name: 'Centro',
    zone: 'Zona Norte',
    neighborhood: 'Centro Histórico',
    lat: 3.4516,
    lng: -76.532,
    storeIds: ['store-1', 'store-2', 'store-3'],
    color: 'from-violet-600 to-purple-700',
  },
  {
    id: 'area-2',
    name: 'El Poblado',
    zone: 'Zona Sur',
    neighborhood: 'El Poblado',
    lat: 3.4372,
    lng: -76.5225,
    storeIds: ['store-2', 'store-4', 'store-6'],
    color: 'from-emerald-500 to-teal-600',
  },
];

export const useAreaStore = create<AreaState>()(
  persist(
    (set) => ({
      selectedArea: null,
      userLat: null,
      userLng: null,
      gpsActive: false,
      setArea: (area) => set({ selectedArea: area }),
      setUserCoords: (lat, lng) => set({ userLat: lat, userLng: lng }),
      setGpsActive: (v) => set({ gpsActive: v }),
      clearArea: () =>
        set({ selectedArea: null, userLat: null, userLng: null, gpsActive: false }),
    }),
    { name: 'vecino-area' }
  )
);
