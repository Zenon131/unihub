import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserById } from '@/lib/react-query/queriesAndMutations';
import Loader from '@/components/shared/Loader';
import ChatRoomComponent from '@/components/shared/ChatRoom';

const ChatRoom = () => {
  const { id } = useParams();
  const { data: recipient, isLoading } = useGetUserById(id || "");

  if (isLoading || !recipient) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <ChatRoomComponent
        recipientId={recipient.$id}
        recipientName={recipient.username}
      />
    </div>
  );
};

export default ChatRoom;
