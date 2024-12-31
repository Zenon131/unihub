import { IEvent } from "@/types";
import { multiFormatDateString } from "@/lib/utils";
import { Link } from "react-router-dom";
import { CalendarIcon, Clock } from "lucide-react";

interface EventCardProps {
    event: IEvent;
}

const EventCard = ({ event }: EventCardProps) => {
    return (
        <div className="post-card mb-6">
            <div className="flex-between">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${event.userId}`}>
                        <img
                            src={event.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                            alt="creator"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </Link>
                    <div className="flex flex-col">
                        <p className="base-medium lg:body-bold text-light-1">
                            {event.creator?.username || "Unknown User"}
                        </p>
                        <div className="flex-center gap-2 text-light-3">
                            <p className="subtle-semibold lg:small-regular">
                                {multiFormatDateString(event.$createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col mt-4">
                <h3 className="h3-bold text-light-1">{event.title}</h3>
                <p className="small-medium lg:base-medium py-5 text-light-2">
                    {event.details}
                </p>
            </div>

            <div className="flex gap-4 text-light-3 mt-2">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
