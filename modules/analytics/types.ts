export interface TrendPoint {
  label: string;
  count: number;
}

export interface RatingTrendPoint {
  label: string;
  avgRating: number;
  count: number;
}

export interface DoctorRanking {
  doctorId: number;
  doctorName: string;
  value: number;
}

export interface StatusBreakdownItem {
  status: string;
  count: number;
}
