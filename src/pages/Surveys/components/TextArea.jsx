function TextArea({label, placeholder, value, onChange, required = false, maxLength}) {
    return (
        <div className="flex flex-col gap-2 min-w-0">
            <label className="block text-sm font-sans font-bold text-fg-basic">
                {label}
                {required && <span className="ml-1 text-[#c04a67]" aria-hidden="true">*</span>}
            </label>
            <textarea
                className="h-[150px] rounded-textarea bg-white p-4 font-sans text-xs text-fg-basic shadow-sm"
                placeholder={placeholder}
                value={value}
                required={required}
                maxLength={maxLength}
                onChange={(event) => onChange?.(event.target.value)}
            />
        </div>
    );
}

export default TextArea;
