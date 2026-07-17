import ChatList from './components/ChatList.jsx';

const mockChatRooms = [
  {
    roomId: 101,
    partnerProfileImageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3sVZbHa4BgJ8n8JUv3LxaF6g0taIK4LLsHgmFItCUYQ&s=10',
    partnerName: '쿠죠 죠타로',
    lastMessage: '오라오라오라오라오라오라!',
    lastMessageTime: '2026-07-17T08:07:19.588Z',
    unreadCount: 1,
  },
  {
    roomId: 102,
    partnerProfileImageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTvAF0sO34P4Jn77IONIPlwjEs2bakoAm8dWFMjew9HA&s=10',
    partnerName: '쟝 피에르 폴나레프',
    lastMessage: '여동생을 없애줘! 여동생을 땅으로 돌려보내줘!',
    lastMessageTime: '2026-07-17T07:58:19.588Z',
    unreadCount: 0,
  },
  {
    roomId: 103,
    partnerProfileImageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3LPXqHYr3YT40HZvuVcwX2rUlH2R2kl-xAv-De-L_wA&s=10',
    partnerName: '카쿄인 노리아키',
    lastMessage: '레로레로레로레로레로레로레로레로',
    lastMessageTime: '2026-07-16T09:07:19.588Z',
    unreadCount: 1,
  },
  {
    roomId: 104,
    partnerProfileImageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpru-3MLU7KEI26_g0aI4UyaGA81AVZ0b30zXOzNdl2g&s=10',
    partnerName: '무함마드 압둘',
    lastMessage: '지옥을! 네놈에게!',
    lastMessageTime: '2026-07-13T10:24:19.588Z',
    unreadCount: 1,
  },
  {
    roomId: 105,
    partnerProfileImageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVPhjXopZeJIOizQNN6V1Yre_4OUCfkflq1MVFd71lSw&s=10',
    partnerName: '죠셉 죠스타',
    lastMessage: '압둘! 거기는..!',
    lastMessageTime: '2026-07-10T04:31:19.588Z',
    unreadCount: 0,
  },
];

function Chat() {
    return (
        <section className="flex min-h-[calc(100dvh-96px)] flex-col px-5 pb-10 pt-5">
            <header className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                    <h1 className="font-heading text-lg font-extrabold text-fg-primary">채팅</h1>
                    <p className="font-heading text-xs text-fg-basic-muted">서로 하트를 보낸 유저와 채팅을 할 수 있어요.</p>
                </div>
            </header>
            <main className="mt-3">
                <ChatList chatRooms={mockChatRooms} />
            </main>
        </section>
    );
}

export default Chat;
