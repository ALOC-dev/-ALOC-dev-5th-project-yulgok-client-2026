import { useId } from "react";

// !--에러 처리부 작성해야함
function InlineInput({
    id,
    name,
    label,
    type,
    value,  // {변수} 형태로 props 넘겨야함
    placeholder,
    autoComplete,
    maxLength,
    labelStyle,
    inputStyle = "",
    endAdornment,
    showCharacterCount = false,
    errorMessage,
    required=true,
    disabled,
    onChange,
}) {
    const generatedId = useId();
    const inputId = id ?? generatedId;  // id 없을 때만 useId로 생성
    const currentLength = String(value ?? '').length;
    const shouldShowCharacterCount = showCharacterCount && Number.isInteger(maxLength);

    return(
        <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
                <label
                    htmlFor={inputId}
                    className={labelStyle || "font-heading font-semibold text-xs text-fg-basic-muted"}
                >
                    {label}
                </label>
                {(errorMessage || shouldShowCharacterCount) && (
                    <div className="flex shrink-0 items-center gap-2">
                        {errorMessage && (
                            <span
                                className="text-fg-error text-xs font-bold"
                                role="alert"
                            >
                                {errorMessage}
                            </span>
                        )}
                        {shouldShowCharacterCount && (
                            <span className="font-sans text-xs font-normal text-fg-basic-muted">
                                {currentLength}/{maxLength}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <div className="relative mt-2">
                <input
                    id={inputId}
                    name={name}
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    maxLength={maxLength}
                    required={required}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}  // 부모 컴포넌트는 input 변경 시 실행할 함수만 전달하면 됨
                    className={`w-full rounded-input border border-white bg-white px-4 py-3 font-heading text-sm text-fg-basic shadow-sm outline-none placeholder:text-fg-basic-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:bg-ui-sub ${endAdornment ? "pr-12" : ""} ${inputStyle}`}
                />
                {endAdornment && (
                    <div className="absolute inset-y-0 right-1 flex items-center">
                        {endAdornment}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InlineInput;
