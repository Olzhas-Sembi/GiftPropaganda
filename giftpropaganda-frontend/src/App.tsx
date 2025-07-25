import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchNews, NewsResponse, NewsItem } from './api/news';

const AppContainer = styled.div`
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  color: #333;
  padding: 20px;
`;

const Header = styled.header`
  background-color: #0088cc;
  color: white;
  padding: 15px;
  text-align: center;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NewsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0;
`;

const NewsItemCard = styled.li`
  background-color: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Title = styled.h2`
  color: #0088cc;
  margin: 0 0 10px;
  font-size: 1.2em;
`;

const Content = styled.p`
  color: #666;
  margin: 5px 0;
  font-size: 0.9em;
`;

const Link = styled.a`
  color: #0088cc;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

const CategoryDate = styled.p`
  color: #999;
  font-size: 0.8em;
  margin: 5px 0 0;
`;

const Message = styled.p`
  text-align: center;
  color: #666;
`;

const App: React.FC = () => {
  const [news, setNews] = useState<NewsResponse>({ status: 'success', data: [], message: '' });

  useEffect(() => {
    const getNews = async () => {
      const data = await fetchNews();
      setNews(data);
    };
    getNews();
    const interval = setInterval(getNews, 60000); // Обновление каждую минуту
    return () => clearInterval(interval); // Очистка при размонтировании
  }, []);

  return (
    <AppContainer>
      <Header>
        <h1>Новости от Telegram</h1>
      </Header>
      {news.status === 'success' ? (
        news.data.length > 0 ? (
          <NewsList>
            {news.data.map((item: NewsItem) => (
              <NewsItemCard key={item.id}>
                <Title>{item.title}</Title>
                <Content>{item.content}</Content>
                <Link href={item.link} target="_blank" rel="noopener noreferrer">
                  Читать полностью
                </Link>
                <CategoryDate>
                  Категория: {item.category} | Дата: {new Date(item.publish_date).toLocaleDateString()}
                </CategoryDate>
              </NewsItemCard>
            ))}
          </NewsList>
        ) : (
          <Message>{news.message}</Message>
        )
      ) : (
        <Message>Ошибка загрузки новостей</Message>
      )}
    </AppContainer>
  );
};

export default App;