import { INewComment, INewPost, INewUser, IUpdateUser } from "@/types";
import { ID, Query } from 'appwrite';
import { account, appwriteConfig, avatars, databases, storage } from "./config";


export async function createUserAccount(user: INewUser) {
    try {
        const newAcc = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.username,
        );


        if (!newAcc) throw new Error("Account creation failed");

        const aviURL = avatars.getInitials(user.username);

        const newUser = await saveUserToDB({
            email: newAcc.email,
            username: newAcc.name,  // Correct property
            accountId: newAcc.$id,
            imgurl: aviURL.toString(),  // Convert URL to string
        });


        return newUser;
    } catch (err) {
        console.error("Error creating user account:", err);
        return err;
    }
}


export async function saveUserToDB(user: {
    email: string;
    username: string;
    accountId: string;
    imgurl: string;  // Use the exact field name as defined in the Appwrite schema
    // location: string
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                email: user.email,
                username: user.username,
                accountId: user.accountId,
                imgurl: user.imgurl,  // Ensure this matches the Appwrite schema
                // location: user.location
            }
        );


        return newUser;
    } catch (err) {
        console.error("Error saving user to database:", err);
        return err;
    }
}


export async function loginAccount(user: { email: string; password: string; }) {
    try {
        // Check if there is an existing session
        const currentSession = await account.getSession('current').catch(() => null);


        if (currentSession) {
            // Optionally log out or delete the current session
            await account.deleteSession(currentSession.$id);
        }


        // Now create a new session
        const session = await account.createEmailPasswordSession(user.email, user.password);
        return session;
    } catch (err) {
        console.error("Error logging in:", err);
        return err;
    }
}


export async function getCurrentUser() {
    try {
        const currentAcc = await account.get();

        if (!currentAcc) throw new Error("Failed to retrieve current account");

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAcc.$id)]  // Use the correct query filter
        );


        if (currentUser.documents.length === 0) throw new Error("No user found with this accountId");

        return currentUser.documents[0];
    } catch (err) {
        console.error("Error fetching current user:", err);
        return null;
    }
}


export async function logoutAccount() {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (err) {
        console.error("Error logging out:", err);
        return err;
    }
}


export async function createPost(post: INewPost) {
    try {
        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId, // Ensure this matches the relationship field in your schema
                userId: post.userId,
                content: post.content,
                location: post.location,
                topic: post.topic,
                parentId: post.parentId || null, // Add parent_post for threading if needed
            }
        );


        return newPost;
    } catch (err: any) {
        if (err.message.includes("Invalid document structure")) {
            console.error("Error: Missing required fields in the post data", err);
        } else {
            console.error("Error creating post:", err);
        }
        return null;
    }
}


export async function getRecentPosts() {
    const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
    )
    if(!posts) throw Error

    return posts
}


export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}


export async function createComment(comment: INewComment) {
    try {
        const newComment = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentCollectionId,
            ID.unique(),
            {
                userId: comment.userId,
                postId: comment.postId,
                content: comment.content,
                parentCommentId: comment.parentCommentId || null,  // Support for threading
                commentor: comment.userId
            }
        );

        return newComment;
    } catch (err) {
        console.error("Error creating comment:", err);
        throw err;
    }
}


export async function getPostByParent(postId: string) {
  const posts = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    [
      Query.equal('parentId', postId),
      Query.orderAsc('$createdAt')
    ]
  );
  if (!posts) throw new Error("Failed to fetch posts");

  // Fetch creator data for each post
  const postsWithCreators = await Promise.all(
    posts.documents.map(async (post) => {
      const creator = await getUserById(post.userId);
      return { ...post, creator };
    })
  );

  return { ...posts, documents: postsWithCreators };
}

  export async function getChildPostCount(parentPostId: string): Promise<number> {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.equal('parentId', parentPostId)]  // Query to find documents with the given parentId
        );
        
        // Return the count of documents
        return response.total;  // or response.documents.length if you need to count documents
    } catch (err) {
        console.error("Error fetching child post count:", err);
        throw err;
    }
}


export const searchPosts = async (searchVal: string) => {
    try {
      const locationResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [
          Query.search('location', searchVal),
          Query.limit(20)
        ]
      );

      const topicResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [
          Query.search('topic', searchVal),
          Query.limit(20)
        ]
      );

      const contentResponse = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [
          Query.search('content', searchVal),
          Query.limit(20)
        ]
      );

      // Combine the results, ensuring no duplicates
      const combinedResults = [
        ...locationResponse.documents,
        ...topicResponse.documents,
        ...contentResponse.documents,
      ];

      // Remove duplicates based on the document ID
      const uniqueResults = Array.from(new Set(combinedResults.map(doc => doc.$id)))
        .map(id => combinedResults.find(doc => doc.$id === id));

      return { total: uniqueResults.length, documents: uniqueResults };
    } catch (error) {
      console.error("Error searching posts:", error);
      throw error;
    }
  };


