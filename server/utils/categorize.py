import re
from typing import List, Dict

def categorize_content(title: str, content: str = "") -> str:
    """Автоматическая категоризация контента по ключевым словам"""

    # Ключевые слова для категорий
    keywords = {
        'gifts': ['подарок', 'подарки', 'бесплатно', 'халява', 'промокод', 'скидка', 'акция', 'розыгрыш'],
        'crypto': ['криптовалюта', 'биткоин', 'bitcoin', 'ethereum', 'блокчейн', 'деф', 'defi', 'btc', 'eth'],
        'nft': ['nft', 'нфт', 'токен', 'коллекция', 'opensea', 'digital art', 'метавселенная'],
        'tech': ['технологии', 'it', 'ит', 'программирование', 'разработка', 'стартап', 'ai', 'ии']
    }

    text = (title + " " + content).lower()

    # Подсчитываем совпадения для каждой категории
    category_scores = {}
    for category, words in keywords.items():
        score = sum(1 for word in words if word in text)
        if score > 0:
            category_scores[category] = score

    if not category_scores:
        return 'general'

    # Возвращаем категорию с наибольшим количеством совпадений
    return max(category_scores, key=category_scores.get)

def extract_keywords(text: str) -> List[str]:
    """Извлечение ключевых слов из текста"""
    # Простое извлечение слов длиннее 3 символов
    words = re.findall(r'\b\w{4,}\b', text.lower())
    return list(set(words))  # Уникальные слова
