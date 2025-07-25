import React from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  padding: 16px;
  background-color: var(--tg-theme-bg-color, #ffffff);
  border-bottom: 1px solid var(--tg-theme-hint-color, #e0e0e0);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--tg-theme-hint-color, #e0e0e0);
  border-radius: 12px;
  background-color: var(--tg-theme-secondary-bg-color, #f8f9fa);
  color: var(--tg-theme-text-color, #000000);
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--tg-theme-button-color, #007AFF);
  }

  &::placeholder {
    color: var(--tg-theme-hint-color, #999999);
  }
`;

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Поиск..." }) => {
  return (
    <SearchContainer>
      <SearchInput
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </SearchContainer>
  );
};

export default SearchBar;