export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

    if (pageParam) {
      queries.push(Query.cursorAfter(pageParam.toString()));
    }

    try {
      const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        queries
      );

      if (!posts) throw Error;

      return posts;
    } catch (error) {
      console.log(error);
    }
  }

  export async function uploadFile(file: File) {
    try {
      const uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        file
      );

      return uploadedFile;
    } catch (error) {
      console.log(error);
    }
  }
  
  // ============================== GET FILE URL
  export function getFilePreview(fileId: string) {
    try {
      const fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId,
        2000,
        2000,
        undefined,
        100
      );

      if (!fileUrl) throw Error;

      return fileUrl;
    } catch (error) {
      console.log(error);
    }
  }
  
  // ============================== DELETE FILE
  export async function deleteFile(fileId: string) {
    try {
      await storage.deleteFile(appwriteConfig.storageId, fileId);

      return { status: "ok" };
    } catch (error) {
      console.log(error);
    }
  }
  

export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;
    try {
      let image = {
        imgurl: user.imgurl,
        imgid: user.imgid,
      };

      if (hasFileToUpdate) {
        // Upload new file to appwrite storage
        const uploadedFile = await uploadFile(user.file[0]);
        if (!uploadedFile) throw Error;

        // Get new file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
          await deleteFile(uploadedFile.$id);
          throw Error;
        }

        image = { ...image, imgurl: fileUrl, imgid: uploadedFile.$id };
      }

      //  Update user
      const updatedUser = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        user.userId,
        {
          username: user.username,
          imgurl: image.imgurl,
          imgid: image.imgid,
        }
      );

      // Failed to update
      if (!updatedUser) {
        // Delete new file that has been recently uploaded
        if (hasFileToUpdate) {
          await deleteFile(image.imgid);
        }
        // If no new file uploaded, just throw error
        throw Error;
      }

      // Safely delete old file after successful update
      if (user.imgid && hasFileToUpdate) {
        await deleteFile(user.imgid);
      }

      return updatedUser;
    } catch (error) {
      console.log(error);
    }
  }

export async function getUserById(userId: string) {
    try {
      const user = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId
      );

      if (!user) throw Error;

      return user;
    } catch (error) {
      console.log(error);
    }
  }

  export const fetchPostsByTopic = async (topic: string) => {
    try {
      const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.equal('topic', topic)]
      );

      return posts.documents;
    } catch (error) {
      console.error("Error fetching posts by topic:", error);
      return [];
    }
  }

  export const extractContentFromPosts = (posts: any[]) => {
    return posts.map(post => post.content).join(' ');
  }

// ============================== CHAT ROOMS ==============================
export async function getChatRooms() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;

    const rooms = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.chatRoomsCollectionId,
      [
        Query.search('participants', currentUser.$id),
        Query.orderDesc('$updatedAt'),
      ]
    );

    return rooms;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createChatRoom(name: string, participants: string[]) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;

    // Include current user in participants if not already included
    if (!participants.includes(currentUser.$id)) {
      participants.push(currentUser.$id);
    }

    const newRoom = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.chatRoomsCollectionId,
      ID.unique(),
      {
        name,
        participants,
        createdBy: currentUser.$id,
      }
    );

    return newRoom;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== MESSAGES ==============================
export async function getChatMessages(roomId: string, limit: number = 50) {
  try {
    const messages = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      [
        Query.equal('roomId', roomId),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
      ]
    );

    return messages;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function sendMessage(roomId: string, content: string, attachments?: { type: string; url: string; name: string }[]) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw Error;

    const newMessage = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      ID.unique(),
      {
        roomId,
        content,
        sender: currentUser.$id,
        attachments,
      }
    );

    // Update the chat room's lastMessage and updatedAt
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.chatRoomsCollectionId,
      roomId,
      {
        lastMessage: content,
        lastMessageAt: new Date().toISOString(),
      }
    );

    return newMessage;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getEvents(){
  const response = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.eventsCollectionId,
    [Query.orderDesc('$createdAt'), Query.limit(20)]
  );
  
  if(!response) throw Error;

  const events = response.documents.map((doc) => ({
    title: doc.title,
    details: doc.details,
    userId: doc.userId,
    date: doc.date,
    time: doc.time,
    creator: {
      id: doc.creator.id,
      username: doc.creator.username,
      imageUrl: doc.creator.imageUrl
    }
  }));

  return events;
}

export async function createEvent(event: {
  title: string;
  details: string;
  date: string;
  time: string;
  userId: string;
  creator: {
    id: string;
    username: string;
    imageUrl?: string;
  };
}) {
  try {
    const newEvent = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.eventsCollectionId,
      ID.unique(),
      event
    );

    if (!newEvent) throw Error;

    return newEvent;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}
