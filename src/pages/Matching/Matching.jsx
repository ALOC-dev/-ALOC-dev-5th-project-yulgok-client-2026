import { useEffect, useState } from 'react';
import { getMatchingStatus, executeMatching } from '../../api/matching/matching.js';
import MatchingCardStack from './components/MatchingCardStack.jsx';
import ExeMatchBtn from './components/ExeMatchBtn.jsx';

// const mockData = [
//         {
//             "userId": "01ARZ3NDEK...",
//             "name": "홍길동",
//             "gender": "MALE",
//             "age": 22,
//             "introduce": "안녕하세요",
//             "department": "컴퓨터과학부",
//             "studentId": "20210001",
//             "matchPercentage": 87.5,
//             "matchStatus": "RECOMMENDED",
//             "matchDate": "2026-07-07T15:30:12",
//             "preferredAnswers": [
//                 {
//                     "field": "BEDTIME",
//                     "value": 2
//                 },
//                 {
//                     "field": "SNORING",
//                     "value": 1
//                 }
//             ]
//         },
//         {
//             "userId": "01ARZ3NDEL...",
//             "name": "김철수",
//             "gender": "MALE",
//             "age": 21,
//             "introduce": "반갑습니다",
//             "department": "전자전기컴퓨터공학부",
//             "studentId": "20220002",
//             "matchPercentage": 75.0,
//             "matchStatus": "HEART_MATCHED",
//             "matchDate": "2026-07-06T12:30:12",
//             "preferredAnswers": [
//                 {
//                     "field": "ORGANIZING_STYLE",
//                     "value": 4
//                 },
//                 {
//                     "field": "CALL_IN_ROOM",
//                     "value": 1
//                 },
//                 {
//                     "field": "TEMPERATURE_PREFERENCE",
//                     "value": 2
//                 }
//             ]
//         },
//         {
//             "userId": "01ARZ3NDEM...",
//             "name": "이영희",
//             "gender": "MALE",
//             "age": 23,
//             "introduce": "잘 부탁드려요",
//             "department": "기계공학과",
//             "studentId": "20200003",
//             "matchPercentage": 62.3,
//             "matchStatus": "REJECTED",
//             "matchDate": "2026-06-07T15:30:14",
//             "preferredAnswers": [
// 		        {
// 		            "field": "BEDTIME",
// 		            "value": 4
// 		        },
// 		        {
// 		            "field": "SPEAKER_STYLE",
// 		            "value": 1
// 		        },
// 		        {
// 		            "field": "EATING_IN_ROOM",
// 		            "value": 2
// 		        }
// 		    ]
//         }
//     ]

function Matching() {
  const [people, setPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    // 페이지 진입 시 추천 목록을 한 번 조회하고 언마운트 이후의 상태 변경을 막음.
    async function loadMatchingPeople() {
      try {
        const matchingPeople = await getMatchingStatus();
        if (isMounted) setPeople(matchingPeople.slice(0, 3));
      } catch (error) {
        console.error('추천 목록을 불러오지 못했습니다.', error);
        if (isMounted) setErrorMessage('추천 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMatchingPeople();
    return () => {
      isMounted = false;
    };
  }, []);

  // 매칭 실행과 실행 후 추천 목록 갱신은 페이지에서 함께 관리합니다.
  const handleExecuteMatching = async () => {
    if (isExecuting) return;

    try {
      setIsExecuting(true);
      setErrorMessage('');

      try {
        await executeMatching();
      } catch (error) {
        // 오늘 매칭이 이미 완료된 경우에도 기존 추천을 보여주기 위해
        // 실행 오류를 화면 오류로 처리하지 않고 현재 status를 다시 조회합니다.
        console.info('기존 매칭 결과를 조회합니다.', error);
      }

      const matchingPeople = await getMatchingStatus();
      setPeople(matchingPeople.slice(0, 3));
    } catch (error) {
      console.error('추천 목록을 다시 불러오지 못했습니다.', error);

      // 이미 표시 중인 카드가 있다면 status 재조회 실패 시에도 그대로 유지합니다.
      if (people.length === 0) {
        setErrorMessage('추천 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100dvh-96px)] flex-col px-5 pb-10 pt-5">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-heading text-lg font-extrabold text-fg-primary">오늘의 룸매</h1>
          <p className="font-heading text-xs text-fg-basic-muted">당신과 결이 비슷한 3명을 골라봤어요.</p>
        </div>
        <ExeMatchBtn onExecute={handleExecuteMatching} isLoading={isExecuting} />
      </header>

      {/* 조회 상태에 따라 카드 스택, 로딩, 오류 또는 빈 결과 안내를 표시 */}
      <div className="flex flex-1 items-start justify-center pb-6 pt-4 sm:pt-7">
        {isLoading && (
          <div className="mt-28 text-sm font-semibold text-fg-basic-muted" role="status">
            오늘의 룸메이트를 찾고 있어요...
          </div>
        )}
        {!isLoading && errorMessage && (
          <p className="mt-28 max-w-72 text-center text-sm leading-6 text-fg-basic-muted" role="alert">
            {errorMessage}
          </p>
        )}
        {!isLoading && !errorMessage && people.length === 0 && (
          <p className="mt-28 text-sm font-semibold text-fg-basic-muted">오늘의 추천이 아직 없어요.</p>
        )}
        {!isLoading && !errorMessage && people.length > 0 && <MatchingCardStack people={people} />}
      </div>
    </section>
  );
}

export default Matching;
