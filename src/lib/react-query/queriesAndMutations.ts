import { 
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery
  } from '@tanstack/react-query'
import { createComment, createPost, createUserAccount, getChildPostCount, getPostById, getPostByParent, getRecentPosts, getUserById, loginAccount, logoutAccount, searchPosts } from '../appwrite/api'
import { INewComment, INewPost, INewUser, IUpdateUser } from '@/types'
import { QUERY_KEYS } from './queryKeys'
import { appwriteConfig, databases } from '../appwrite/config'

export function useCreateUserAccMutation() {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    })
}

export function useLoginAccMutation() {
    return useMutation({
        mutationFn: (user: { email: string; password: string }) => loginAccount(user)
    })
}

export function useLogoutAccMutation() {
    return useMutation({
        mutationFn: logoutAccount
    })
}

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (post: INewPost) => createPost(post),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
      },
    });
  };

export const useCreateComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (comment: INewComment) => createComment(comment),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POST_BY_PARENT],
        });
      },
    });
}

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: () => getRecentPosts(),
  })
}

export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId
  })
}

export const useGetPostsByParent = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_PARENT, postId],
    queryFn: () => getPostByParent(postId),
    enabled: !!postId,
  });
};

export const useChildPostCount = (parentPostId: string) => {
  return useQuery({
      queryKey: ['childPostCount', parentPostId],
      queryFn: () => getChildPostCount(parentPostId),
      enabled: !!parentPostId,  // Only fetch if parentPostId is defined
  });
};

export const useSearchPosts = (searchVal: string) => {
  return useQuery({
    queryKey: ['searchPosts', searchVal],
    queryFn: () => searchPosts(searchVal),
    enabled: !!searchVal, // Only run the query if searchVal is not empty
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

// export const useUpdateUser = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (user: IUpdateUser) => updateUser(user),
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({
//         queryKey: [QUERY_KEYS.GET_CURRENT_USER],
//       });
//       queryClient.invalidateQueries({
//         queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
//       });
//     },
//   });
// };

export const useGetPopularTopics = () => {
  return useQuery({
    queryKey: ['popularTopics'],
    queryFn: async () => {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        []
      );
      // Assuming your posts have a 'topic' field
      const topics = response.documents.reduce((acc, post) => {
        if (post.topic) {
          acc[post.topic] = (acc[post.topic] || 0) + 1;
        }
        return acc;
      }, {});

      return Object.entries(topics)
        .map(([name, postCount]) => ({ name, postCount }))
        .sort((a, b) => b.postCount - a.postCount);
    },
  });
};