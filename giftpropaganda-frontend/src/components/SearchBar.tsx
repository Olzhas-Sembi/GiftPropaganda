import React from 'react';
import styled from 'styled-components';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  background: var(--tg-theme-secondary-bg-color, #1a1a1a);
  border: 1px solid var(--tg-theme-hint-color, #333);
  border-radius: 12px;
  color: var(--tg-theme-text-color, #ffffff);
  font-size: 16px;
  font-family: inherit;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--tg-theme-button-color, #0088cc);
    box-shadow: 0 0 0 2px rgba(0, 136, 204, 0.2);
  }

  &::placeholder {
    color: var(--tg-theme-hint-color, #999);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--tg-theme-hint-color, #999);
  font-size: 16px;
  pointer-events: none;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--tg-theme-hint-color, #999);
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: ${props => props.style?.display || 'block'};

  &:hover {
    background: var(--tg-theme-hint-color, #333);
    color: var(--tg-theme-text-color, #ffffff);
  }
`;

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Поиск..." }) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <SearchContainer>
      <SearchIcon>🔍</SearchIcon>
      <SearchInput
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <ClearButton onClick={handleClear}>×</ClearButton>
      )}
    </SearchContainer>
  );
};

export default SearchBar;
