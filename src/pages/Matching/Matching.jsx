import { useEffect, useState } from 'react';
import { getMatchingStatus } from '../../api/matching/matching.js';
import MatchingCardStack from './components/MatchingCardStack.jsx';

const mockData = [
        {
            "userId": "01ARZ3NDEK...",
            "name": "홍길동",
            "gender": "MALE",
            "age": 22,
            "introduce": "안녕하세요",
            "department": "컴퓨터과학부",
            "studentId": "20210001",
            "matchPercentage": 87.5,
            "matchStatus": "RECOMMENDED",
            "matchDate": "2026-07-07T15:30:12",
            "preferredAnswers": [
                {
                    "field": "BEDTIME",
                    "value": 2
                },
                {
                    "field": "SNORING",
                    "value": 1
                }
            ]
        },
        {
            "userId": "01ARZ3NDEL...",
            "name": "김철수",
            "gender": "MALE",
            "age": 21,
            "introduce": "반갑습니다",
            "department": "전자전기컴퓨터공학부",
            "studentId": "20220002",
            "matchPercentage": 75.0,
            "matchStatus": "HEART_MATCHED",
            "matchDate": "2026-07-06T12:30:12",
            "preferredAnswers": [
                {
                    "field": "ORGANIZING_STYLE",
                    "value": 4
                },
                {
                    "field": "CALL_IN_ROOM",
                    "value": 1
                },
                {
                    "field": "TEMPERATURE_PREFERENCE",
                    "value": 2
                }
            ]
        },
        {
            "userId": "01ARZ3NDEM...",
            "name": "이영희",
            "gender": "MALE",
            "age": 23,
            "introduce": "잘 부탁드려요",
            "department": "기계공학과",
            "studentId": "20200003",
            "matchPercentage": 62.3,
            "matchStatus": "REJECTED",
            "matchDate": "2026-06-07T15:30:14",
            "preferredAnswers": [
		        {
		            "field": "BEDTIME",
		            "value": 4
		        },
		        {
		            "field": "SPEAKER_STYLE",
		            "value": 1
		        },
		        {
		            "field": "EATING_IN_ROOM",
		            "value": 2
		        }
		    ]
        }
    ]

function Matching() {
  const [people, setPeople] = useState(mockData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

//   useEffect(() => {
//     let isMounted = true;

//     // 페이지 진입 시 추천 목록을 한 번 조회하고 언마운트 이후의 상태 변경을 막음.
//     // async function loadMatchingPeople() {
//     //   try {
//     //     const matchingPeople = await getMatchingStatus();
//     //     if (isMounted) setPeople(matchingPeople.slice(0, 3));
//     //   } catch (error) {
//     //     console.error('추천 목록을 불러오지 못했습니다.', error);
//     //     if (isMounted) setErrorMessage('추천 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
//     //   } finally {
//     //     if (isMounted) setIsLoading(false);
//     //   }
//     // }

//     loadMatchingPeople();
//     return () => {
//       isMounted = false;
//     };
//   }, []);

  return (
    <section className="flex min-h-[calc(100dvh-96px)] flex-col px-5 pb-10 pt-5">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-lg font-extrabold text-fg-primary">오늘의 룸매</h1>
        <p className="font-heading text-xs text-fg-basic-muted">당신과 결이 비슷한 3명을 골라봤어요.</p>
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
