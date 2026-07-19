import { useNavigate } from "react-router-dom";

function MoveBtnGroup({prev, onNext, nextDisabled = false, nextLabel = '다음'}) {
    const navigate = useNavigate();

    return(
        <div className="flex gap-2">
            <button
                type="button"
                className="flex justify-center h-movebtn w-prevbtn rounded-movebtn bg-ui-sub font-sans font-bold text-fg-basic text-md px-4 py-3"
                onClick={() => navigate(`${prev}`)}
            >
                이전
            </button>
            <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                className="flex h-movebtn flex-1 justify-center rounded-movebtn bg-brand-primary px-4 py-3 font-sans text-md font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            > 
                {nextLabel}
            </button>
        </div>
    );
}

export default MoveBtnGroup;
