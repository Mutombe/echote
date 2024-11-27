const CommentThread = ({ quoteId }) => {
    const dispatch = useDispatch();
    const comments = useSelector(state => state.comments.items);
    const [newCommentText, setNewCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
  
    useEffect(() => {
      dispatch(fetchCommentsByQuote(quoteId));
    }, [quoteId, dispatch]);
  
    const handleSubmitComment = () => {
      dispatch(createNestedComment({
        quoteId,
        text: newCommentText,
        parentId: replyingTo
      }));
      setNewCommentText('');
      setReplyingTo(null);
    };
  
    const renderComments = (comments, parentId = null) => {
      return comments
        .filter(comment => comment.parent === parentId)
        .map(comment => (
          <div key={comment.id} className="pl-4 border-l-2">
            <div className="flex items-center space-x-2">
              <img 
                src={comment.user.avatar || '/default-avatar.png'} 
                alt={comment.user.username} 
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-semibold">{comment.user.username}</p>
                <p>{comment.content}</p>
              </div>
            </div>
            <button 
              onClick={() => setReplyingTo(comment.id)}
              className="text-sm text-blue-500"
            >
              Reply
            </button>
            {renderComments(comments, comment.id)}
          </div>
        ));
    };
  
    return (
      <div className="comment-thread">
        {renderComments(comments)}
        <div className="comment-input">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={replyingTo ? "Reply to comment" : "Write a comment..."}
          />
          <button onClick={handleSubmitComment}>
            {replyingTo ? "Reply" : "Comment"}
          </button>
        </div>
      </div>
    );
  };