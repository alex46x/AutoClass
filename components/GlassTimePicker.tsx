'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Clock3 } from 'lucide-react';

type GlassTimePickerProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

type TimeParts = {
  hour12: number;
  minute: number;
  period: 'AM' | 'PM';
};

const hours = Array.from({ length: 12 }, (_, index) => index + 1);
const minutes = Array.from({ length: 60 }, (_, index) => index);
const periods: TimeParts['period'][] = ['AM', 'PM'];
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parseTime(value?: string): TimeParts | null {
  if (!value || !timePattern.test(value)) return null;
  const [hourText, minuteText] = value.split(':');
  const hour24 = Number(hourText);
  const minute = Number(minuteText);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return { hour12, minute, period };
}

function toTimeValue(parts: TimeParts) {
  const hour24 = parts.period === 'PM'
    ? (parts.hour12 === 12 ? 12 : parts.hour12 + 12)
    : (parts.hour12 === 12 ? 0 : parts.hour12);

  return `${String(hour24).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}

function formatTime(value?: string) {
  const parts = parseTime(value);
  if (!parts) return '';
  return `${String(parts.hour12).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')} ${parts.period}`;
}

function fallbackParts(): TimeParts {
  return { hour12: 9, minute: 0, period: 'AM' };
}

export default function GlassTimePicker({
  name,
  value,
  defaultValue = '',
  onChange,
  required = false,
  placeholder = 'Select time',
  className = '',
}: GlassTimePickerProps) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = controlled ? value : internalValue;
  const selectedParts = parseTime(selectedValue);
  const [draftParts, setDraftParts] = useState<TimeParts>(selectedParts ?? fallbackParts());
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedParts) setDraftParts(selectedParts);
  }, [selectedValue]);

  useEffect(() => {
    if (!open) return;

    const updateMenuPosition = () => {
      const trigger = buttonRef.current?.getBoundingClientRect();
      if (!trigger) return;

      const viewportGap = 12;
      const menuWidth = Math.min(276, window.innerWidth - viewportGap * 2);
      const menuHeight = Math.min(360, Math.max(280, menuRef.current?.offsetHeight ?? 320));
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
      setDraftParts(parseTime(defaultValue) ?? fallbackParts());
      setOpen(false);
    };

    form.addEventListener('reset', handleReset);
    return () => form.removeEventListener('reset', handleReset);
  }, [controlled, defaultValue]);

  const commitParts = (parts: TimeParts, close = false) => {
    setDraftParts(parts);
    const nextValue = toTimeValue(parts);
    if (!controlled) setInternalValue(nextValue);
    onChange?.(nextValue);
    if (close) setOpen(false);
  };

  const setNow = () => {
    const now = new Date();
    const parts = parseTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`) ?? fallbackParts();
    commitParts(parts, true);
  };

  const columnButtonClass = (active: boolean) =>
    `flex h-9 w-full items-center justify-center rounded-xl text-sm font-black transition-colors ${
      active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 dark:bg-indigo-500'
        : 'text-slate-700 hover:bg-indigo-500/10 hover:text-indigo-700 dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white'
    }`;

  const displayedValue = useMemo(() => formatTime(selectedValue), [selectedValue]);

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
        <span className={displayedValue ? '' : 'text-slate-500 dark:text-slate-300/70'}>
          {displayedValue || placeholder}
        </span>
        <Clock3 className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-300" />
      </button>

      {open && mounted && createPortal(
        <div ref={menuRef} style={menuStyle} className="rounded-2xl border border-white/50 bg-white/84 p-3 text-slate-900 shadow-2xl shadow-slate-900/18 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/88 dark:text-white dark:shadow-black/40">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-black">{formatTime(toTimeValue(draftParts))}</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pick a time</p>
            </div>
            <Check className="h-4 w-4 text-indigo-500" />
          </div>

          <div className="grid grid-cols-[1fr_1fr_0.9fr] gap-2">
            <div>
              <p className="mb-1 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Hour</p>
              <div className="scrollbar-none max-h-52 space-y-1 overflow-y-auto">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => commitParts({ ...draftParts, hour12: hour })}
                    className={columnButtonClass(draftParts.hour12 === hour)}
                  >
                    {String(hour).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Minute</p>
              <div className="scrollbar-none max-h-52 space-y-1 overflow-y-auto">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => commitParts({ ...draftParts, minute })}
                    className={columnButtonClass(draftParts.minute === minute)}
                  >
                    {String(minute).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Mode</p>
              <div className="space-y-1">
                {periods.map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => commitParts({ ...draftParts, period })}
                    className={columnButtonClass(draftParts.period === period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                if (!controlled) setInternalValue('');
                onChange?.('');
                setOpen(false);
              }}
              className="rounded-lg px-3 py-2 text-xs font-black text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={setNow}
              className="rounded-lg px-3 py-2 text-xs font-black text-indigo-600 transition-colors hover:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-400/10"
            >
              Now
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
