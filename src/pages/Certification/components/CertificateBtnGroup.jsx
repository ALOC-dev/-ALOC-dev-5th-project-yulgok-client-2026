import { useNavigate } from "react-router-dom";

function CertificateBtnGroup({prev, onSubmit, disabled = false}) {
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
                disabled={disabled}
                className="flex flex-1 justify-center h-movebtn rounded-movebtn bg-brand-primary font-sans font-bold text-white text-md px-4 py-3 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={onSubmit}
            > 
                인증 요청 보내기
            </button>
        </div>
    );
}

export default CertificateBtnGroup;
