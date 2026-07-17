import ChatListItem from './ChatListItem.jsx';

function ChatList({ chatRooms }) {
  return (
    <ul className="flex flex-col" aria-label="채팅방 목록">
      {chatRooms.map((chatRoom) => (
        <ChatListItem key={chatRoom.roomId} {...chatRoom} />
      ))}
    </ul>
  );
}

export default ChatList;
