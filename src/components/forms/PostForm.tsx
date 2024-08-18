import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { PostValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useUserContext } from "@/context/authContext"
import { useToast } from "../ui/use-toast"
import { useNavigate } from "react-router-dom"
import { useCreatePost } from "@/lib/react-query/queriesAndMutations"
import Loader from "../shared/Loader"

type PostFormProps = {
  post?: Models.Document
}

const PostForm = ({ post }: PostFormProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } =  useCreatePost()
  const { user } = useUserContext()
  const { toast } = useToast()
  const navigate = useNavigate()

  // 1. Define your form.
  const form = useForm<z.infer<typeof PostValidation>>({
  resolver: zodResolver(PostValidation),
  defaultValues: post ? {
    content: post.content,
    location: post.location,
    topic: post.topic,
  } : {
    content: "",
    location: "",
    topic: "",
  },
});

 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof PostValidation>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log("Form Values:", values); // Check if location is populated
    const newPost = await createPost({
      ...values,
      userId: user.id,
      parentId: '',
    })
    

    if(!newPost) {
      toast({
        title: "Error creating post",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Post created successfully!",
      })
      navigate('/')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
      <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Location</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. 'New York', 'Los Angeles', 'Philadelphia'" className="shad-input"{...field} />
              </FormControl>
              <FormMessage className="shad-form_message"/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Topic</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. 'Politics', 'Soccer', 'AI'" className="shad-input"{...field} />
              </FormControl>
              <FormMessage className="shad-form_message"/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Content</FormLabel>
              <FormControl>
                <Textarea className="shad-textarea custom-scrollbar"{...field} />
              </FormControl>
              <FormMessage className="shad-form_message"/>
            </FormItem>
          )}
        />
        {/* <div className="flex gap-4 items-center justify-center"> */}
            <Button type="button" className="shad-button_dark_4"onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" className="shad-button_primary">
              {isLoadingCreate ? (
                <Loader />
              ) : "Post"}
            </Button>
            {/* <Button type="submit" className="shad-button_primary whitespace-nowrap">Post</Button> */}
        {/* </div> */}
      </form>
    </Form>
  )
}

export default PostForm