import { useEffect, useRef, useState } from 'react';
import { useUserContext } from '@/context/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
}

interface ChatRoomProps {
  recipientId: string;
  recipientName: string;
}

const ChatRoom = ({ recipientId, recipientName }: ChatRoomProps) => {
  const { user } = useUserContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize WebRTC peer connection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // Create data channel
    const dc = pc.createDataChannel('chat');
    
    dc.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    setPeerConnection(pc);
    setDataChannel(dc);

    return () => {
      dc.close();
      pc.close();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !dataChannel) return;

    const message: Message = {
      id: crypto.randomUUID(),
      content: newMessage,
      senderId: user.id,
      timestamp: new Date(),
    };

    // Send through WebRTC data channel
    dataChannel.send(JSON.stringify(message));

    // Add to local messages
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto w-full">
      {/* Chat Header */}
      <div className="bg-dark-2 p-4 flex items-center gap-4 sticky top-0 z-20 border-b border-dark-4">
        <Link to="/chats" className="md:hidden">
          <img src="/assets/icons/arrow-left.svg" alt="back" className="invert" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-light-1 text-sm font-bold">
                {recipientName[0].toUpperCase()}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-2"></div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-light-1 base-semibold">{recipientName}</h2>
            <span className="text-light-3 text-xs">Online</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <img src="/assets/icons/phone.svg" alt="call" className="invert" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <img src="/assets/icons/video.svg" alt="video" className="invert" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] md:max-w-[60%] rounded-2xl p-3 ${
                message.senderId === user.id
                  ? 'bg-primary-500 text-light-1 rounded-br-none'
                  : 'bg-dark-3 text-light-1 rounded-bl-none'
              }`}
            >
              <p className="break-words">{message.content}</p>
              <div className={`flex items-center gap-1 mt-1 ${
                message.senderId === user.id ? 'justify-end' : 'justify-start'
              }`}>
                <span className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {message.senderId === user.id && (
                  <img src="/assets/icons/check.svg" alt="sent" className="w-3 h-3 invert opacity-70" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-dark-2 border-t border-dark-4">
        <div className="flex gap-2 items-center max-w-5xl mx-auto">
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <img src="/assets/icons/plus.svg" alt="add" className="invert" />
          </Button>
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="bg-dark-3 border-none text-light-1 pr-12"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              onClick={() => {/* Add emoji picker */}}
            >
              <img src="/assets/icons/smile.svg" alt="emoji" className="invert" />
            </Button>
          </div>
          <Button 
            onClick={sendMessage} 
            size="icon"
            className="shad-button_primary rounded-full p-3 shrink-0"
          >
            <img src="/assets/icons/send.svg" alt="send" className="invert" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
