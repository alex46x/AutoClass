'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

type GlassDatePickerProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
};

const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const isoPattern = /^\d{4}-\d{2}-\d{2}$/;

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value?: string) {
  if (!value || !isoPattern.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDisplay(value?: string) {
  const date = parseIsoDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function isOutOfRange(iso: string, min?: string, max?: string) {
  return Boolean((min && iso < min) || (max && iso > max));
}

export default function GlassDatePicker({
  name,
  value,
  defaultValue = '',
  onChange,
  required = false,
  min,
  max,
  placeholder = 'Select date',
  className = '',
}: GlassDatePickerProps) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = controlled ? value : internalValue;
  const selectedDate = useMemo(() => parseIsoDate(selectedValue), [selectedValue]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [viewDate, setViewDate] = useState(selectedDate ?? new Date());
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDate) setViewDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updateMenuPosition = () => {
      const trigger = buttonRef.current?.getBoundingClientRect();
      if (!trigger) return;

      const viewportGap = 12;
      const menuWidth = Math.min(336, window.innerWidth - viewportGap * 2);
      const menuHeight = Math.min(420, Math.max(320, menuRef.current?.offsetHeight ?? 380));
      const spaceBelow = window.innerHeight - trigger.bottom - viewportGap;
      const spaceAbove = trigger.top - viewportGap;
      const openAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      const top = openAbove
        ? Math.max(viewportGap, trigger.top - menuHeight - 8)
        : Math.min(trigger.bottom + 8, window.innerHeight - viewportGap);
      const left = Math.min(
        Math.max(viewportGap, trigger.left),
        window.innerWidth - menuWidth - viewportGap
      );

      setMenuStyle({
        position: 'fixed',
        top,
        left,
        width: menuWidth,
        zIndex: 9999,
      });
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const form = rootRef.current?.closest('form');
    if (!form || controlled) return;

    const handleReset = () => {
      setInternalValue(defaultValue);
      setViewDate(parseIsoDate(defaultValue) ?? new Date());
      setOpen(false);
    };

    form.addEventListener('reset', handleReset);
    return () => form.removeEventListener('reset', handleReset);
  }, [controlled, defaultValue]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [viewDate]);

  const commitValue = (nextValue: string) => {
    if (!controlled) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const selectDate = (date: Date) => {
    const nextValue = toIsoDate(date);
    if (isOutOfRange(nextValue, min, max)) return;
    commitValue(nextValue);
    setOpen(false);
  };

  const moveMonth = (direction: -1 | 1) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + direction, 1));
  };

  const todayIso = toIsoDate(new Date());
  const canSelectToday = !isOutOfRange(todayIso, min, max);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name && (
        <input
          aria-hidden="true"
          tabIndex={-1}
          name={name}
          value={selectedValue ?? ''}
          required={required}
          onChange={() => undefined}
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-indigo-400/30 bg-white/60 px-4 py-3 text-left font-semibold text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.76)] outline-none backdrop-blur-xl transition-all hover:border-indigo-400/50 hover:bg-white/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-indigo-300/30 dark:bg-slate-800/60 dark:text-white dark:shadow-[0_18px_44px_rgba(2,6,23,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-indigo-300/55 dark:hover:bg-slate-800/80"
      >
        <span className={selectedValue ? '' : 'text-slate-500 dark:text-slate-300/70'}>
          {formatDisplay(selectedValue) || placeholder}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-300" />
      </button>

      {open && mounted && createPortal(
        <div ref={menuRef} style={menuStyle} className="scrollbar-none rounded-2xl border border-white/50 bg-white/82 p-3 text-slate-900 shadow-2xl shadow-slate-900/18 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/86 dark:text-white dark:shadow-black/40">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-600 transition-colors hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-white/10"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-center">
              <p className="text-sm font-black">
                {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(viewDate)}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pick a date</p>
            </div>

            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-600 transition-colors hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-white/10"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 pb-1">
            {dayLabels.map((day) => (
              <div key={day} className="py-1 text-center text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const iso = toIsoDate(date);
              const inMonth = date.getMonth() === viewDate.getMonth();
              const selected = iso === selectedValue;
              const today = iso === todayIso;
              const disabled = isOutOfRange(iso, min, max);

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDate(date)}
                  className={`grid h-9 place-items-center rounded-xl text-sm font-bold transition-all ${
                    selected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 dark:bg-indigo-500'
                      : today
                        ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-200 dark:ring-indigo-400/30'
                        : inMonth
                          ? 'text-slate-800 hover:bg-slate-900/5 dark:text-slate-100 dark:hover:bg-white/10'
                          : 'text-slate-400 hover:bg-slate-900/5 dark:text-slate-600 dark:hover:bg-white/5'
                  } ${disabled ? 'cursor-not-allowed opacity-35 hover:bg-transparent' : ''}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-white/10">
            <button
              type="button"
              onClick={() => commitValue('')}
              className="rounded-lg px-3 py-2 text-xs font-black text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={!canSelectToday}
              onClick={() => selectDate(new Date())}
              className="rounded-lg px-3 py-2 text-xs font-black text-indigo-600 transition-colors hover:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-400/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
