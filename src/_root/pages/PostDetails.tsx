
import { Link, useParams } from 'react-router-dom';
import CommentForm from '@/components/forms/CommentForm';
import Loader from '@/components/shared/Loader';
import { useGetPostById, useGetPostsByParent } from '@/lib/react-query/queriesAndMutations';
import { multiFormatDateString } from '@/lib/utils';
import CommentCard from '@/components/shared/CommentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PostDetails = () => {
  const { id } = useParams();
  const { data: post, isPending: isPostLoading } = useGetPostById(id || '');
  const { data: comments, isPending: isCommentsLoading } = useGetPostsByParent(id || '');

  if (isPostLoading) {
    return <Loader />;
  }


  return (
    <div className="post_details-container">
      {post && (
        <div className="post-card">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.userId}`}>
                <img
                  src={post.creator?.imgurl || 'assets/icons/profile-placeholder.svg'}
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
            <p className="subtle-semibold lg:small-regular text-light-3">
              Topic: {post?.topic}!
            </p>
          </Link>
          {post.parentId && (
            <div className="mt-4">
              <Link to={`/post/${post.parentId}`}>
                <Button className="shad-button_primary">
                  View Parent Post
                </Button>
              </Link>
            </div>
          )}
          <CommentForm postId={post.$id} />
        </div>
      )}

      {/* Comments Section */}
      {isCommentsLoading ? (
        <Loader />
      ) : (
        comments?.documents.map((comment) => (
          <CommentCard key={comment.$id} post={comment} />
        ))
      )}
    </div>
  );
};

export default PostDetails;
