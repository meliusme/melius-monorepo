import {
  useId,
  useMemo,
  useState,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  ChangeEventHandler,
} from 'react';
import styles from './input.module.scss';
import Icon from '@/components/atoms/icon/icon';
import EyeOpenIcon from '@/assets/icons/eye-open.svg';
import EyeClosedIcon from '@/assets/icons/eye-closed.svg';

export type InputVariant = 'normal' | 'password' | 'textarea';

type BaseInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;
type BaseTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>;

export interface InputProps extends Partial<BaseInputProps & BaseTextareaProps> {
  name: string;
  label: string;
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  variant?: InputVariant;
  large?: boolean;
  width?: number;
  errors?: string[];
  error?: string;
}

function setRef<T>(ref: unknown, value: T | null) {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  if (typeof ref === 'object' && 'current' in (ref as any)) {
    (ref as any).current = value;
  }
}

function mergeRefs<T>(...refs: unknown[]) {
  return (value: T | null) => {
    for (const ref of refs) setRef<T>(ref, value);
  };
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  function Input(
    {
      name,
      label,
      type = 'text',
      variant = 'normal',
      large = false,
      width,
      className,
      errors,
      error,
      defaultValue,
      value,
      onChange,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const id = (rest as any).id ?? `${name}-${autoId}`;
    const errorId = `${id}-errors`;

    const isPassword = variant === 'password';
    const isTextarea = variant === 'textarea';

    const [showPassword, setShowPassword] = useState(false);
    const toggleEye = () => setShowPassword((v) => !v);

    const mergedErrors = useMemo(() => {
      const arr = errors?.filter(Boolean) ?? [];
      if (error) arr.unshift(error);
      return arr;
    }, [errors, error]);

    const isError = mergedErrors.length > 0;

    const [hasValue, setHasValue] = useState<boolean>(() => {
      const v = value ?? defaultValue;
      return v !== undefined && v !== null && String(v).length > 0;
    });

    const wrapperClass = [styles.wrapper, className ?? ''].filter(Boolean).join(' ');

    const controlClass = [
      styles.control,
      large ? styles.large : '',
      isError ? styles.controlError : '',
      isPassword ? styles.withEye : '',
    ]
      .filter(Boolean)
      .join(' ');

    const labelClass = [
      styles.label,
      hasValue || (value !== undefined && String(value).length > 0)
        ? styles.hasValue
        : '',
    ]
      .filter(Boolean)
      .join(' ');

    const sharedStyle = width
      ? ({ width: `${width}px` } as const)
      : ({ width: '100%' } as const);

    const { ref: registerRef, ...restProps } = rest as any;
    const combinedRef = mergeRefs<HTMLInputElement | HTMLTextAreaElement>(
      ref,
      registerRef,
    );

    const handleChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
      e,
    ) => {
      setHasValue(e.target.value.length > 0);
      onChange?.(e as any);
    };

    const effectiveType = isPassword ? (showPassword ? 'text' : type) : type;

    return (
      <div className={styles.root}>
        <div className={wrapperClass}>
          <label htmlFor={id} className={labelClass}>
            {label}
          </label>

          {isTextarea ? (
            <textarea
              ref={combinedRef as any}
              id={id}
              name={name}
              className={controlClass}
              style={sharedStyle}
              onChange={handleChange}
              defaultValue={defaultValue as any}
              value={value as any}
              aria-invalid={isError}
              aria-describedby={isError ? errorId : undefined}
              {...(restProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={combinedRef as any}
              id={id}
              name={name}
              type={effectiveType}
              className={controlClass}
              style={sharedStyle}
              onChange={handleChange}
              defaultValue={defaultValue as any}
              value={value as any}
              aria-invalid={isError}
              aria-describedby={isError ? errorId : undefined}
              {...(restProps as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {isPassword ? (
            <div
              role="button"
              tabIndex={-1}
              className={styles.eye}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleEye();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleEye();
                }
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon src={showPassword ? EyeOpenIcon : EyeClosedIcon} />
            </div>
          ) : null}
        </div>

        {mergedErrors.length ? (
          <div id={errorId} className={styles.errors} aria-live="polite">
            {mergedErrors.map((msg) => (
              <span key={msg} className={styles.errorLine}>
                {msg}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);
