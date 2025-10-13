import React from 'react';

const ArticlePage = ({ params }: { params: { slug: string } }) => {
  return (
    <div>
      <h1>Article: {params.slug}</h1>
    </div>
  );
};

export default ArticlePage;
