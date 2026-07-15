import { useId } from "react";

function DropDownMenu({
    id,
    name,
    label,
    data = [],
    value,
    placeholder = "학부/학과를 선택하세요",
    required = true,
    disabled,
    onChange,
}) {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
        <div className="flex flex-col">
            <label
                htmlFor={selectId}
                className="font-heading font-semibold text-xs text-fg-basic-muted"
            >
                {label}
            </label>
            <select
                id={selectId}
                name={name}
                value={value}
                required={required}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className="mt-2 w-full rounded-input border border-white bg-white px-4 py-3 font-heading text-sm text-fg-basic shadow-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:bg-ui-sub"
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {data.map(({ item, value: optionValue }) => (
                    <option
                        key={optionValue}
                        value={optionValue}>
                        {item}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default DropDownMenu;
