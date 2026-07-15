function ProgressBar({current, max=6}) {
    const proportion = (current/max)*100;

    return(
        <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-ui-sub">
                <div
                    className="h-full rounded-full bg-brand-primary"
                    style={{ width: `${proportion}%`}}
                />
            </div>

            <span className="text-fg-basic-muted text-xs font-sans font-semibold">
                {current}/{max}
            </span>
        </div>
    );
}

export default ProgressBar;