'use client';

import { Children, isValidElement, ReactElement, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

type OptionElement = ReactElement<{
  value?: string | number;
  disabled?: boolean;
  children?: ReactNode;
}>;

type GlassSelectProps = {
  children: ReactNode;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: { target: { value: string } }) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};

function optionLabel(children: ReactNode): string {
  return Children.toArray(children).join('');
}

function flattenOptions(children: ReactNode) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];

    if (child.type === 'optgroup') {
      return Children.toArray((child as OptionElement).props.children).flatMap((nested) => {
        if (!isValidElement(nested) || nested.type !== 'option') return [];
        const option = nested as OptionElement;
        const value = String(option.props.value ?? optionLabel(option.props.children));
        return [{ value, label: optionLabel(option.props.children), disabled: Boolean(option.props.disabled) }];
      });
    }

    if (child.type !== 'option') return [];
    const option = child as OptionElement;
    const value = String(option.props.value ?? optionLabel(option.props.children));
    return [{ value, label: optionLabel(option.props.children), disabled: Boolean(option.props.disabled) }];
  });
}

export default function GlassSelect({
  children,
  name,
  value,
  defaultValue,
  onChange,
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Select option',
}: GlassSelectProps) {
  const options = useMemo(() => flattenOptions(children), [children]);
  const controlled = value !== undefined;
  const initialValue = String(defaultValue ?? options[0]?.value ?? '');
  const [internalValue, setInternalValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedValue = controlled ? String(value ?? '') : internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updateMenuPosition = () => {
      const trigger = buttonRef.current?.getBoundingClientRect();
      if (!trigger) return;

      const viewportGap = 12;
      const menuHeight = Math.min(288, Math.max(48, menuRef.current?.offsetHeight ?? 288));
      const spaceBelow = window.innerHeight - trigger.bottom - viewportGap;
      const spaceAbove = trigger.top - viewportGap;
      const openAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      const top = openAbove
        ? Math.max(viewportGap, trigger.top - menuHeight - 8)
        : Math.min(trigger.bottom + 8, window.innerHeight - viewportGap);

      setMenuStyle({
        position: 'fixed',
        top,
        left: Math.max(viewportGap, trigger.left),
        width: trigger.width,
        maxHeight: openAbove ? Math.min(288, spaceAbove - 8) : Math.min(288, spaceBelow),
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
  }, [open, options.length]);

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
    if (controlled) return;

    const hasSelectedOption = options.some((option) => option.value === internalValue);
    if (!hasSelectedOption) {
      setInternalValue(options[0]?.value ?? '');
    }
  }, [controlled, internalValue, options]);

  useEffect(() => {
    const form = rootRef.current?.closest('form');
    if (!form || controlled) return;

    const handleReset = () => {
      setInternalValue(initialValue);
      setOpen(false);
    };

    form.addEventListener('reset', handleReset);
    return () => form.removeEventListener('reset', handleReset);
  }, [controlled, initialValue]);

  const commitValue = (nextValue: string) => {
    if (!controlled) setInternalValue(nextValue);
    onChange?.({ target: { value: nextValue } });
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name && (
        <input
          aria-hidden="true"
          tabIndex={-1}
          name={name}
          value={selectedValue}
          required={required}
          onChange={() => undefined}
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
      )}

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-indigo-400/30 bg-white/60 px-4 py-3 text-left font-semibold text-slate-900 shadow-[0_14px_36px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.76)] outline-none backdrop-blur-xl transition-all hover:border-indigo-400/50 hover:bg-white/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-300/30 dark:bg-slate-800/60 dark:text-white dark:shadow-[0_18px_44px_rgba(2,6,23,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-indigo-300/55 dark:hover:bg-slate-800/80"
      >
        <span className={selectedOption?.label ? '' : 'text-slate-500 dark:text-slate-300/70'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-indigo-600 transition-transform dark:text-indigo-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && mounted && createPortal(
        <div ref={menuRef} style={menuStyle} className="scrollbar-none min-w-max overflow-y-auto rounded-2xl border border-white/50 bg-white/84 p-1.5 text-slate-900 shadow-2xl shadow-slate-900/18 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/88 dark:text-white dark:shadow-black/40">
          {options.map((option) => {
            const selected = option.value === selectedValue;

            return (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                disabled={option.disabled}
                onClick={() => commitValue(option.value)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors ${
                  selected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 dark:bg-indigo-500'
                    : 'text-slate-700 hover:bg-indigo-500/10 hover:text-indigo-700 dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white'
                } ${option.disabled ? 'cursor-not-allowed opacity-40' : ''}`}
              >
                <span>{option.label}</span>
                {selected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
