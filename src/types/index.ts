export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
}

export type INavLink = {
    imgURL: string;
    route: string;
    label: string;
  };
  
  export type IUpdateUser = {
    userId: string;
    username: string;
    bio: string;
    imageId: string;
    imageUrl: URL | string;
    file: File[];
    // location: string;
  };
  
  export type INewPost = {
    userId: string;
    content: string;
    location: string;
    // community: string;
    topic?: string;
    parentId: string;
  };
  
  export type IUpdatePost = {
    postId: string;
    caption: string;
    imageId: string;
    imageUrl: URL;
    file: File[];
    location?: string;
    tags?: string;
  };
  
  export type IUser = {
    id: string;
    username: string;
    email: string;
    imageUrl: string;
    bio: string;
    // location: string;
  };
  
  export type INewUser = {
    email: string;
    username: string;
    password: string;
    // location: string;
  };

  export type INewComment = {
    content: string;
    userId: string;
    postId: string;
    parentCommentId: string;
    replies?: INewComment[];
    commentId: string;
  }