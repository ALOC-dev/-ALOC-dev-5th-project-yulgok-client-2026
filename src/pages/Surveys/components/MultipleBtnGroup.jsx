function MultipleBtnGroup({
    items = [],
    label,
    value = [],
    onChange,
    className = "",
    layout = "",
    labelStyle = "",
    maxSelections = 3,
}) {
    const selectedValues = Array.isArray(value) ? value : [];

    const handleClick = (itemValue) => {
        const isSelected = selectedValues.includes(itemValue);

        if (!isSelected && selectedValues.length >= maxSelections) {
            return;
        }

        const nextValue = isSelected
            ? selectedValues.filter((selectedValue) => selectedValue !== itemValue)
            : [...selectedValues, itemValue];

        onChange?.(nextValue);
    };

    return(
        <div className={`flex min-w-0 flex-col ${className}`}>
            <label className="block text-sm font-sans font-bold text-fg-basic">
                {label}
            </label>
            <div className={`mt-2 w-full gap-2 ${layout || "flex flex-wrap"}`}>
                {items.map(({item, value: itemValue}) => {
                    const isSelected = selectedValues.includes(itemValue);

                    return(
                        <button
                            key={itemValue}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => handleClick(itemValue)}
                            className={[
                                "w-fit shrink-0 rounded-select border border-transparent px-4 py-2 font-sans text-xs font-bold",
                                isSelected
                                ? "bg-brand-primary text-white"
                                : "bg-white text-fg-basic"
                            ].join(" ")}
                        >
                            {item}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default MultipleBtnGroup;
