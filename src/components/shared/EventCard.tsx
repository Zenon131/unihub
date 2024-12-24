import { Event } from "@/types/event";
// import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";

interface EventCardProps {
    event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
    return (
        <div className="bg-dark-2 rounded-lg p-4 w-full max-w-xl hover:bg-dark-3 transition-colors">
            <div className="flex items-start gap-3">
                <Link to={`/profile/${event.creator.id}`}>
                    <img 
                        src={event.creator.imageUrl || "/assets/icons/profile-placeholder.svg"} 
                        alt="creator"
                        className="w-12 h-12 rounded-full"
                    />
                </Link>
                
                <div className="flex-1">
                    <Link to={`/profile/${event.creator.id}`}>
                        <h4 className="text-light-1 font-bold">{event.creator.username}</h4>
                    </Link>
                    
                    <h3 className="text-xl font-semibold text-light-1 mt-1">{event.title}</h3>
                    <p className="text-light-2 mt-2">{event.details}</p>
                    
                    <div className="flex items-center gap-3 mt-4 text-light-2">
                        <div className="flex items-center gap-2">
                            <img src="/assets/icons/calendar.svg" alt="date" className="w-4 h-4" />
                            <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <img src="/assets/icons/clock.svg" alt="time" className="w-4 h-4" />
                            <span>{event.time}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
