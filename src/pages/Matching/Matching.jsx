import { useEffect, useState } from 'react';
import {
  executeMatching,
  getMatchingErrorMessage,
  getMatchingStatus,
} from '../../api/matching/matching.js';
import ExeMatchBtn from './components/ExeMatchBtn.jsx';
import MatchingCardStack from './components/MatchingCardStack.jsx';

function Matching() {
  const [people, setPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [executeMessage, setExecuteMessage] = useState('');
  const [executeError, setExecuteError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadMatchingPeople() {
      try {
        const matchingPeople = await getMatchingStatus();
        if (isMounted) setPeople(matchingPeople);
      } catch (error) {
        console.error('추천 목록을 불러오지 못했습니다.', error);
        if (isMounted) {
          setErrorMessage(
            getMatchingErrorMessage(error, '추천 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'),
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMatchingPeople();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleExecuteMatching = async () => {
    if (isExecuting) return;

    try {
      setIsExecuting(true);
      setErrorMessage('');
      setExecuteMessage('');
      setExecuteError('');

      const responseBody = await executeMatching();
      setExecuteMessage(responseBody?.message || '매칭 성공');

      const matchingPeople = await getMatchingStatus();
      setPeople(matchingPeople);
    } catch (error) {
      console.error('오늘의 매칭 요청을 처리하지 못했습니다.', error);
      const message = getMatchingErrorMessage(
        error,
        '오늘의 매칭을 진행하지 못했어요. 잠시 후 다시 시도해 주세요.',
      );

      if (people.length === 0) {
        setErrorMessage(message);
      } else {
        setExecuteError(message);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const refreshMatchingPeople = async () => {
    const matchingPeople = await getMatchingStatus();
    setPeople(matchingPeople);
  };

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-96px)] w-full min-w-0 max-w-[600px] flex-col overflow-x-clip px-[clamp(0.75rem,4vw,1.5rem)] pb-44 pt-[clamp(1rem,4vw,2rem)]">
      <header className="flex min-w-0 items-center justify-between gap-[clamp(0.5rem,3vw,0.75rem)]">
        <div className="min-w-0">
          <h1 className="font-heading text-[clamp(1.125rem,3vw,1.5rem)] font-extrabold tracking-[-0.02em] text-fg-primary">
            오늘의 룸매
          </h1>
          <p
            className={`mt-1 text-xs font-medium ${
              executeError ? 'break-words leading-5 text-[#c04a67]' : 'truncate text-fg-basic-muted'
            }`}
            title={executeError || undefined}
          >
            {executeError || executeMessage || `당신과 결이 비슷한 ${people.length || 3}명을 골라봤어요`}
          </p>
        </div>
        <ExeMatchBtn onExecute={handleExecuteMatching} isLoading={isExecuting} />
      </header>

      <div className="flex min-w-0 flex-1 items-center justify-center pb-3 pt-[clamp(0.5rem,3vw,1rem)]">
        {isLoading && (
          <div
            className="flex flex-col items-center gap-3 text-sm font-semibold text-fg-basic-muted"
            role="status"
          >
            <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#cad8ec] border-t-brand-primary" />
            오늘의 룸매를 찾고 있어요...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="w-full max-w-[320px] rounded-[clamp(1.25rem,6vw,1.5rem)] bg-white px-[clamp(1rem,6vw,1.5rem)] py-[clamp(1.5rem,7vw,2rem)] text-center shadow-[0_14px_36px_rgba(38,73,126,0.1)]">
            <p className="text-sm font-semibold leading-6 text-fg-basic-muted" role="alert">
              {errorMessage}
            </p>
            <p className="mt-2 text-xs text-[#8d9ab0]">오른쪽 위 매칭 버튼으로 다시 시도할 수 있어요.</p>
          </div>
        )}

        {!isLoading && !errorMessage && people.length === 0 && (
          <div className="w-full max-w-[320px] rounded-[clamp(1.25rem,6vw,1.5rem)] bg-white px-[clamp(1rem,6vw,1.5rem)] py-[clamp(1.5rem,7vw,2rem)] text-center shadow-[0_14px_36px_rgba(38,73,126,0.1)]">
            <p className="text-sm font-bold text-fg-primary">아직 오늘의 추천이 없어요</p>
            <p className="mt-2 text-xs leading-5 text-fg-basic-muted">
              오른쪽 위 매칭 버튼을 눌러 잘 맞는 룸매를 찾아보세요.
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && people.length > 0 && (
          <MatchingCardStack people={people} onStatusRefresh={refreshMatchingPeople} />
        )}
      </div>
    </section>
  );
}

export default Matching;
