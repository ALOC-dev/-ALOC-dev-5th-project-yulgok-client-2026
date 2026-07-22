function DormitoryImageUploader({ imageUrl, onChange }) {
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (file) {
            onChange?.(file);
        }

        event.target.value = "";
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex min-h-40 flex-col items-center justify-center overflow-hidden rounded-[24px] bg-ui-sub px-4 py-4">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="기숙사 합격 화면 미리보기"
                        className="max-h-44 w-full rounded-select object-contain"
                    />
                ) : (
                    <>
                        <div className="mb-3 w-32 rotate-[-4deg] rounded-select bg-white p-3 shadow-sm">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-ui-sub" />
                                <div className="flex flex-1 flex-col gap-1.5">
                                    <div className="h-1.5 w-full rounded-full bg-ui-sub" />
                                    <div className="h-1.5 w-2/3 rounded-full bg-ui-sub" />
                                </div>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-ui-sub" />
                            <p className="mt-2 text-right text-[7px] font-bold text-fg-secondary">
                                RESIDENT · 2026
                            </p>
                        </div>
                        <p className="font-heading text-sm font-bold text-fg-primary">
                            기숙사 합격 화면 캡처
                        </p>
                        <p className="mt-1 text-center text-xs text-fg-basic-muted">
                            대학행정 페이지에서 본인의 이름이 포함된 화면을 캡처해주세요.
                        </p>
                    </>
                )}
            </div>

            <label className="flex h-12 cursor-pointer items-center justify-center rounded-full bg-[#7c32df] px-4 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-80 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#7c32df]">
                {imageUrl ? "다른 사진 선택" : "앨범에서 선택"}
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpg,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleFileChange}
                />
            </label>
        </div>
    );
}

export default DormitoryImageUploader;
