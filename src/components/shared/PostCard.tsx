import { multiFormatDateString } from '@/lib/utils';
import { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';  // Assuming you have a Button component
import { useChildPostCount, useGetPostById } from '@/lib/react-query/queriesAndMutations';
import { Badge } from '../ui/badge';


type PostCardProps = {
  post: Models.Document;
  isChild?: boolean;
};

const PostCard = ({ post }: PostCardProps) => {
  console.log(post)
  const { data: childPostCount, isLoading } = useChildPostCount(post.$id);
  const { data: parentPost, isLoading: isParentPostLoading } = useGetPostById(post.parentId || '');
  return (
    <div className="post-card mb-6">
      {/* Breadcrumb Navigation */}
      {post.parentId && (
        <div className="breadcrumb mb-2 text-sm text-light-3">
          <Link to={`/post/${post.parentId}`} className="text-primary">
            Parent Post
          </Link> {'>'} <span>Current Post</span>
        </div>
      )}

      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.userId}`}>
            <img
              src={
                post.creator?.imgurl || 'assets/icons/profile-placeholder.svg'
              }
              alt="creator"
              className="w-10 h-10 rounded-full object-cover"
            />
          </Link>
          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.creator?.username || 'Unknown User'}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString(post.$createdAt)}
              </p>
              <Badge variant='outline' className="subtle-semibold lg:small-regular">
                {post?.location}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      
      <Link to={`/post/${post.$id}`}>
        <p className="small-medium lg:base-medium py-5">
          {post?.content}
        </p>
        
        <p className="flex gap-1 mt-2 text-light-3">
          Topic: {post.topic}!
        </p>
      </Link>
      {!post.parentId && (
          <div className="mt-2 text-light-3">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <span>{childPostCount} Replies</span>
            )}
          </div>
        )}

      {/* Button to navigate to the parent post */}
      {post.parentId && (
        <div className="mt-4">
          <Link to={`/post/${post.parentId}`}>
            <Button className="shad-button_primary">
              Replied to {isParentPostLoading ? 'Loading...' : parentPost?.creator.username || 'Unknown Post'}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default PostCard;
