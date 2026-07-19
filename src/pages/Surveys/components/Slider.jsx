import { useId } from "react";

function Slider({
    range = 5,
    value,
    label,
    leftDescription,
    rightDescription,
    onChange,
    required = false,
}) {
    const sliderId = useId();
    const lastValue = Math.max(1, Math.floor(Number(range) || 1));
    const values = Array.from({ length: lastValue }, (_, index) => index + 1);
    const hasValue = Number.isInteger(value) && value >= 1 && value <= lastValue;
    const inputValue = hasValue ? value : 1;

    const handleChange = (event) => {
        const nextValue = Number(event.target.value);

        onChange?.(nextValue);
    };

    return (
        <div className="w-full font-sans">
            {label && (
                <label
                    htmlFor={sliderId}
                    className="block text-sm font-bold text-fg-basic"
                >
                    {label}
                    {required && <span className="ml-1 text-[#c04a67]" aria-hidden="true">*</span>}
                </label>
            )}

            <div className={label ? "mt-6" : ""}>
                <div className="relative h-5">
                    <div className="absolute inset-x-[10px] top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#DDE6F2]" />

                    <div className="absolute inset-x-[10px] top-1/2 flex -translate-y-1/2 items-center justify-between">
                        {values.map((item) => (
                            <span
                                key={item}
                                aria-hidden="true"
                                className="h-2.5 w-0.5 rounded-full bg-[#9EADC2]"
                            />
                        ))}
                    </div>

                    <input
                        id={sliderId}
                        type="range"
                        min="1"
                        max={lastValue}
                        step="1"
                        value={inputValue}
                        onChange={handleChange}
                        aria-label={label || "범위 선택"}
                        aria-required={required}
                        className={`absolute inset-0 z-10 m-0 h-5 w-full cursor-pointer appearance-none bg-transparent outline-none [&::-moz-range-progress]:h-1 [&::-moz-range-progress]:bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#0B43A7] [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(11,67,167,0.35)] [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-8px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0B43A7] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(11,67,167,0.35)] active:[&::-moz-range-thumb]:cursor-grabbing active:[&::-webkit-slider-thumb]:cursor-grabbing focus-visible:[&::-moz-range-thumb]:ring-4 focus-visible:[&::-moz-range-thumb]:ring-[#0B43A7]/20 focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-[#0B43A7]/20 ${hasValue ? '' : 'opacity-45'}`}
                    />
                </div>

                <div className="relative mx-[10px] mt-2 h-4 text-xs text-fg-basic-muted">
                    {values.map((item) => (
                        <span
                            key={item}
                            style={{
                                left: lastValue === 1
                                    ? "50%"
                                    : `${((item - 1) / (lastValue - 1)) * 100}%`,
                            }}
                            className={`absolute top-0 -translate-x-1/2 text-center ${
                                item === value && hasValue
                                    ? "font-bold text-[#153D7A]"
                                    : "font-medium"
                            }`}
                        >
                            {item}
                        </span>
                    ))}
                </div>

                {(leftDescription || rightDescription) && (
                    <div className="mt-2 flex justify-between gap-4 text-[10px] leading-4 text-[#7D8BA1]">
                        <span>{leftDescription}</span>
                        <span className="text-right">{rightDescription}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Slider;
