import FAB from '@/components/shared/FAB'
import Loader from '@/components/shared/Loader'
import PostCard from '@/components/shared/PostCard'
import TopicCard from '@/components/shared/TopicCard'
import { useGetRecentPosts, useGetPopularTopics } from '@/lib/react-query/queriesAndMutations'
import { Models } from 'appwrite'


const Home = () => {
  const { data: posts, isPending: isPostLoading } = useGetRecentPosts()

  const { data: topics, isPending: isTopicLoading } = useGetPopularTopics()


  return (
    <div className='flex flex-1'>
      <div className='home-container'>
        <div className='home-posts'>
          <h2 className='h3-bold md:h2-bold text-left w-full'>Home</h2>
          {isPostLoading && !posts ? (
            <Loader />
          ) : 
          (<ul className='flex flex-col flex-1 gap-9 w-full'>
            {posts?.documents.map((post: Models.Document) => (
              <PostCard post={post} key={post.content}/>
            ))}
          </ul>)
          }
        </div>
      </div>
      <FAB destination={'/create-post'} />
      <div className="home-creators">
        <div className='flex gap-2'>
          <h3 className="h3-bold text-light-1">Hot Topics</h3>
          <img src='/assets/icons/!.svg' alt='popular' height={36} width={36}/>
        </div>
        {isTopicLoading && !topics ? (
          <Loader />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {topics?.map((topic) => (
              <li key={topic.name}>
                <TopicCard topic={topic} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Home
