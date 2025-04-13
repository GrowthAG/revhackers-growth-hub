
import { getFrameworkImage, getArticleImageBySlug } from '../components/blog/post/articles/utils/frameworkImages';

const useFrameworkImage = () => {
  return { 
    getFrameworkImage,
    getArticleImageBySlug 
  };
};

export default useFrameworkImage;
