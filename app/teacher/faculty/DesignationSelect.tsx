'use client';

import { useState } from 'react';
import { updateTeacherDesignation } from '@/app/actions/head';
import GlassSelect from '@/components/GlassSelect';

const DESIGNATIONS = [
  'Lecturer',
  'Senior Lecturer',
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Visiting Professor',
  'Adjunct Faculty',
];

export default function DesignationSelect({ teacherId, currentDesignation }: { teacherId: number, currentDesignation: string }) {
  const [loading, setLoading] = useState(false);
  const normalizedDesignation = DESIGNATIONS.includes(currentDesignation) ? currentDesignation : 'Lecturer';
  const [designation, setDesignation] = useState(normalizedDesignation);

  const handleChange = async (e: { target: { value: string } }) => {
    const newDesignation = e.target.value;
    setDesignation(newDesignation);
    setLoading(true);
    try {
      await updateTeacherDesignation(teacherId, newDesignation);
    } catch (err: any) {
      alert(err.message || 'Failed to update designation');
      setDesignation(normalizedDesignation);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-56">
      <GlassSelect
        value={designation}
        onChange={handleChange}
        disabled={loading}
        className="w-full"
      >
        {DESIGNATIONS.map((desig) => (
          <option key={desig} value={desig}>
            {desig}
          </option>
        ))}
      </GlassSelect>
    </div>
  );
}
