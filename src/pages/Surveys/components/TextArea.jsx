function TextArea({label, placeholder}) {
    return (
        <div className="flex flex-col gap-2 min-w-0">
            <label className="block text-sm font-sans font-bold text-fg-basic">
                {label}
            </label>
            <textarea 
                className="h-[150px] bg-white rounded-textarea font-sans text-xs text-fg-basic"
                placeholder={placeholder}
            >
            </textarea>
        </div>
    );
}

export default TextArea;