import { useEffect, useState } from 'react';
import { useUserContext } from '@/context/authContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Loader from '@/components/shared/Loader';

interface ChatPreview {
  id: string;
  participants: {
    id: string;
    username: string;
    imageUrl: string;
  }[];
  lastMessage?: {
    content: string;
    timestamp: Date;
  };
}

const Chats = () => {
  const { user } = useUserContext();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Here we would fetch the user's chats
    // For now, using mock data
    const mockChats: ChatPreview[] = [
      {
        id: '1',
        participants: [
          {
            id: '2',
            username: 'Alice',
            imageUrl: '/path/to/avatar',
          }
        ],
        lastMessage: {
          content: 'Hey, how are you?',
          timestamp: new Date(),
        }
      },
      // Add more mock chats as needed
    ];

    setChats(mockChats);
    setIsLoading(false);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div className="flex-1 h-screen">
      <div className="flex flex-col h-full max-w-5xl mx-auto px-4 md:px-8 py-6 gap-6">
        <div className="flex items-center justify-between">
          <h1 className="h3-bold md:h2-bold text-left">Chats</h1>
          <div className="flex gap-2">
            <Button variant="ghost" className="shad-button_ghost">
              <img src="/assets/icons/filter.svg" alt="filter" className="invert" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid gap-4">
            {chats.map((chat) => {
              const otherParticipant = chat.participants[0];
              return (
                <Link
                  key={chat.id}
                  to={`/chat/${chat.id}`}
                  className="bg-dark-2 rounded-xl p-4 flex items-center gap-4 hover:bg-dark-4 transition-all"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={otherParticipant.imageUrl || "/assets/icons/profile-placeholder.svg"}
                        alt={otherParticipant.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="base-semibold text-light-1 truncate">{otherParticipant.username}</h3>
                      {chat.lastMessage && (
                        <span className="text-light-3 text-xs">
                          {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-light-3 text-sm line-clamp-1 mt-1">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}

            {chats.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <img src="/assets/icons/chat.svg" alt="no chats" className="w-24 h-24 opacity-50" />
                <p className="text-light-3 text-center">No chats yet. Start a conversation from someone's profile!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chats;
