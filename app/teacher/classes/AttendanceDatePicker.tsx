'use client';

import { useRouter } from 'next/navigation';
import GlassDatePicker from '@/components/GlassDatePicker';

export default function AttendanceDatePicker({ selectedDate }: { selectedDate: string }) {
  const router = useRouter();

  return (
    <GlassDatePicker
      value={selectedDate}
      max={new Date().toISOString().split('T')[0]}
      onChange={(date) => date && router.push(`/teacher/classes?date=${date}`)}
      className="w-full sm:w-auto"
    />
  );
}
