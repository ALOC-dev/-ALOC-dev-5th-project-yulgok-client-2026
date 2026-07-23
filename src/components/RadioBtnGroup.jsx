function RadioBtnGroup({items = [], label, value: selectedValue, onChange, className = "", layout="", labelStyle="", required = false}) {
    return(
        <div className={`flex min-w-0 flex-col ${className}`}>
            <label className={`${labelStyle}`}>
                {label}
                {required && <span className="ml-1 text-[#c04a67]" aria-hidden="true">*</span>}
            </label>
            <div className={`mt-2 w-full gap-2 ${layout || "flex"}`}>
                {items.map(({item, value}) => {
                    const isSelected = selectedValue === value;

                    return(
                        <button
                            key={value}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                                onChange?.(value);
                            }}
                            className={[
                                "w-full min-w-0 rounded-select border-2 px-4 py-3 font-sans text-xs font-bold transition-transform active:scale-95",
                                isSelected
                                ? "border-brand-primary bg-white text-brand-primary"
                                : "border-transparent bg-white text-fg-basic"
                            ].join(" ")}
                        >
                            {isSelected && <span aria-hidden="true">✓ </span>}
                            {item}
                        </button>
                    );
            })}
            </div>
        </div>
    );
}

export default RadioBtnGroup;
