
import { Button } from '@/components/ui/button'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RegValidation } from '@/lib/validation'
import Loader from '@/components/shared/Loader'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { useCreateUserAccMutation, useLoginAccMutation } from '@/lib/react-query/queriesAndMutations'
import { useUserContext } from '@/context/authContext'






function RegForm() {
  const { toast } = useToast()
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext()
  const navigate = useNavigate()
  // const isLoading = false

  const { mutateAsync: createUserAccount, isLoading: isCreatingAcc } = useCreateUserAccMutation()

  const { mutateAsync: loginAccount, isLoading: isLoggingIn } = useLoginAccMutation()

  // const cities = [
  //   { value: 'New York', label: 'New York' },
  //   { value: 'Los Angeles', label: 'Los Angeles' },
  //   { value: 'Philadelphia', label: 'Philadelphia' }
  // ]

  // 1. Define your form.
  const form = useForm<z.infer<typeof RegValidation>>({
    resolver: zodResolver(RegValidation),
    defaultValues: {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        // anchorPoint: "New York", // Default empty or pre-selected value
    },
});


  
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof RegValidation>) {
    console.log('Form submitted with values:', values); // Debugging
    try {
      const newUser = await createUserAccount(values);
      console.log('User created:', newUser); // Debugging
  
      if (!newUser) {
        throw new Error('Error creating account');
      }
  
      const session = await loginAccount({
        email: values.email,
        password: values.password,
      });
      console.log('Session created:', session); // Debugging
  
      if (!session) {
        throw new Error('Error logging in');
      }
  
      const isLoggedIn = await checkAuthUser();
      console.log('Is logged in:', isLoggedIn); // Debugging
  
      if (isLoggedIn) {
        form.reset();
        navigate('/');
      } else {
        throw new Error('Error signing up');
      }
    } catch (error) {
      console.error('Registration error:', error); // Debugging
      toast({
        title: 'Something went wrong',
        variant: 'destructive',
      });
    }
  }
  
  
  

  return (
    <Form {...form}>
      <div className='sm:w-420 flex-center flex-col'>
        <img alt='bashmnt-login' src='/assets/images/bashmnt.svg'/>
        <h2 className='h3-bold md:h2-bold pt-2 sm:pt-6'>Register</h2>
        <p className='text-light-3 small-medium md:base-regular mt-2'>Who are you?</p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='text' placeholder='Username' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='email' placeholder='Email' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='password' placeholder='Password' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type='password' placeholder='Confirm Password' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="anchorPoint"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="shad-input">
                      <span>{field.value || "Select Anchor Point"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.value} value={city.value}>
                          {city.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <Button type="submit" className='shad-button_primary'>
            {isCreatingAcc ? (
              <div className="flex-center gap-2">
                <Loader />
              </div>
            ) : "Register"}
          </Button>
        </form>
        <p className='text-small-regular text-center mt-2 text-gray-500'>Already have an account? <Link className='text-primary-500 text-small font-bold ml-1' to='/login'>Login</Link></p>
      </div>
    </Form>
  )
}

export default RegForm