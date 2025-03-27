import {RedditIcon} from "react-share";

const RedditShare = ({id, url, title}) => {
  const handleRedditShare = () => {
    var redditUrl = 'https://new.reddit.com/r/seechat/submit?';
    redditUrl += 'title=' + encodeURIComponent(title);
    redditUrl += '&url=' + encodeURIComponent(url);
    redditUrl += '&type=LINK';

    window.open(redditUrl, '_blank');
    return false;
  };

  return (
    <button
      id={id}
      className="flex flex-col items-center mx-2"
      onClick={handleRedditShare}
    >
      <div className="bg-red-100 p-4 rounded-full flex items-center justify-center w-16 h-16">
        <RedditIcon size={32} round />
      </div>
      <span className="mt-2 text-sm text-center">
        Share on
        <br />
        Reddit
      </span>
    </button>

  );
};

export default RedditShare;
