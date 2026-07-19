import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar.jsx'
import InlineInput from './components/InlineInput.jsx';
import RadioBtnGroup from '../../components/RadioBtnGroup.jsx';
import DropDownMenu from './components/DropDownMenu.jsx';
import MoveBtnGroup from '../../components/MoveBtnGroup.jsx';
import { postUserDetails } from '../../api/users/userDetails.js';

function UserDetails() {
    const navigate = useNavigate();
    const [realName, setRealName] = useState('');
    const [age, setAge] = useState(0);
    const [gender, setGender] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');    // 전화번호
    const [studentId, setStudentId] = useState('');
    const [department, setDepartment] = useState('');

    async function handleNext() {
        const requestBody = {
            realName: realName,
            age: Number(age),
            gender: gender,
            phoneNumber: phoneNumber,
            studentId: studentId,
            department: department
        };
        try {
            const responseBody = await postUserDetails(requestBody);
            console.log(responseBody.message);
            navigate('/surveys/sleep');
        } catch (error) {
            console.error(error);
        }
        
    }

    return (
        <main className="relative min-h-dvh p-5 flex flex-col bg-brand-background pb-[calc(16px+env(safe-area-inset-bottom))]">
            <ProgressBar current={1}/>
            <header className="flex flex-col my-6 gap-1">
                <p className="font-heading font-bold text-xs text-fg-secondary">
                    기본 정보
                </p>
                <h1 className="font-heading font-extrabold text-lg text-fg-primary">
                    본인 정보를 알려주세요
                </h1>
                <p className="font-heading text-xs text-fg-basic-muted">
                    서비스 이용을 위한 최소한의 정보만 받아요.
                </p>
            </header>
            <section className="flex flex-col flex-1 gap-4">
                <InlineInput
                    name="realName"
                    label="실명"
                    type="text"
                    value={realName}
                    placeholder="이룸매"
                    autoComplete="name"
                    onChange={setRealName}
                />
                <div className="flex gap-4">
                    <div className="min-w-0 flex-1">
                        <InlineInput
                            name="age"
                            label="나이"
                            type="number"
                            value={age}
                            placeholder="20"
                            autoComplete="age"
                            onChange={setAge}
                        />
                    </div>
                    <RadioBtnGroup
                        name="gender"
                        label="성별"
                        items={[
                            {item: "남", value:"MALE"},
                            {item: "여", value:"FEMALE"}
                        ]}
                        value={gender}
                        onChange={setGender}
                        className="flex-1"
                        labelStyle='font-heading font-semibold text-xs text-fg-basic-muted'
                    />
                </div>
                <InlineInput
                    name="phoneNumber"
                    label="전화번호"
                    type="tel"
                    value={phoneNumber}
                    placeholder="010-1234-5678"
                    autoComplete="tel"
                    onChange={setPhoneNumber}
                />
                <InlineInput
                    name="studentId"
                    label="학번"
                    type="number"
                    value={studentId}
                    placeholder="2026920000"
                    autoComplete="studentId"
                    onChange={setStudentId}
                />
                <DropDownMenu
                    name="department"
                    label="학부/학과"
                    items={[
                        "컴퓨터과학부"
                    ]}
                    value={department}
                    onChange={setDepartment}
                />
            </section>
            <MoveBtnGroup
                prev='/login'
                onNext={handleNext}
            />
        </main>
    );
}

export default UserDetails
