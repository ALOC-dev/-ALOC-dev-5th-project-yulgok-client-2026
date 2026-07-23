import { useEffect, useId, useMemo, useRef, useState } from "react";
import { sortKoreanItems } from "./sortKoreanItems.js";

function DropDownMenu({
    id,
    name,
    label,
    items = [],
    value,
    placeholder = "학부/학과를 선택하세요",
    required = true,
    disabled,
    onChange,
}) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const listboxId = `${selectId}-listbox`;
    const rootRef = useRef(null);
    const optionRefs = useRef([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const sortedItems = useMemo(() => sortKoreanItems(items), [items]);

    const openListbox = () => {
        if (disabled || sortedItems.length === 0) return;

        const selectedIndex = sortedItems.indexOf(value);
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setIsOpen(true);
    };

    const closeListbox = () => {
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const selectItem = (item) => {
        onChange?.(item);
        closeListbox();
    };

    useEffect(() => {
        if (!isOpen) return undefined;

        const handlePointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                closeListbox();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || activeIndex < 0) return;

        optionRefs.current[activeIndex]?.scrollIntoView({
            block: "nearest",
        });
    }, [activeIndex, isOpen]);

    const handleKeyDown = (event) => {
        if (disabled) return;

        if (!isOpen) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
                event.preventDefault();
                openListbox();
            }
            return;
        }

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setActiveIndex((current) => (current + 1) % sortedItems.length);
                break;
            case "ArrowUp":
                event.preventDefault();
                setActiveIndex((current) => (
                    current <= 0 ? sortedItems.length - 1 : current - 1
                ));
                break;
            case "Home":
                event.preventDefault();
                setActiveIndex(0);
                break;
            case "End":
                event.preventDefault();
                setActiveIndex(sortedItems.length - 1);
                break;
            case "Enter":
            case " ":
                event.preventDefault();
                if (activeIndex >= 0) selectItem(sortedItems[activeIndex]);
                break;
            case "Escape":
                event.preventDefault();
                closeListbox();
                break;
            case "Tab":
                closeListbox();
                break;
            default:
                break;
        }
    };

    return (
        <div ref={rootRef} className="relative flex flex-col">
            <label
                htmlFor={selectId}
                className="font-heading font-semibold text-xs text-fg-basic-muted"
            >
                {label}
            </label>
            <input type="hidden" name={name} value={value} />
            <button
                type="button"
                id={selectId}
                role="combobox"
                aria-autocomplete="none"
                aria-controls={listboxId}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-activedescendant={
                    isOpen && activeIndex >= 0
                        ? `${selectId}-option-${activeIndex}`
                        : undefined
                }
                aria-required={required}
                disabled={disabled}
                onClick={() => (isOpen ? closeListbox() : openListbox())}
                onKeyDown={handleKeyDown}
                className={[
                    "mt-2 flex w-full items-center justify-between gap-3 rounded-input border bg-white px-4 py-3 text-left font-heading text-sm shadow-sm outline-none transition",
                    "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
                    "disabled:cursor-not-allowed disabled:bg-ui-sub",
                    isOpen ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-white",
                    value ? "text-fg-basic" : "text-fg-basic-muted",
                ].join(" ")}
            >
                <span className="min-w-0 flex-1 truncate">
                    {value || placeholder}
                </span>
                <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className={`size-5 shrink-0 text-fg-basic-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                >
                    <path
                        d="m5 7.5 5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            {isOpen && (
                <ul
                    id={listboxId}
                    role="listbox"
                    aria-label={label}
                    className="absolute top-full z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-select border border-ui-sub bg-white p-2 shadow-[0_14px_32px_rgba(29,61,122,0.16)]"
                >
                    {sortedItems.map((item, index) => {
                        const isSelected = item === value;
                        const isActive = index === activeIndex;

                        return (
                            <li
                                ref={(element) => {
                                    optionRefs.current[index] = element;
                                }}
                                id={`${selectId}-option-${index}`}
                                key={item}
                                role="option"
                                aria-selected={isSelected}
                                onPointerMove={() => setActiveIndex(index)}
                                onClick={() => selectItem(item)}
                                className={[
                                    "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-heading text-sm transition-colors",
                                    isSelected
                                        ? "bg-brand-primary font-semibold text-white"
                                        : isActive
                                            ? "bg-ui-sub text-fg-primary"
                                            : "text-fg-basic hover:bg-brand-background",
                                ].join(" ")}
                            >
                                <span>{item}</span>
                                {isSelected && (
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 20 20"
                                        className="size-4 shrink-0"
                                        fill="none"
                                    >
                                        <path
                                            d="m4.5 10 3.5 3.5 7.5-7.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default DropDownMenu;
