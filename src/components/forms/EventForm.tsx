import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea"
import { useNavigate } from "react-router-dom"
import { useToast } from "../ui/use-toast"
import { useUserContext } from "@/context/authContext"
import { createEvent } from "@/lib/appwrite/api"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  details: z.string().min(10, "Details must be at least 10 characters"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
})

const EventForm = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      details: "",
      time: "",
      date: undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const eventData = {
        title: values.title,
        details: values.details,
        date: format(values.date, "yyyy-MM-dd"),
        time: values.time,
        userId: user.id,
        creator: user.id,
      };

      await createEvent(eventData);

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      navigate("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  }

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const time24 = `${hour.toString().padStart(2, "0")}:00`;
    return time24;
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Event title" 
                  {...field} 
                  className="bg-dark-4 text-light-1 border-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Details</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Event details and description" 
                  {...field} 
                  className="bg-dark-4 text-light-1 border-none min-h-[120px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-dark-4 text-light-1 border-none",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-dark-4 border-light-3 z-[9999] relative" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date: Date | undefined) => {
                        field.onChange(date);
                        form.clearErrors("date");
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                      className="bg-dark-4 text-light-1 rounded-lg pointer-events-auto [&_.rdp-day_focus]:bg-primary-500 [&_.rdp-day_today]:border-2 [&_.rdp-day_today]:border-primary-500"
                      fromDate={new Date()}
                      today={new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-dark-4 text-light-1 border-none">
                      <SelectValue placeholder="Select time">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{field.value || "Select time"}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px] bg-dark-4 text-light-1 border-light-3">
                    {timeSlots.map((time) => (
                      <SelectItem 
                        key={time} 
                        value={time}
                        className="hover:bg-dark-3 focus:bg-dark-3"
                      >
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary-500"
        >
          Create Event
        </Button>
      </form>
    </Form>
  )
}

export default EventForm
