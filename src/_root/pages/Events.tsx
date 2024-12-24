import { useEffect, useState } from "react";
import { Event } from "@/types/event";
import EventCard from "@/components/shared/EventCard";
import { getEvents } from "@/lib/appwrite/api";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import EventForm from "@/components/forms/EventForm";

const Events = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const eventsData = await getEvents();
                setEvents(eventsData);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return <Loader />;

    return (
        <div className="flex flex-col flex-1 items-center gap-10 overflow-y-auto py-10 px-5 md:px-8 lg:p-14">
            <div className="max-w-5xl w-full flex flex-col items-center gap-6">
                <div className="w-full flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-light-1">Upcoming Events</h2>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Create Event</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Event</DialogTitle>
                                <DialogDescription>
                                    Fill out the form below to create a new event
                                </DialogDescription>
                            </DialogHeader>
                            <EventForm />
                        </DialogContent>
                    </Dialog>
                </div>
                
                <div className="flex flex-col gap-6 w-full">
                    {events.length === 0 ? (
                        <p className="text-light-3 text-center">No events found</p>
                    ) : (
                        events.map((event) => (
                            <EventCard key={event.date + event.time} event={event} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Events;
