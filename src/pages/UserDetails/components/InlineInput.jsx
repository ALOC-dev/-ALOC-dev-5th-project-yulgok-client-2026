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
    required=true,
    disabled,
    onChange,
}) {
    const generatedId = useId();
    const inputId = id ?? generatedId;  // id 없을 때만 useId로 생성

    return(
        <div className="flex flex-col">
            <label 
                htmlFor={inputId}
                className={labelStyle || "font-heading font-semibold text-xs text-fg-basic-muted"}
            >
                {label}
            </label>
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
                className={`mt-2 w-full rounded-input border border-white bg-white px-4 py-3 font-heading text-sm text-fg-basic shadow-sm outline-none placeholder:text-fg-basic-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:bg-ui-sub ${inputStyle}`}
            />
        </div>
    );
}

export default InlineInput;
